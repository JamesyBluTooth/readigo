-- Add missing columns to books table
ALTER TABLE public.books 
  ADD COLUMN IF NOT EXISTS genres TEXT[],
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS review TEXT;

-- Update is_completed based on status
UPDATE public.books 
SET is_completed = (status = 'completed')
WHERE is_completed = false;