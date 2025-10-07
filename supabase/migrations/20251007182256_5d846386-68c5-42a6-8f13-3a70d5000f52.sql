-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for content tables to allow admin modifications
CREATE POLICY "Admins can insert sections"
ON public.sections
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sections"
ON public.sections
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sections"
ON public.sections
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blogs"
ON public.blogs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blogs"
ON public.blogs
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blogs"
ON public.blogs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert events"
ON public.events
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert gallery"
ON public.gallery
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery"
ON public.gallery
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery"
ON public.gallery
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert policies"
ON public.policies
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update policies"
ON public.policies
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete policies"
ON public.policies
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update testimonials"
ON public.testimonials
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket policies for admin uploads
CREATE POLICY "Admins can upload to uploads bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update uploads bucket"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete from uploads bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can upload to gallery bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete from gallery bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'gallery' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can upload to blogs bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'blogs' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete from blogs bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'blogs' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can upload to policies bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'policies' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete from policies bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'policies' AND
  public.has_role(auth.uid(), 'admin')
);