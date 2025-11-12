-- Fix generate_daily_challenge function - add user validation
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
  -- Validate that we're generating for the authenticated user
  -- This prevents privilege escalation
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot generate challenges for other users';
  END IF;
  
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