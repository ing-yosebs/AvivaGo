-- Add verification and merch status fields to driver_profiles

ALTER TABLE driver_profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS merch_request_status TEXT DEFAULT 'none' CHECK (merch_request_status IN ('none', 'pending', 'shipped'));

-- Create an index on is_verified for faster filtering
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_verified ON driver_profiles(is_verified);
