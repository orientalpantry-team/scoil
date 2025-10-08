-- Add Google Calendar link to sections table for calendar page
INSERT INTO public.sections (key, content) 
VALUES ('calendar.google', '{"url": ""}')
ON CONFLICT (key) 
DO UPDATE SET content = '{"url": ""}';