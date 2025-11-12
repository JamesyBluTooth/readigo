-- Add friend_code to profiles table
ALTER TABLE public.profiles ADD COLUMN friend_code text UNIQUE;

-- Create function to generate random friend code
CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS text
LANGUAGE plpgsql
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

-- Update existing profiles to have friend codes
UPDATE public.profiles SET friend_code = public.generate_friend_code() WHERE friend_code IS NULL;

-- Make friend_code NOT NULL after populating
ALTER TABLE public.profiles ALTER COLUMN friend_code SET NOT NULL;

-- Update trigger to generate friend code for new profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, friend_code)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', public.generate_friend_code());
  RETURN new;
END;
$$;

-- Create friendships table
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS policies for friendships
CREATE POLICY "Users can view their own friendships"
ON public.friendships
FOR SELECT
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create their own friendships"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = follower_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb
);

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements
CREATE POLICY "Users can view achievements of people they follow"
ON public.achievements
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE follower_id = auth.uid() AND following_id = user_id
  )
);

CREATE POLICY "System can insert achievements"
ON public.achievements
FOR INSERT
WITH CHECK (true);

-- Create reading_stats table for weekly tracking
CREATE TABLE public.reading_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  week_start date NOT NULL,
  total_minutes integer NOT NULL DEFAULT 0,
  total_pages integer NOT NULL DEFAULT 0,
  books_completed integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS on reading_stats
ALTER TABLE public.reading_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for reading_stats
CREATE POLICY "Users can view stats of people they follow"
ON public.reading_stats
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE follower_id = auth.uid() AND following_id = user_id
  )
);

CREATE POLICY "Users can update their own stats"
ON public.reading_stats
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for reading_stats updated_at
CREATE TRIGGER update_reading_stats_updated_at
BEFORE UPDATE ON public.reading_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();