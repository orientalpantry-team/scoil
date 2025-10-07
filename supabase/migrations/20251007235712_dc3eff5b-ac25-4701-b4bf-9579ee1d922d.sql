-- Create gallery_folders table to manage folder metadata
CREATE TABLE IF NOT EXISTS public.gallery_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  external_use boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view enabled folders"
  ON public.gallery_folders
  FOR SELECT
  USING (enabled = true);

CREATE POLICY "Admins can view all folders"
  ON public.gallery_folders
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert folders"
  ON public.gallery_folders
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update folders"
  ON public.gallery_folders
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete folders"
  ON public.gallery_folders
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default folders from existing gallery data
INSERT INTO public.gallery_folders (name, enabled)
SELECT DISTINCT COALESCE(folder, 'general') as name, true
FROM public.gallery
WHERE COALESCE(folder, 'general') IS NOT NULL
ON CONFLICT (name) DO NOTHING;