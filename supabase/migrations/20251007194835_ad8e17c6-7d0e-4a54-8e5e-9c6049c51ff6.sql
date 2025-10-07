-- Add folder/category column to gallery table
ALTER TABLE public.gallery ADD COLUMN folder TEXT DEFAULT 'general';

-- Create index for faster folder queries
CREATE INDEX idx_gallery_folder ON public.gallery(folder);