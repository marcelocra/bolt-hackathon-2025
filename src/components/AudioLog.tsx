import React, { useState } from "react";
import {
  Play,
  Pause,
  Trash2,
  Calendar,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import Slider from "./ui/Slider";
import type { Entry } from "../types";

/**
 * Unified audio log component that handles both display and playback
 */

interface AudioLogProps {
  entry: Entry;
  isDeleting: boolean;
  transcribingId: string | null;
  onDelete: (entryId: string) => void;
  onTranscriptUpdate: (entryId: string) => void;
  onGenerateTranscript: (entryId: string) => void;
}

export const AudioLog: React.FC<AudioLogProps> = ({
  entry,
  isDeleting,
  transcribingId,
  onDelete,
  onTranscriptUpdate,
  onGenerateTranscript,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds || !isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const truncateText = (
    text: string,
    maxLines: number = 2
  ): { truncated: string; needsExpansion: boolean } => {
    const words = text.split(" ");
    const wordsPerLine = 12;
    const maxWords = maxLines * wordsPerLine;

    if (words.length <= maxWords) {
      return { truncated: text, needsExpansion: false };
    }

    return {
      truncated: words.slice(0, maxWords).join(" ") + "...",
      needsExpansion: true,
    };
  };

  const loadAudio = async () => {
    if (audioElement) return audioElement;

    setIsLoadingAudio(true);
    try {
      const audioPath = entry.processed_audio_url || entry.original_audio_url;
      if (!audioPath) {
        throw new Error("No audio path available");
      }

      const { data, error } = await supabase.storage
        .from("audio-recordings")
        .createSignedUrl(audioPath, 3600);

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || "Failed to create signed URL");
      }

      const audio = new Audio(data.signedUrl);

      audio.addEventListener("loadedmetadata", () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        } else if (entry.duration && entry.duration > 0) {
          setDuration(entry.duration);
        }
      });

      audio.addEventListener("timeupdate", () => {
        if (isFinite(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
        }
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener("error", () => {
        console.error("Audio loading error");
        setIsPlaying(false);
      });

      setAudioElement(audio);
      setIsLoadingAudio(false);
      return audio;
    } catch (error) {
      console.error("Error loading audio:", error);
      setIsLoadingAudio(false);
      return null;
    }
  };

  const togglePlayPause = async () => {
    if (isLoadingAudio) return;

    let audio = audioElement;
    if (!audio) {
      audio = await loadAudio();
      if (!audio) return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (
      audioElement &&
      isFinite(duration) &&
      duration > 0 &&
      isFinite(newTime)
    ) {
      const clampedTime = Math.max(0, Math.min(duration, newTime));
      audioElement.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const transcriptData = entry.transcription
    ? truncateText(entry.transcription)
    : null;

  // Use fallback duration if audio duration not available
  const displayDuration = duration > 0 ? duration : entry.duration || 0;

  return (
    <div
      className={`relative p-4 sm:p-6 hover:bg-slate-700/20 transition-all duration-300 ${
        isDeleting
          ? "opacity-0 scale-95 transform bg-red-500/10 border-red-500/20"
          : "opacity-100 scale-100"
      } ${isMenuOpen ? "z-20" : "z-0"}`}
    >
      <div
        className={`space-y-4 transition-all duration-300 ${
          isDeleting ? "opacity-60" : "opacity-100"
        }`}
      >
        {/* Header with title and controls */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
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
              onClick={toggleMenu}
              disabled={isDeleting}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDeleting
                  ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                  : "bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-slate-300"
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && !isDeleting && (
              <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl z-10 min-w-48">
                <div className="py-2">
                  <button
                    onClick={() => {
                      if (entry.transcription) {
                        onTranscriptUpdate(entry.id);
                      } else {
                        onGenerateTranscript(entry.id);
                      }
                      setIsMenuOpen(false);
                    }}
                    disabled={transcribingId === entry.id}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    {transcribingId === entry.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {entry.transcription
                            ? "Updating..."
                            : "Generating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>
                          {entry.transcription
                            ? "Update Transcript"
                            : "Generate Transcript"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onDelete(entry.id);
                      setIsMenuOpen(false);
                    }}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Entry</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integrated Audio Player */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
          {/* Play controls and progress */}
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={
                (!entry.original_audio_url && !entry.processed_audio_url) ||
                isDeleting ||
                isLoadingAudio
              }
            >
              {isLoadingAudio ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            <div className="flex-1 space-y-2">
              <Slider
                value={[currentTime]}
                max={displayDuration || 100}
                min={0}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={
                  !displayDuration || displayDuration === 0 || isLoadingAudio
                }
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(displayDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript section */}
        {transcriptData && (
          <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
            <p className="text-slate-300 text-sm leading-relaxed">
              {isExpanded ? entry.transcription : transcriptData.truncated}
            </p>

            {transcriptData.needsExpansion && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
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
};

export default AudioLog;
