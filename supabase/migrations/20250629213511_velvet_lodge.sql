/*
  # Create storage bucket for audio recordings

  1. Storage Setup
    - Create 'audio-recordings' bucket for storing voice recordings
    - Set bucket to private (not publicly accessible by default)
    - Configure RLS policies for secure access

  2. Security
    - Users can only upload to their own folder
    - Users can only read their own audio files
    - Users can delete their own audio files
*/

-- Create storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own audio files
CREATE POLICY "Users can upload their own audio files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can read their own audio files
CREATE POLICY "Users can read their own audio files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own audio files
CREATE POLICY "Users can update their own audio files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own audio files
CREATE POLICY "Users can delete their own audio files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
