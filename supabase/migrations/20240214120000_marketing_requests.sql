-- Migration: Create Marketing Kit Requests Table

CREATE TYPE marketing_request_status AS ENUM (
    'pending_quote',  -- User requested, waiting for admin quote
    'quote_sent',     -- Admin sent quote, waiting for user payment
    'paid',           -- User paid, waiting for processing
    'processing',     -- Admin is preparing the kit
    'shipped',        -- Kit shipped
    'delivered',      -- Kit delivered
    'cancelled'       -- Cancelled by admin or user
);

CREATE TABLE IF NOT EXISTS public.marketing_kit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
    
    status marketing_request_status DEFAULT 'pending_quote',
    
    shipping_address TEXT NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'MXN',
    
    admin_notes TEXT,       -- Internal notes or instructions for user
    driver_notes TEXT,      -- Notes from driver when requesting
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_requests_driver ON public.marketing_kit_requests(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_marketing_requests_status ON public.marketing_kit_requests(status);

-- RLS Policies
ALTER TABLE public.marketing_kit_requests ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own requests
CREATE POLICY "Drivers view own marketing requests" ON public.marketing_kit_requests
    FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM public.driver_profiles WHERE id = driver_profile_id));

-- Drivers can create requests (if they own the profile)
CREATE POLICY "Drivers create own marketing requests" ON public.marketing_kit_requests
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM public.driver_profiles WHERE id = driver_profile_id));

-- Admins can view and manage all requests
-- (Assuming admin role check is handled via separate admin policies or role-based access in app logic, 
-- but for RLS we can add a policy if admin users are in public.users with role 'admin')
CREATE POLICY "Admins manage marketing requests" ON public.marketing_kit_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND 'admin' = ANY(roles)
        )
    );
