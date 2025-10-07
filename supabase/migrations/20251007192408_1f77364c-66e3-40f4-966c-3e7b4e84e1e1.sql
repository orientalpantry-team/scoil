-- Add features section to sections table
INSERT INTO public.sections (key, content)
VALUES ('home.features', '{
  "title": "Why Choose Our School",
  "features": [
    {
      "icon": "BookOpen",
      "title": "Quality Education",
      "description": "Comprehensive curriculum designed for excellence"
    },
    {
      "icon": "Users",
      "title": "Expert Teachers",
      "description": "Dedicated and experienced faculty members"
    },
    {
      "icon": "Award",
      "title": "Excellence",
      "description": "Track record of outstanding achievements"
    },
    {
      "icon": "Heart",
      "title": "Caring Environment",
      "description": "Nurturing and supportive atmosphere"
    }
  ]
}')
ON CONFLICT (key) DO NOTHING;