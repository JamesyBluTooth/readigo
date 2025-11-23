-- Backfill historical progress data into reading_stats
-- This aggregates all existing progress_entries into reading_stats

INSERT INTO public.reading_stats (user_id, week_start, total_pages, total_minutes, books_completed)
SELECT 
  pe.user_id,
  date_trunc('week', pe.created_at)::date as week_start,
  SUM(pe.pages_read) as total_pages,
  SUM(COALESCE(pe.time_spent_minutes, 0)) as total_minutes,
  0 as books_completed
FROM progress_entries pe
GROUP BY pe.user_id, date_trunc('week', pe.created_at)::date
ON CONFLICT (user_id, week_start)
DO UPDATE SET
  total_pages = reading_stats.total_pages + EXCLUDED.total_pages,
  total_minutes = reading_stats.total_minutes + EXCLUDED.total_minutes,
  updated_at = now();

-- Backfill completed books count into reading_stats
INSERT INTO public.reading_stats (user_id, week_start, total_pages, total_minutes, books_completed)
SELECT 
  b.user_id,
  date_trunc('week', COALESCE(b.completed_at, b.updated_at))::date as week_start,
  0 as total_pages,
  0 as total_minutes,
  COUNT(*) as books_completed
FROM books b
WHERE b.is_completed = true
GROUP BY b.user_id, date_trunc('week', COALESCE(b.completed_at, b.updated_at))::date
ON CONFLICT (user_id, week_start)
DO UPDATE SET
  books_completed = reading_stats.books_completed + EXCLUDED.books_completed,
  updated_at = now();