-- Create app-wide role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_app_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_app_role(auth.uid(), 'admin'));

-- Create correction status enum
CREATE TYPE public.correction_status AS ENUM ('pending', 'approved', 'rejected');

-- Create book_correction_submissions table
CREATE TABLE public.book_correction_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn TEXT NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_data JSONB NOT NULL,
  proposed_changes JSONB NOT NULL,
  status correction_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_correction_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for book_correction_submissions
CREATE POLICY "Users can submit corrections"
  ON public.book_correction_submissions FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own submissions"
  ON public.book_correction_submissions FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all submissions"
  ON public.book_correction_submissions FOR SELECT
  USING (has_app_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
  ON public.book_correction_submissions FOR UPDATE
  USING (has_app_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_book_correction_submissions_updated_at
  BEFORE UPDATE ON public.book_correction_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();