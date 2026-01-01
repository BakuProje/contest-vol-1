-- Create enum for package types
CREATE TYPE public.package_type AS ENUM ('contest', 'meetup');

-- Create enum for registration status
CREATE TYPE public.registration_status AS ENUM ('pending', 'verified');

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  package_type package_type NOT NULL,
  proof_url TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table (for admin role management)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Registrations: Anyone can insert (for public registration)
CREATE POLICY "Anyone can create registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- Registrations: Only admins can view all registrations
CREATE POLICY "Admins can view all registrations" 
ON public.registrations 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Registrations: Only admins can update registrations
CREATE POLICY "Admins can update registrations" 
ON public.registrations 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Admin users: Only admins can view admin_users table
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for proof uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true);

-- Storage policies for proofs bucket
CREATE POLICY "Anyone can upload proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'proofs');

CREATE POLICY "Anyone can view proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proofs');