import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration
 * Environment variables should be set in your deployment environment
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "your-supabase-url";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-supabase-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions for better TypeScript support
export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          original_audio_url: string | null;
          processed_audio_url: string | null;
          transcription: string | null;
          duration: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          original_audio_url?: string | null;
          processed_audio_url?: string | null;
          transcription?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          original_audio_url?: string | null;
          processed_audio_url?: string | null;
          transcription?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
