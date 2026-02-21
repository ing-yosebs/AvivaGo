-- Migration: Create identity_verifications table for user deduplication
-- Date: 2026-02-18

-- 1. Create Enum if not exists
DO $$ BEGIN
    CREATE TYPE identity_document_type AS ENUM ('ine', 'passport', 'national_id');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Table
CREATE TABLE IF NOT EXISTS public.identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    document_type identity_document_type NOT NULL,
    
    -- Deduplication Fields (Unique Constraints)
    -- We use TEXT and assume normalization (uppercase, no spaces) happens before insert
    document_number TEXT,  -- CURP or Passport Number
    secondary_id TEXT,     -- CLAVE ELECTOR (INE)
    mrz_raw TEXT,          -- Full Machine Readable Zone string
    
    -- Human Readable Data
    full_name TEXT,
    birth_date DATE,
    expiration_date DATE,
    nationality TEXT,
    
    -- Images (References)
    front_image_url TEXT,
    back_image_url TEXT,
    selfie_url TEXT,
    
    -- Metadata
    match_score NUMERIC(5,2), -- Biometric match score
    ocr_data JSONB,           -- Full raw OCR dump
    
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    -- Allow NULLs but strictly enforce uniqueness if value is present
    CONSTRAINT uniq_identity_document_number UNIQUE (document_number),
    CONSTRAINT uniq_identity_secondary_id UNIQUE (secondary_id),
    CONSTRAINT uniq_identity_mrz UNIQUE (mrz_raw)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON public.identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_doc_num ON public.identity_verifications(document_number);

-- 4. RLS
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own verifications
CREATE POLICY "Users can view own identity verifications" 
ON public.identity_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Service Role (Backend) has full access implicitly.
-- No public write access allowed. All writes must go through secure RPC or API.
