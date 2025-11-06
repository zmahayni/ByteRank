# Supabase Storage Bucket Setup Guide

## Overview
You need to create two storage buckets for ByteRank: one for profile avatars and one for group/team avatars.

---

## 1. Create the Buckets

### In Supabase Dashboard:
1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**

### Bucket 1: Profile Avatars
- **Name**: `profile-avatars`
- **Public bucket**: ✅ **YES** (check this box)
- **File size limit**: `5242880` (5MB in bytes)
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### Bucket 2: Group Avatars
- **Name**: `group-avatars`
- **Public bucket**: ✅ **YES** (check this box)
- **File size limit**: `5242880` (5MB in bytes)
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

---

## 2. Set Up Storage Policies

After creating each bucket, you need to add RLS (Row Level Security) policies.

### For `profile-avatars` bucket:

Go to **Storage** → **Policies** → Select `profile-avatars` bucket → **New Policy**

#### Policy 1: Users can upload their own avatar
```sql
-- Policy name: Users can upload their own avatar
-- Operation: INSERT
-- Target roles: authenticated

-- WITH CHECK expression:
bucket_id = 'profile-avatars' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 2: Users can update their own avatar
```sql
-- Policy name: Users can update their own avatar
-- Operation: UPDATE
-- Target roles: authenticated

-- USING expression:
bucket_id = 'profile-avatars' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 3: Users can delete their own avatar
```sql
-- Policy name: Users can delete their own avatar
-- Operation: DELETE
-- Target roles: authenticated

-- USING expression:
bucket_id = 'profile-avatars' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Public can view profile avatars
```sql
-- Policy name: Public can view profile avatars
-- Operation: SELECT
-- Target roles: public

-- USING expression:
bucket_id = 'profile-avatars'
```

---

### For `group-avatars` bucket:

Go to **Storage** → **Policies** → Select `group-avatars` bucket → **New Policy**

#### Policy 1: Group owners can upload group avatar
```sql
-- Policy name: Group owners can upload group avatar
-- Operation: INSERT
-- Target roles: authenticated

-- WITH CHECK expression:
bucket_id = 'group-avatars' AND
EXISTS (
  SELECT 1 FROM groups
  WHERE groups.id::text = (storage.foldername(name))[1]
  AND groups.owner_id = auth.uid()
)
```

#### Policy 2: Group owners can update group avatar
```sql
-- Policy name: Group owners can update group avatar
-- Operation: UPDATE
-- Target roles: authenticated

-- USING expression:
bucket_id = 'group-avatars' AND
EXISTS (
  SELECT 1 FROM groups
  WHERE groups.id::text = (storage.foldername(name))[1]
  AND groups.owner_id = auth.uid()
)
```

#### Policy 3: Group owners can delete group avatar
```sql
-- Policy name: Group owners can delete group avatar
-- Operation: DELETE
-- Target roles: authenticated

-- USING expression:
bucket_id = 'group-avatars' AND
EXISTS (
  SELECT 1 FROM groups
  WHERE groups.id::text = (storage.foldername(name))[1]
  AND groups.owner_id = auth.uid()
)
```

#### Policy 4: Public can view group avatars
```sql
-- Policy name: Public can view group avatars
-- Operation: SELECT
-- Target roles: public

-- USING expression:
bucket_id = 'group-avatars'
```

---

## 3. File Structure

### Profile Avatars
Files will be stored as: `{userId}/{timestamp}.{extension}`
- Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890/1699123456789.jpg`

### Group Avatars
Files will be stored as: `{groupId}/{timestamp}.{extension}`
- Example: `1de553b1-edff-4534-890f-454468e5c644/1699123456789.png`

---

## 4. How the Policies Work

### Profile Avatars:
- **Upload/Update/Delete**: Users can only manage files in folders named with their own user ID
- **View**: Anyone (including non-authenticated users) can view profile avatars

### Group Avatars:
- **Upload/Update/Delete**: Only the group owner (verified via database query) can manage the group's avatar
- **View**: Anyone (including non-authenticated users) can view group avatars

---

## 5. Testing

After setup, test by:
1. Going to a team you own
2. Click "Edit Team"
3. Upload an avatar image
4. Check that it appears correctly
5. Try uploading from a different team (you should only be able to upload to teams you own)

---

## Troubleshooting

### If uploads fail:
1. Check that buckets are marked as **Public**
2. Verify all policies are created correctly
3. Check browser console for specific error messages
4. Ensure file size is under 5MB
5. Ensure file type is JPEG, PNG, GIF, or WebP

### If images don't display:
1. Verify the bucket is public
2. Check the SELECT policy allows public access
3. Verify the URL format is correct in the database
