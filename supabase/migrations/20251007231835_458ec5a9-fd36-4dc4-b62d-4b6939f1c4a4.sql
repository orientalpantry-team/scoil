-- Create themes table
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  colors JSONB NOT NULL DEFAULT '{}'::jsonb,
  section_styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active theme"
  ON public.themes
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all themes"
  ON public.themes
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert themes"
  ON public.themes
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update themes"
  ON public.themes
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete themes"
  ON public.themes
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Insert default theme
INSERT INTO public.themes (name, is_active, colors, section_styles)
VALUES (
  'Default Theme',
  true,
  '{
    "primary": "215 70% 35%",
    "secondary": "15 80% 60%",
    "accent": "145 65% 50%",
    "background": "0 0% 100%",
    "foreground": "222 47% 11%",
    "muted": "210 40% 96%",
    "border": "214 32% 91%"
  }'::jsonb,
  '{}'::jsonb
);