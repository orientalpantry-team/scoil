-- Add show_on_homepage column to blogs table
ALTER TABLE public.blogs 
ADD COLUMN show_on_homepage BOOLEAN NOT NULL DEFAULT false;