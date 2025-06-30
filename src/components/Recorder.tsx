import React, { useState, useRef, useCallback } from "react";
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
import type { AudioRecordingState } from "../types";

/**
 * Voice recorder component with MediaRecorder integration.
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
  const [selectedLanguage, setSelectedLanguage] = useState(() =>
    ApiService.detectUserLanguage()
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // Check for microphone permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Check if MediaRecorder is supported
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

        // Stop all tracks to release microphone
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

      mediaRecorder.start(1000); // Collect data every second

      // Start duration timer
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
      // Validate audio blob
      if (recordingState.audioBlob.size === 0) {
        throw new Error("Recording is empty. Please try recording again.");
      }

      // Upload original audio first
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

      // Process audio for transcription
      console.log("Processing audio for transcription...");
      const processResult = await ApiService.processAudio(
        recordingState.audioBlob,
        selectedLanguage
      );

      // Generate a more descriptive title
      const now = new Date();
      const title = `Founder Log - ${now.toLocaleDateString()} ${now.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`;

      // Save entry to database
      const entry = await ApiService.saveEntry({
        user_id: user.id,
        title,
        original_audio_url: originalAudioUrl,
        processed_audio_url: originalAudioUrl, // Use original URL since we're not processing audio anymore
        transcription: processResult.transcription,
        duration: recordingState.duration,
      });

      if (entry) {
        console.log("Entry saved successfully:", entry.id);

        // Reset recording state
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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetRecording = useCallback(() => {
    setIsDeleting(true);

    // Animate the deletion
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
    }, 300); // 300ms animation duration
  }, []);

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
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">AI Founder Log</h2>
          <p className="text-slate-400">
            Capture your startup insights and decisions
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-6 flex justify-center">
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-medium">
                Language:
              </span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={
                  recordingState.isRecording || recordingState.isLoading
                }
              >
                {ApiService.getSupportedLanguages().map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-6">
          {!recordingState.audioBlob ? (
            // Initial recording state
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={
                  recordingState.isRecording ? stopRecording : startRecording
                }
                disabled={recordingState.isLoading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  recordingState.isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/25"
                    : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/25"
                }`}
              >
                {recordingState.isRecording ? (
                  <Square className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>

              <div className="text-center">
                <p className="text-white font-mono text-lg">
                  {formatDuration(recordingState.duration)}
                </p>
                <p className="text-slate-400 text-sm">
                  {recordingState.isRecording
                    ? "Recording... Tap to stop"
                    : "Tap to start recording"}
                </p>
              </div>
            </div>
          ) : (
            // Playback and save controls
            <div
              className={`flex flex-col items-center space-y-6 w-full transition-all duration-300 ${
                isDeleting
                  ? "opacity-0 scale-95 transform"
                  : "opacity-100 scale-100"
              }`}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={
                    recordingState.isPlaying ? pausePlayback : playRecording
                  }
                  disabled={recordingState.isLoading || isDeleting}
                  className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  {recordingState.isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                <div className="text-center">
                  <p className="text-white font-mono">
                    {formatDuration(recordingState.duration)}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {recordingState.isPlaying ? "Playing..." : "Ready to save"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 w-full">
                <button
                  onClick={resetRecording}
                  disabled={recordingState.isLoading || isDeleting}
                  className={`flex-1 py-3 px-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-600/50 text-white rounded-lg transition-all duration-200 font-medium ${
                    isDeleting ? "bg-red-500 animate-pulse" : ""
                  }`}
                >
                  {isDeleting ? "Deleting..." : "Re-record"}
                </button>

                <button
                  onClick={saveRecording}
                  disabled={recordingState.isLoading || isDeleting}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-blue-500/25"
                >
                  {recordingState.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {recordingState.error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium mb-1">
                  Recording Error
                </p>
                <p className="text-red-300 text-sm">{recordingState.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recording tips */}
        {!recordingState.isRecording &&
          !recordingState.audioBlob &&
          !recordingState.error && (
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-center">
                <p className="text-blue-400 text-sm font-medium mb-2">
                  Founder Tips
                </p>
                <ul className="text-blue-300 text-xs space-y-1">
                  <li>• Record key decisions and their reasoning</li>
                  <li>• Capture market insights and customer feedback</li>
                  <li>• Document lessons learned and pivots</li>
                </ul>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Recorder;
