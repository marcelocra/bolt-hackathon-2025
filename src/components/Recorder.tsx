import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Loader2,
  Save,
  AlertCircle,
  Globe,
} from "lucide-react";
import { ApiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getUserSettings } from "../utils/settings";
import type { AudioRecordingState } from "../types";

/**
 * Ultra-compact voice recorder component with single-row design
 */

interface RecorderProps {
  onEntryCreated?: () => void;
}

export const Recorder: React.FC<RecorderProps> = ({ onEntryCreated }) => {
  const { user } = useAuth();
  const [recordingState, setRecordingState] = useState<AudioRecordingState>({
    isRecording: false,
    isLoading: false,
    isPlaying: false,
    audioBlob: null,
    duration: 0,
    error: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const userSettings = getUserSettings();
    console.log("Initial recorder settings:", userSettings);
    console.log("Setting selectedLanguage to:", userSettings.defaultLanguage);
    // Always start with the user's default language, regardless of auto-detect setting
    // This gives them a proper starting point and shows their preference
    return userSettings.defaultLanguage;
  });

  // Update language when recording stops to respect settings
  useEffect(() => {
    if (recordingState.audioBlob) {
      const userSettings = getUserSettings();
      // If auto-detect is enabled, we could auto-detect, but for UX consistency,
      // let's keep showing their default language so they can change it if needed
      // Always show the user's default language in the dropdown
      setSelectedLanguage(userSettings.defaultLanguage);
    }
  }, [recordingState.audioBlob]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        throw new Error("Audio recording is not supported in this browser");
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          audioBlob,
        }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setRecordingState((prev) => ({
          ...prev,
          error: "Recording failed. Please try again.",
          isRecording: false,
        }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000),
        }));
      }, 1000);

      setRecordingState((prev) => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
      }));
    } catch (error) {
      console.error("Error starting recording:", error);
      let errorMessage = "Failed to access microphone.";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Microphone access denied. Please allow microphone permissions and try again.";
        } else if (error.name === "NotFoundError") {
          errorMessage =
            "No microphone found. Please connect a microphone and try again.";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "Audio recording is not supported in this browser.";
        } else {
          errorMessage = error.message;
        }
      }

      setRecordingState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [recordingState.isRecording]);

  const playRecording = useCallback(() => {
    if (recordingState.audioBlob && !recordingState.isPlaying) {
      const audioUrl = URL.createObjectURL(recordingState.audioBlob);
      audioRef.current = new Audio(audioUrl);

      audioRef.current.onended = () => {
        setRecordingState((prev) => ({ ...prev, isPlaying: false }));
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.onerror = () => {
        setRecordingState((prev) => ({
          ...prev,
          isPlaying: false,
          error: "Failed to play recording. Please try recording again.",
        }));
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setRecordingState((prev) => ({
          ...prev,
          isPlaying: false,
          error: "Failed to play recording. Please try recording again.",
        }));
        URL.revokeObjectURL(audioUrl);
      });

      setRecordingState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [recordingState.audioBlob, recordingState.isPlaying]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current && recordingState.isPlaying) {
      audioRef.current.pause();
      setRecordingState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [recordingState.isPlaying]);

  const saveRecording = useCallback(async () => {
    if (!recordingState.audioBlob || !user) return;

    setRecordingState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (recordingState.audioBlob.size === 0) {
        throw new Error("Recording is empty. Please try recording again.");
      }

      const fileName = `recording_${Date.now()}.webm`;
      const originalAudioUrl = await ApiService.uploadAudio(
        recordingState.audioBlob,
        fileName,
        user.id
      );

      if (!originalAudioUrl) {
        throw new Error(
          "Failed to upload audio file. Please check your internet connection and try again."
        );
      }

      // Determine the language to use for processing
      const userSettings = getUserSettings();
      const languageForProcessing = userSettings.autoDetectLanguage
        ? ApiService.detectUserLanguage() // Use auto-detected language for processing
        : selectedLanguage; // Use the manually selected language

      console.log(
        "Processing audio for transcription with language:",
        languageForProcessing,
        "(auto-detect:",
        userSettings.autoDetectLanguage,
        ")"
      );
      const processResult = await ApiService.processAudio(
        recordingState.audioBlob,
        languageForProcessing
      );

      const now = new Date();
      const title = `Founder Log - ${now.toLocaleDateString()} ${now.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`;

      const entry = await ApiService.saveEntry({
        user_id: user.id,
        title,
        original_audio_url: originalAudioUrl,
        processed_audio_url: originalAudioUrl,
        transcription: processResult.transcription,
        duration: recordingState.duration,
      });

      if (entry) {
        console.log("Entry saved successfully:", entry.id);
        setRecordingState({
          isRecording: false,
          isLoading: false,
          isPlaying: false,
          audioBlob: null,
          duration: 0,
          error: null,
        });
        onEntryCreated?.();
      } else {
        throw new Error(
          "Failed to save recording to database. Please try again."
        );
      }
    } catch (error) {
      console.error("Error saving recording:", error);
      setRecordingState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save recording. Please try again.",
      }));
    }
  }, [
    recordingState.audioBlob,
    recordingState.duration,
    user,
    onEntryCreated,
    selectedLanguage,
  ]);

  const resetRecording = useCallback(() => {
    setIsDeleting(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingState({
        isRecording: false,
        isLoading: false,
        isPlaying: false,
        audioBlob: null,
        duration: 0,
        error: null,
      });
      setIsDeleting(false);
    }, 300);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-slate-700/50">
        {/* Ultra-compact header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white">AI Founder Log</h2>
            <p className="text-xs text-slate-400">
              Capture your startup insights
            </p>
          </div>
        </div>

        {/* Single-row interface */}
        {!recordingState.audioBlob ? (
          // Recording interface - all in one row
          <div className="flex items-center gap-4 bg-slate-700/30 rounded-lg p-3">
            <button
              onClick={
                recordingState.isRecording ? stopRecording : startRecording
              }
              disabled={recordingState.isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                recordingState.isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/25"
                  : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/25"
              }`}
            >
              {recordingState.isRecording ? (
                <Square className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>

            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-white font-mono text-lg">
                  {formatDuration(recordingState.duration)}
                </p>
              </div>
              <p className="text-slate-400 text-sm">
                {recordingState.isRecording
                  ? "Recording... Tap to stop"
                  : "Tap to start recording"}
              </p>
            </div>
          </div>
        ) : (
          // Save interface - compact and inline
          <div
            className={`space-y-3 transition-all duration-300 ${
              isDeleting
                ? "opacity-0 scale-95 transform"
                : "opacity-100 scale-100"
            }`}
          >
            {/* Playback and controls in one row */}
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={
                      recordingState.isPlaying ? pausePlayback : playRecording
                    }
                    disabled={recordingState.isLoading || isDeleting}
                    className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    {recordingState.isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                  <div>
                    <p className="text-white font-mono text-sm">
                      {formatDuration(recordingState.duration)}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {recordingState.isPlaying ? "Playing..." : "Preview"}
                    </p>
                  </div>
                </div>

                {/* Language selection inline */}
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={recordingState.isLoading || isDeleting}
                  >
                    {ApiService.getSupportedLanguages().map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={resetRecording}
                  disabled={recordingState.isLoading || isDeleting}
                  className={`flex-1 py-2.5 px-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-600/50 text-white rounded-lg transition-all duration-200 font-medium text-sm ${
                    isDeleting ? "bg-red-500 animate-pulse" : ""
                  }`}
                >
                  {isDeleting ? "Deleting..." : "Discard"}
                </button>

                <button
                  onClick={saveRecording}
                  disabled={recordingState.isLoading || isDeleting}
                  className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-blue-500/25 text-sm"
                >
                  {recordingState.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Recording</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {recordingState.error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-xs font-medium mb-1">Error</p>
                <p className="text-red-300 text-xs">{recordingState.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;
