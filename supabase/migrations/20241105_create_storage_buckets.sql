-- Create storage buckets for avatars

-- Profile avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Group/Team avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-avatars',
  'group-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-avatars bucket
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to profile avatars
CREATE POLICY "Public can view profile avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');

-- Storage policies for group-avatars bucket
-- Allow group owners to upload group avatar
CREATE POLICY "Group owners can upload group avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-avatars' AND
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id::text = (storage.foldername(name))[1]
    AND groups.owner_id = auth.uid()
  )
);

-- Allow group owners to update group avatar
CREATE POLICY "Group owners can update group avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-avatars' AND
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id::text = (storage.foldername(name))[1]
    AND groups.owner_id = auth.uid()
  )
);

-- Allow group owners to delete group avatar
CREATE POLICY "Group owners can delete group avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-avatars' AND
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id::text = (storage.foldername(name))[1]
    AND groups.owner_id = auth.uid()
  )
);

-- Allow public read access to group avatars
CREATE POLICY "Public can view group avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'group-avatars');
