import React, { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, Loader2, Save } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AudioRecordingState } from '../types';

/**
 * Voice recorder component with MediaRecorder integration
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          audioBlob,
        }));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      
      // Start duration timer
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000),
        }));
      }, 1000);

      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
      }));
    } catch (error) {
      setRecordingState(prev => ({
        ...prev,
        error: 'Failed to access microphone. Please check permissions.',
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
        setRecordingState(prev => ({ ...prev, isPlaying: false }));
      };
      
      audioRef.current.play();
      setRecordingState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [recordingState.audioBlob, recordingState.isPlaying]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current && recordingState.isPlaying) {
      audioRef.current.pause();
      setRecordingState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [recordingState.isPlaying]);

  const saveRecording = useCallback(async () => {
    if (!recordingState.audioBlob || !user) return;

    setRecordingState(prev => ({ ...prev, isLoading: true }));

    try {
      // Upload original audio first
      const fileName = `recording_${Date.now()}.webm`;
      const originalAudioUrl = await ApiService.uploadAudio(recordingState.audioBlob, fileName, user.id);
      
      if (!originalAudioUrl) {
        throw new Error('Failed to upload original audio file');
      }

      // Process audio with ElevenLabs (or use placeholder if disabled)
      console.log('Processing audio with AI...');
      const processResult = await ApiService.processAudio(recordingState.audioBlob);
      
      let processedAudioUrl = originalAudioUrl; // Default to original
      
      if (processResult.success && processResult.processedAudioUrl) {
        // If we got a processed audio blob URL, we need to upload it to storage
        try {
          const response = await fetch(processResult.processedAudioUrl);
          const processedBlob = await response.blob();
          
          const processedFileName = `processed_${fileName.replace('.webm', '.mp3')}`;
          const uploadedProcessedUrl = await ApiService.uploadProcessedAudio(processedBlob, processedFileName, user.id);
          
          if (uploadedProcessedUrl) {
            processedAudioUrl = uploadedProcessedUrl;
            console.log('Processed audio uploaded successfully');
          }
          
          // Clean up the temporary blob URL
          URL.revokeObjectURL(processResult.processedAudioUrl);
        } catch (uploadError) {
          console.warn('Failed to upload processed audio, using original:', uploadError);
        }
      }

      // Save entry to database
      const entry = await ApiService.saveEntry({
        user_id: user.id,
        title: `Recording ${new Date().toLocaleDateString()}`,
        original_audio_url: originalAudioUrl,
        processed_audio_url: processedAudioUrl,
        transcription: processResult.transcription || null,
        duration: recordingState.duration,
      });

      if (entry) {
        console.log('Entry saved successfully:', entry.id);
        
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
        throw new Error('Failed to save recording to database');
      }
    } catch (error) {
      console.error('Error saving recording:', error);
      setRecordingState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save recording',
      }));
    }
  }, [recordingState.audioBlob, recordingState.duration, user, onEntryCreated]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setRecordingState({
      isRecording: false,
      isLoading: false,
      isPlaying: false,
      audioBlob: null,
      duration: 0,
      error: null,
    });
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Voice Journal</h2>
          <p className="text-slate-400">Record your thoughts and memories</p>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-6">
          {!recordingState.audioBlob ? (
            // Initial recording state
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={recordingState.isRecording ? stopRecording : startRecording}
                disabled={recordingState.isLoading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  recordingState.isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/25'
                    : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'
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
                  {recordingState.isRecording ? 'Recording...' : 'Tap to start recording'}
                </p>
              </div>
            </div>
          ) : (
            // Playback and save controls
            <div className="flex flex-col items-center space-y-6 w-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={recordingState.isPlaying ? pausePlayback : playRecording}
                  disabled={recordingState.isLoading}
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
                    {recordingState.isPlaying ? 'Playing...' : 'Ready to save'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 w-full">
                <button
                  onClick={resetRecording}
                  disabled={recordingState.isLoading}
                  className="flex-1 py-3 px-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-600/50 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  Re-record
                </button>
                
                <button
                  onClick={saveRecording}
                  disabled={recordingState.isLoading}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-blue-500/25"
                >
                  {recordingState.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
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
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{recordingState.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;