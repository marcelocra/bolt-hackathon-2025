import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  Trash2,
  Calendar,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  MoreVertical,
} from "lucide-react";
import { ApiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import type { Entry } from "../types";

/**
 * History list component displaying user's voice journal entries
 */

interface HistoryListProps {
  refreshTrigger?: number;
}

interface ExpandedTranscripts {
  [key: string]: boolean;
}

interface PlayingAudio {
  id: string;
  audio: HTMLAudioElement;
  progress: number;
  duration: number;
}

interface OpenMenus {
  [key: string]: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playingAudio, setPlayingAudio] = useState<PlayingAudio | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedTranscripts, setExpandedTranscripts] =
    useState<ExpandedTranscripts>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const [openMenus, setOpenMenus] = useState<OpenMenus>({});

  const fetchEntries = React.useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const fetchedEntries = await ApiService.fetchEntries(user.id);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, refreshTrigger]);

  const updateProgress = React.useCallback(() => {
    if (playingAudio) {
      const progress =
        (playingAudio.audio.currentTime / playingAudio.audio.duration) * 100;
      setPlayingAudio((prev) => (prev ? { ...prev, progress } : null));
    }
  }, [playingAudio]);

  const handleAudioEnded = React.useCallback(() => {
    setPlayingAudio(null);
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.audio.pause();
        playingAudio.audio.removeEventListener("timeupdate", updateProgress);
        playingAudio.audio.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, [playingAudio, updateProgress, handleAudioEnded]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenus({});
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const playAudio = async (entry: Entry) => {
    // Stop current audio if playing
    if (playingAudio) {
      playingAudio.audio.pause();
      playingAudio.audio.removeEventListener("timeupdate", updateProgress);
      playingAudio.audio.removeEventListener("ended", handleAudioEnded);
    }

    // Prioritize processed audio URL for better browser compatibility, fallback to original
    const audioPath = entry.processed_audio_url || entry.original_audio_url;
    if (!audioPath) {
      console.error("No audio path available for playback");
      return;
    }

    try {
      // Create a signed URL for the private audio file (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from("audio-recordings")
        .createSignedUrl(audioPath, 3600);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      const audio = new Audio(data.signedUrl);

      audio.addEventListener("loadedmetadata", () => {
        setPlayingAudio({
          id: entry.id,
          audio,
          progress: 0,
          duration: audio.duration,
        });

        // Play the audio after metadata is loaded
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          setPlayingAudio(null);
        });
      });

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", handleAudioEnded);

      // Handle loading errors
      audio.addEventListener("error", (error) => {
        console.error("Error loading audio:", error);
        setPlayingAudio(null);
      });
    } catch (error) {
      console.error("Error creating signed URL or playing audio:", error);
      setPlayingAudio(null);
    }
  };

  const pauseAudio = () => {
    if (playingAudio) {
      playingAudio.audio.pause();
      setPlayingAudio(null);
    }
  };

  const toggleMenu = (entryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenus((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  const confirmDelete = (entryId: string) => {
    setShowDeleteConfirm(entryId);
    setOpenMenus({});
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const deleteEntry = async (entryId: string) => {
    setDeletingId(entryId);
    setShowDeleteConfirm(null);

    // Add a small delay to show the delete animation
    setTimeout(async () => {
      try {
        const success = await ApiService.deleteEntry(entryId);
        if (success) {
          // Animate out before removing from state
          setTimeout(() => {
            setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
            // Stop audio if the deleted entry was playing
            if (playingAudio && playingAudio.id === entryId) {
              playingAudio.audio.pause();
              setPlayingAudio(null);
            }
            setDeletingId(null);
          }, 300); // Match animation duration
        } else {
          setDeletingId(null);
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
        setDeletingId(null);
      }
    }, 100); // Small delay to show initial delete state
  };

  const toggleTranscript = (entryId: string) => {
    setExpandedTranscripts((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  const generateTranscript = async (entryId: string) => {
    setTranscribingId(entryId);
    setOpenMenus({});

    try {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry || !entry.original_audio_url) {
        throw new Error("Entry or audio URL not found");
      }

      // Create a signed URL for the private audio file
      const { data, error } = await supabase.storage
        .from("audio-recordings")
        .createSignedUrl(entry.original_audio_url, 3600);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      // Fetch the audio blob using the signed URL
      const response = await fetch(data.signedUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audio: ${response.status} ${response.statusText}`
        );
      }

      const audioBlob = await response.blob();

      // Generate transcription using the API service
      const transcription = await ApiService.generateTranscription(audioBlob);

      // Update the entry with the transcription
      const updatedEntries = entries.map((e) => {
        if (e.id === entryId) {
          return {
            ...e,
            transcription,
          };
        }
        return e;
      });

      setEntries(updatedEntries);

      // Also update the database
      await ApiService.updateEntryTranscription(entryId, transcription);
    } catch (error) {
      console.error("Error generating transcript:", error);
    } finally {
      setTranscribingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatProgress = (currentTime: number): string => {
    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const truncateText = (
    text: string,
    maxLines: number = 2
  ): { truncated: string; needsExpansion: boolean } => {
    const words = text.split(" ");
    const wordsPerLine = 12; // Approximate words per line
    const maxWords = maxLines * wordsPerLine;

    if (words.length <= maxWords) {
      return { truncated: text, needsExpansion: false };
    }

    return {
      truncated: words.slice(0, maxWords).join(" ") + "...",
      needsExpansion: true,
    };
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No founder logs yet
            </h3>
            <p className="text-slate-400">
              Start recording your first startup insight!
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Your Founder Log</h2>
          <p className="text-slate-400 text-sm mt-1">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="divide-y divide-slate-700/30">
          {entries.map((entry) => {
            const isPlaying = playingAudio?.id === entry.id;
            const isExpanded = expandedTranscripts[entry.id];
            const transcriptData = entry.transcription
              ? truncateText(entry.transcription)
              : null;
            const isMenuOpen = openMenus[entry.id];
            const isDeleting = deletingId === entry.id;

            return (
              <div
                key={entry.id}
                className={`p-4 sm:p-6 hover:bg-slate-700/20 transition-all duration-300 ${
                  isDeleting
                    ? "opacity-0 scale-95 transform bg-red-500/10 border-red-500/20"
                    : "opacity-100 scale-100"
                }`}
              >
                {/* Main content */}
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    isDeleting ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {/* Header with title, play button, and actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Play/Pause button */}
                      <button
                        onClick={() =>
                          isPlaying ? pauseAudio() : playAudio(entry)
                        }
                        disabled={
                          (!entry.original_audio_url &&
                            !entry.processed_audio_url) ||
                          isDeleting
                        }
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg flex-shrink-0 mt-1 ${
                          isDeleting
                            ? "bg-red-500/50 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed hover:shadow-blue-500/25"
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </button>

                      {/* Title and metadata */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium mb-2 truncate">
                          {entry.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(entry.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(entry.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions menu */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => toggleMenu(entry.id, e)}
                        disabled={isDeleting}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isDeleting
                            ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                            : "bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown menu */}
                      {isMenuOpen && !isDeleting && (
                        <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl z-10 min-w-48">
                          <div className="py-2">
                            <button
                              onClick={() =>
                                entry.transcription
                                  ? toggleTranscript(entry.id)
                                  : generateTranscript(entry.id)
                              }
                              disabled={transcribingId === entry.id}
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2"
                            >
                              {transcribingId === entry.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4" />
                                  <span>
                                    {entry.transcription
                                      ? "View Transcript"
                                      : "Generate Transcript"}
                                  </span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => confirmDelete(entry.id)}
                              disabled={deletingId === entry.id}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2"
                            >
                              {deletingId === entry.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Entry</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio progress bar */}
                  {isPlaying && playingAudio && (
                    <div className="space-y-2">
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${playingAudio.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>
                          {formatProgress(playingAudio.audio.currentTime)}
                        </span>
                        <span>{formatProgress(playingAudio.duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Transcript section */}
                  {transcriptData && (
                    <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {isExpanded
                          ? entry.transcription
                          : transcriptData.truncated}
                      </p>

                      {transcriptData.needsExpansion && (
                        <button
                          onClick={() => toggleTranscript(entry.id)}
                          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>Show less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>Show more</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete confirmation modal - rendered using portal for proper viewport centering */}
      {showDeleteConfirm &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700/50 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Delete Entry
                  </h3>
                  <p className="text-slate-400 text-sm">
                    This will permanently delete "
                    {entries.find((e) => e.id === showDeleteConfirm)?.title}"
                    and all associated audio files. This action cannot be
                    undone.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteEntry(showDeleteConfirm)}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default HistoryList;
