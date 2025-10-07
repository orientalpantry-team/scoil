-- Add logos section to sections table
INSERT INTO public.sections (key, content)
VALUES ('home.logos', '{"logos": [{"image": "", "hoverText": ""}]}')
ON CONFLICT (key) DO NOTHING;