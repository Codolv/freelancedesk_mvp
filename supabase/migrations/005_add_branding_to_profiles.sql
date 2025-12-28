-- Add branding fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3B4B2F',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#4F5F40',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#2E3A25',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS custom_css TEXT;

-- Update RLS policy to allow users to update their branding fields
-- The existing update policy already allows users to update their own profile

-- Create storage bucket for branding logos
INSERT INTO storage.buckets (id, name, public) VALUES ('branding-logos', 'branding-logos', false);

-- Storage policy for branding logos
CREATE POLICY "Users can upload branding logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own branding logos" ON storage.objects FOR UPDATE USING (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own branding logos" ON storage.objects FOR DELETE USING (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
