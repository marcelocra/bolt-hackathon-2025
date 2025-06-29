/*
  # Configure audio recordings storage bucket and policies

  1. Storage Setup
    - Create 'audio-recordings' storage bucket if it doesn't exist
    - Configure bucket to be private (not publicly accessible by default)
  
  2. Security Policies
    - Allow authenticated users to upload files to their own folder
    - Allow authenticated users to read their own files
    - Allow authenticated users to delete their own files
    - Ensure users can only access files in folders named after their user ID

  3. Important Notes
    - Files are organized by user ID: {user_id}/{filename}
    - Only authenticated users can perform operations
    - Users can only access their own files
*/

-- Create the audio-recordings bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-recordings',
  'audio-recordings', 
  false,
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated users to upload their own audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to read their own files
CREATE POLICY "Allow authenticated users to read their own audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to update their own files (if needed)
CREATE POLICY "Allow authenticated users to update their own audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);