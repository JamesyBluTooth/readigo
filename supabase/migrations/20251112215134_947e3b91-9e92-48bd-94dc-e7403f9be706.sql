-- Drop problematic storage policies
DROP POLICY IF EXISTS "Limit avatar file size to 5MB" ON storage.objects;
DROP POLICY IF EXISTS "Only allow image content types" ON storage.objects;

-- Recreate storage policies with proper null handling
CREATE POLICY "Limit avatar file size to 5MB"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (COALESCE((metadata->>'size')::int, 0)) < 5242880
);

CREATE POLICY "Only allow image content types"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (metadata->>'mimetype') LIKE 'image/%'
);