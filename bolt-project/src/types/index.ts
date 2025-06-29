/**
 * Core type definitions for Janus Arc voice journal application
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  original_audio_url?: string;
  processed_audio_url?: string;
  transcription?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface AudioRecordingState {
  isRecording: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
}

export interface ProcessAudioResponse {
  transcription: string;
  processedAudioUrl: string | null;
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}