-- Fix search_path issues in existing functions

-- Fix handle_new_user function - remove quotes from search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Fixed: removed quotes
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, friend_code)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', public.generate_friend_code());
  RETURN new;
END;
$$;

-- Fix generate_friend_code function - add search_path
CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public  -- Added: search_path protection
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
  code_exists boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE friend_code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Add storage policies for avatar uploads to restrict file size and types
CREATE POLICY "Limit avatar file size to 5MB"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (COALESCE((metadata->>'size')::int, 0)) < 5242880
);

CREATE POLICY "Only allow image content types"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (metadata->>'mimetype') LIKE 'image/%'
);