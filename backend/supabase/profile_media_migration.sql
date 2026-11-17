-- Profile Media Migration
-- Run this in your Supabase Project's SQL Editor (https://supabase.com/dashboard/project/tqpbklxmghazkmpopngb/sql)

-- 1. Add profile media columns if they don't already exist
ALTER TABLE profile
  ADD COLUMN IF NOT EXISTS profile_media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS profile_media_url text,
  ADD COLUMN IF NOT EXISTS profile_media_path text;

-- 2. Preserve existing profile image data by populating media columns for backward compatibility
UPDATE profile
  SET profile_media_type = 'image',
      profile_media_url = profile_image_url,
      profile_media_path = profile_image_path
  WHERE profile_media_url IS NULL AND profile_image_url IS NOT NULL;

-- 3. Notify PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
