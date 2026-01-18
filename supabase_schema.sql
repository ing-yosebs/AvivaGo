-- AvivaGo Master Schema
-- This file consolidates all database definitions for the MPV.
-- Run this in your Supabase SQL Editor.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS
-- ==========================================
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'moderator', 'driver', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE profile_status AS ENUM ('draft', 'pending_approval', 'active', 'hidden', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE unlock_status AS ENUM ('completed', 'refunded', 'disputed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_origin AS ENUM ('trial', 'paid', 'admin_grant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('active', 'expired', 'canceled', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==========================================
-- 2. PUBLIC TABLES
-- ==========================================

-- 2.1 USERS (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    roles user_role_type[] DEFAULT '{client}',
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 DRIVER PROFILES
CREATE TABLE IF NOT EXISTS public.driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Public Info
    bio TEXT,
    profile_photo_url TEXT NOT NULL,
    cover_photo_url TEXT,
    city TEXT NOT NULL,
    service_radius_km INT DEFAULT 10,
    
    -- Contact Info (Protected)
    whatsapp_number TEXT NOT NULL,
    contact_email TEXT,

    -- Status & Ranking
    status profile_status DEFAULT 'draft',
    is_visible BOOLEAN DEFAULT true, -- Manual toggle
    average_rating NUMERIC(2,1) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    total_unlocks INT DEFAULT 0,
    ranking_score NUMERIC DEFAULT 0.0,
    
    -- Audit
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 VEHICLES
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    color TEXT,
    plate_number TEXT,
    photos_urls TEXT[], 
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 SERVICE TAGS
CREATE TABLE IF NOT EXISTS public.service_tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon_key TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.driver_service_tags (
    driver_profile_id UUID REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
    tag_id INT REFERENCES public.service_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (driver_profile_id, tag_id)
);

-- 2.5 UNLOCKS (Transactions)
CREATE TABLE IF NOT EXISTS public.unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    driver_profile_id UUID NOT NULL REFERENCES public.driver_profiles(id),
    
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_provider_id TEXT,
    
    status unlock_status DEFAULT 'completed',
    valid_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, driver_profile_id)
);

-- 2.6 REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unlock_id UUID UNIQUE NOT NULL REFERENCES public.unlocks(id) ON DELETE CASCADE,
    
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    driver_profile_id UUID NOT NULL REFERENCES public.driver_profiles(id),
    reviewer_id UUID NOT NULL REFERENCES public.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id),
    reported_driver_profile_id UUID NOT NULL REFERENCES public.driver_profiles(id),
    
    reason TEXT NOT NULL,
    evidence_urls TEXT[],
    
    status report_status DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 DRIVER MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.driver_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
    
    origin membership_origin NOT NULL DEFAULT 'trial',
    status membership_status NOT NULL DEFAULT 'active',
    
    stripe_subscription_id TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    granted_by UUID REFERENCES public.users(id),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT uniq_driver_membership UNIQUE (driver_profile_id)
);

-- ==========================================
-- 3. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_drivers_status_ranking ON public.driver_profiles(status, ranking_score DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_drivers_city ON public.driver_profiles(city) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_unlocks_lookup ON public.unlocks(user_id, driver_profile_id) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_driver_tags_reverse ON public.driver_service_tags(tag_id, driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_membership_driver ON public.driver_memberships(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_membership_status_expiry ON public.driver_memberships(status, expires_at);

-- ==========================================
-- 4. FUNCTIONS & TRIGGERS
-- ==========================================

-- 4.1 Handle New User -> Public User Record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sem Nombre'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4.2 Is Driver Active Helper
CREATE OR REPLACE FUNCTION public.is_driver_active(check_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM driver_memberships
        WHERE driver_profile_id = check_profile_id
          AND status = 'active'
          AND expires_at > NOW()
    );
$$;

-- 4.3 Handle New Driver -> Free Trial
CREATE OR REPLACE FUNCTION public.handle_new_driver_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.driver_memberships (driver_profile_id, origin, status, expires_at)
    VALUES (
        NEW.id, 
        'trial', 
        'active', 
        NOW() + INTERVAL '14 days'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_driver_profile_created ON public.driver_profiles;
CREATE TRIGGER on_driver_profile_created
    AFTER INSERT ON public.driver_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_driver_trial();


-- ==========================================
-- 5. INFO: RLS POLICIES (Manual Setup Recommended for detailed control, but here are basics)
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_memberships ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Public profiles visible if criteria met
CREATE POLICY "Public profiles visible" ON public.driver_profiles FOR SELECT 
USING (
    status = 'active' 
    AND is_visible = true 
    AND is_driver_active(id)
);
-- Drivers can manage their own profile
CREATE POLICY "Drivers manage own profile" ON public.driver_profiles FOR ALL USING (auth.uid() = user_id);

-- Membership visibility
CREATE POLICY "Drivers view own membership" ON public.driver_memberships FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.driver_profiles WHERE id = driver_profile_id));
