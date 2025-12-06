-- Create table for one-time-use action tokens
CREATE TABLE public.correction_action_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.book_correction_submissions(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  action text NOT NULL CHECK (action IN ('approve', 'reject')),
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for fast token lookup
CREATE INDEX idx_correction_action_tokens_token ON public.correction_action_tokens(token);

-- Enable RLS
ALTER TABLE public.correction_action_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow edge functions (service role) to manage tokens - no client access
-- No RLS policies needed since this is only accessed via edge functions with service role