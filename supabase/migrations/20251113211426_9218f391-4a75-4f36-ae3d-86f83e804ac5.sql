-- Drop tables with wrong names
DROP TABLE IF EXISTS public.book_notes CASCADE;
DROP TABLE IF EXISTS public.reading_progress CASCADE;

-- Create notes table (not book_notes)
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create progress_entries table (not reading_progress)
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  pages_read INTEGER NOT NULL,
  time_spent_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.progress_entries FOR SELECT
  USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own progress"
  ON public.progress_entries FOR INSERT
  WITH CHECK (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Update daily_challenges to add missing columns expected by code
ALTER TABLE public.daily_challenges 
  ADD COLUMN IF NOT EXISTS current_progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- Sync existing data
UPDATE public.daily_challenges 
SET current_progress = current_value, 
    is_completed = completed
WHERE current_progress IS NULL;

-- Create triggers
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();