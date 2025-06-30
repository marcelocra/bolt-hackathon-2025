import { supabase } from "./supabaseClient";
import type { Entry, ProcessAudioResponse } from "../types";

/**
 * API service for handling audio processing and database operations
 */

// Debug flag to enable/disable ElevenLabs integration
const ENABLE_ELEVENLABS = true; // Set to false to use placeholder implementation

export class ApiService {
  /**
   * Process audio - now only handles transcription, not audio enhancement
   */
  static async processAudio(audioBlob: Blob): Promise<ProcessAudioResponse> {
    try {
      // Generate transcription only
      const transcription = await ApiService.generateTranscription(audioBlob);

      console.log(
        "Audio processing completed successfully (transcription only)"
      );

      return {
        transcription,
        processedAudioUrl: null, // No longer processing audio, just transcription
        success: true,
      };
    } catch (error) {
      console.error("Error processing audio:", error);

      return {
        transcription: "Transcription failed - please try again",
        processedAudioUrl: null,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during transcription",
      };
    }
  }

  /**
   * Generate transcription from audio blob using ElevenLabs Speech-to-Text API
   */
  static async generateTranscription(audioBlob: Blob): Promise<string> {
    if (!ENABLE_ELEVENLABS) {
      // Placeholder implementation for development
      console.log(
        "ElevenLabs integration disabled - using placeholder transcription"
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return `Placeholder transcription generated on ${new Date().toLocaleString()} - Duration: ${Math.round(
        audioBlob.size / 1000
      )}KB`;
    }

    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

      if (!apiKey) {
        console.warn(
          "ElevenLabs API key not found, using placeholder transcription"
        );
        return `Transcription generated on ${new Date().toLocaleString()} - Duration: ${Math.round(
          audioBlob.size / 1000
        )}KB`;
      }

      // Validate API key format
      if (!apiKey.startsWith("sk_")) {
        console.warn(
          "Invalid ElevenLabs API key format, using placeholder transcription"
        );
        return `Transcription generated on ${new Date().toLocaleString()} - Duration: ${Math.round(
          audioBlob.size / 1000
        )}KB`;
      }

      console.log("Generating transcription with ElevenLabs...");

      // Prepare form data for ElevenLabs Speech-to-Text API
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("model_id", "whisper-1"); // Use Whisper model for transcription

      // Call ElevenLabs Speech-to-Text API
      const response = await fetch("/api/elevenlabs/v1/speech-to-text", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "ElevenLabs transcription API error:",
          response.status,
          errorText
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      if (result.text) {
        console.log("Transcription generated successfully");
        return result.text;
      } else {
        throw new Error("No transcription text returned from API");
      }
    } catch (error) {
      console.error("Error generating transcription with ElevenLabs:", error);
      // Fallback to placeholder if API fails
      return `Transcription failed on ${new Date().toLocaleString()} - please try again later. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  /**
   * Upload original audio file to Supabase storage
   */
  static async uploadAudio(
    audioBlob: Blob,
    fileName: string,
    userId: string
  ): Promise<string | null> {
    try {
      // Create user-specific path
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("audio-recordings")
        .upload(filePath, audioBlob, {
          contentType: "audio/webm",
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("audio-recordings")
        .getPublicUrl(data.path);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error uploading audio:", error);
      return null;
    }
  }

  /**
   * Save audio entry to database
   */
  static async saveEntry(
    entry: Omit<Entry, "id" | "created_at" | "updated_at">
  ): Promise<Entry | null> {
    try {
      const { data, error } = await supabase
        .from("entries")
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving entry:", error);
      return null;
    }
  }

  /**
   * Update entry transcription in database
   */
  static async updateEntryTranscription(
    entryId: string,
    transcription: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("entries")
        .update({ transcription, updated_at: new Date().toISOString() })
        .eq("id", entryId);

      return !error;
    } catch (error) {
      console.error("Error updating entry transcription:", error);
      return false;
    }
  }

  /**
   * Fetch user's audio entries
   */
  static async fetchEntries(userId: string): Promise<Entry[]> {
    try {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching entries:", error);
      return [];
    }
  }

  /**
   * Delete an audio entry and its associated files
   */
  static async deleteEntry(entryId: string): Promise<boolean> {
    try {
      // First get the entry to find associated files
      const { data: entry, error: fetchError } = await supabase
        .from("entries")
        .select("original_audio_url, processed_audio_url, user_id")
        .eq("id", entryId)
        .single();

      if (fetchError) throw fetchError;

      // Delete associated audio files from storage
      const filesToDelete: string[] = [];

      if (entry.original_audio_url) {
        const originalPath = entry.original_audio_url.split("/").pop();
        if (originalPath) {
          filesToDelete.push(`${entry.user_id}/${originalPath}`);
        }
      }

      if (
        entry.processed_audio_url &&
        entry.processed_audio_url !== entry.original_audio_url
      ) {
        const processedPath = entry.processed_audio_url.split("/").pop();
        if (processedPath) {
          filesToDelete.push(`${entry.user_id}/${processedPath}`);
        }
      }

      // Delete files from storage
      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("audio-recordings")
          .remove(filesToDelete);

        if (storageError) {
          console.warn("Error deleting storage files:", storageError);
        }
      }

      // Delete the database entry
      const { error: deleteError } = await supabase
        .from("entries")
        .delete()
        .eq("id", entryId);

      return !deleteError;
    } catch (error) {
      console.error("Error deleting entry:", error);
      return false;
    }
  }
}
