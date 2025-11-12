-- Create function to ensure reading stats exist for the current week
CREATE OR REPLACE FUNCTION public.ensure_reading_stats_for_week()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_week_start date;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculate current week start (Monday)
  v_week_start := date_trunc('week', CURRENT_DATE)::date;
  
  -- Insert stats for current week if they don't exist
  INSERT INTO public.reading_stats (user_id, week_start, total_minutes, total_pages, books_completed)
  VALUES (v_user_id, v_week_start, 0, 0, 0)
  ON CONFLICT (user_id, week_start) DO NOTHING;
END;
$$;

-- Also create a trigger to auto-create stats when a new profile is created
CREATE OR REPLACE FUNCTION public.create_initial_reading_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start date;
BEGIN
  -- Calculate current week start (Monday)
  v_week_start := date_trunc('week', CURRENT_DATE)::date;
  
  -- Insert initial stats for the new user
  INSERT INTO public.reading_stats (user_id, week_start, total_minutes, total_pages, books_completed)
  VALUES (NEW.user_id, v_week_start, 0, 0, 0)
  ON CONFLICT (user_id, week_start) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS create_initial_reading_stats_trigger ON public.profiles;
CREATE TRIGGER create_initial_reading_stats_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_reading_stats();