-- Create function to update reading stats when progress is added
CREATE OR REPLACE FUNCTION update_reading_stats_on_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start date;
BEGIN
  -- Calculate the week start (Monday) for the progress entry
  v_week_start := date_trunc('week', NEW.created_at)::date;
  
  -- Insert or update reading stats for this week
  INSERT INTO public.reading_stats (
    user_id,
    week_start,
    total_pages,
    total_minutes,
    books_completed
  )
  VALUES (
    NEW.user_id,
    v_week_start,
    NEW.pages_read,
    COALESCE(NEW.time_spent_minutes, 0),
    0
  )
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET
    total_pages = reading_stats.total_pages + NEW.pages_read,
    total_minutes = reading_stats.total_minutes + COALESCE(NEW.time_spent_minutes, 0),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to update reading stats when progress entry is inserted
DROP TRIGGER IF EXISTS trigger_update_reading_stats_on_progress ON progress_entries;
CREATE TRIGGER trigger_update_reading_stats_on_progress
  AFTER INSERT ON progress_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_stats_on_progress();

-- Create function to update reading stats when book is completed
CREATE OR REPLACE FUNCTION update_reading_stats_on_book_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start date;
BEGIN
  -- Only proceed if book was just marked as completed
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
    -- Calculate the week start (Monday) for the completion
    v_week_start := date_trunc('week', COALESCE(NEW.completed_at, now()))::date;
    
    -- Insert or update reading stats for this week
    INSERT INTO public.reading_stats (
      user_id,
      week_start,
      total_pages,
      total_minutes,
      books_completed
    )
    VALUES (
      NEW.user_id,
      v_week_start,
      0,
      0,
      1
    )
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET
      books_completed = reading_stats.books_completed + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update reading stats when book is completed
DROP TRIGGER IF EXISTS trigger_update_reading_stats_on_book_completion ON books;
CREATE TRIGGER trigger_update_reading_stats_on_book_completion
  AFTER UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_stats_on_book_completion();