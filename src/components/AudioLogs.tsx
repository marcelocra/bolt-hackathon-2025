import React, { useState, useEffect } from "react";
import { Trash2, Calendar, Loader2, RefreshCw } from "lucide-react";
import { ApiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { getUserSettings } from "../utils/settings";
import { ConfirmationModal } from "./ConfirmationModal";
import type { Entry } from "../types";
import AudioLog from "./AudioLog";

/**
 * Audio logs component displaying user's voice journal entries with integrated player
 */

interface AudioLogsProps {
  refreshTrigger?: number;
}

export const AudioLogs: React.FC<AudioLogsProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showTranscriptUpdateConfirm, setShowTranscriptUpdateConfirm] =
    useState<string | null>(null);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);

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

  const confirmDelete = (entryId: string) => {
    setShowDeleteConfirm(entryId);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const confirmTranscriptUpdate = (entryId: string) => {
    setShowTranscriptUpdateConfirm(entryId);
  };

  const cancelTranscriptUpdate = () => {
    setShowTranscriptUpdateConfirm(null);
  };

  const proceedWithTranscriptUpdate = (entryId: string) => {
    setShowTranscriptUpdateConfirm(null);
    generateTranscript(entryId);
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

  const generateTranscript = async (entryId: string) => {
    setTranscribingId(entryId);

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

      // Use user's preferred language for transcription
      const userSettings = getUserSettings();
      const language = userSettings.autoDetectLanguage
        ? undefined // Let API auto-detect
        : userSettings.defaultLanguage;

      // Generate transcription using the API service with user's language preference
      const transcription = await ApiService.generateTranscription(
        audioBlob,
        language
      );

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
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50">
        <div className="p-4 sm:p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Your Founder Log</h2>
          <p className="text-slate-400 text-sm mt-1">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="divide-y divide-slate-700/30">
          {entries.map((entry, index) => {
            const isDeleting = deletingId === entry.id;
            const isLastItem = index === entries.length - 1;

            return (
              <div key={entry.id} className={isLastItem ? "rounded-b-2xl" : ""}>
                <AudioLog
                  entry={entry}
                  isDeleting={isDeleting}
                  transcribingId={transcribingId}
                  onDelete={confirmDelete}
                  onTranscriptUpdate={confirmTranscriptUpdate}
                  onGenerateTranscript={generateTranscript}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!showDeleteConfirm}
        onConfirm={() => deleteEntry(showDeleteConfirm!)}
        onCancel={cancelDelete}
        title="Delete Entry"
        message={`This will permanently delete "${
          entries.find((e) => e.id === showDeleteConfirm)?.title
        }" and all associated audio files. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        icon={Trash2}
        iconClass="text-red-400"
        iconBgClass="bg-red-500/20"
      />

      <ConfirmationModal
        isOpen={!!showTranscriptUpdateConfirm}
        onConfirm={() =>
          proceedWithTranscriptUpdate(showTranscriptUpdateConfirm!)
        }
        onCancel={cancelTranscriptUpdate}
        title="Update Transcript"
        message={`This will permanently replace the existing transcript for "${
          entries.find((e) => e.id === showTranscriptUpdateConfirm)?.title
        }". The previous transcription will be lost and cannot be recovered.`}
        confirmText="Update"
        cancelText="Cancel"
        confirmButtonClass="bg-orange-500 hover:bg-orange-600"
        icon={RefreshCw}
        iconClass="text-orange-400"
        iconBgClass="bg-orange-500/20"
      />
    </div>
  );
};

export default AudioLogs;
