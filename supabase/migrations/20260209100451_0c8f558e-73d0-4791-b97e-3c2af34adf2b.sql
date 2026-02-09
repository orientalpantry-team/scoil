-- Create enrollment_forms table
CREATE TABLE public.enrollment_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrollment_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view enrollment forms"
  ON public.enrollment_forms FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert enrollment forms"
  ON public.enrollment_forms FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enrollment forms"
  ON public.enrollment_forms FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enrollment forms"
  ON public.enrollment_forms FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('enrollment', 'enrollment', true);

-- Storage policies
CREATE POLICY "Public can view enrollment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'enrollment');

CREATE POLICY "Admins can upload enrollment files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'enrollment' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enrollment files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'enrollment' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enrollment files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'enrollment' AND has_role(auth.uid(), 'admin'::app_role));