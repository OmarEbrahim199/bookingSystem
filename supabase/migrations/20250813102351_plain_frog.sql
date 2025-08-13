/*
  # Create Storage Bucket for Barber Images

  1. Storage
    - Create 'barber-images' bucket for storing barber profile pictures
    - Set up storage policies for image uploads and access
    - Allow public access for viewing images
    - Restrict uploads to authenticated admin users
*/

-- Create storage bucket for barber images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('barber-images', 'barber-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public access to view barber images
CREATE POLICY "Public can view barber images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'barber-images');

-- Create policy to allow admins to upload barber images
CREATE POLICY "Admins can upload barber images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'barber-images' 
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create policy to allow admins to update barber images
CREATE POLICY "Admins can update barber images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'barber-images' 
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create policy to allow admins to delete barber images
CREATE POLICY "Admins can delete barber images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'barber-images' 
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );