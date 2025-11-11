-- Create daily challenges table
CREATE TABLE public.daily_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type text NOT NULL CHECK (challenge_type IN ('pages', 'book', 'time')),
  target_value integer NOT NULL,
  current_progress integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_date)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own challenges" 
ON public.daily_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges" 
ON public.daily_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON public.daily_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to generate a new daily challenge
CREATE OR REPLACE FUNCTION public.generate_daily_challenge(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge_type text;
  v_target_value integer;
  v_challenge_id uuid;
  v_random float;
BEGIN
  -- Random challenge type
  v_random := random();
  
  IF v_random < 0.33 THEN
    v_challenge_type := 'pages';
    v_target_value := 10 + floor(random() * 41)::integer; -- 10-50 pages
  ELSIF v_random < 0.66 THEN
    v_challenge_type := 'time';
    v_target_value := 15 + floor(random() * 46)::integer; -- 15-60 minutes
  ELSE
    v_challenge_type := 'book';
    v_target_value := 1; -- Complete 1 book
  END IF;
  
  -- Insert new challenge
  INSERT INTO public.daily_challenges (
    user_id,
    challenge_type,
    target_value,
    challenge_date,
    expires_at
  )
  VALUES (
    p_user_id,
    v_challenge_type,
    v_target_value,
    CURRENT_DATE,
    (CURRENT_DATE + interval '1 day')::timestamp with time zone
  )
  ON CONFLICT (user_id, challenge_date) 
  DO NOTHING
  RETURNING id INTO v_challenge_id;
  
  RETURN v_challenge_id;
END;
$$;