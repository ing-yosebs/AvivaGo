-- Migration: 2026-02-12-internationalization
-- Description: Add support for Countries, Zones, and Localized Pricing

DO $$ BEGIN

-- 1. Create Countries Table (Lookup)
CREATE TABLE IF NOT EXISTS public.countries (
    code CHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2 (e.g. 'MX', 'CO')
    name TEXT NOT NULL,
    currency CHAR(3) NOT NULL, -- ISO 4217 (e.g. 'MXN', 'COP')
    phone_code VARCHAR(5) NOT NULL, -- e.g. '52', '57'
    id_label VARCHAR(50) DEFAULT 'ID Nacional', -- Label for the ID document field (e.g. "CURP", "CC")
    id_regex TEXT, -- Optional regex for validation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Zones Table (Geographic areas within a country)
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code CHAR(2) NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "CDMX", "Bogotá"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Zone Prices Table (Pricing configuration per zone)
CREATE TABLE IF NOT EXISTS public.zone_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'membership', 'unlock'
    amount BIGINT NOT NULL, -- Amount in smallest currency unit (cents), e.g. 52400 for $524.00
    currency CHAR(3) NOT NULL,
    stripe_price_id TEXT, -- Optional linkage to Stripe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(zone_id, type)
);

-- 4. Seed Initial Data (MUST BE DONE BEFORE ALTER TABLE due to DEFAULT 'MX' FK check)
INSERT INTO public.countries (code, name, currency, phone_code, id_label)
VALUES 
    ('MX', 'México', 'MXN', '52', 'CURP'),
    ('CO', 'Colombia', 'COP', '57', 'Cédula de Ciudadanía')
ON CONFLICT (code) DO NOTHING;

-- 5. Update Driver Profiles to link to Country/Zone
ALTER TABLE public.driver_profiles 
ADD COLUMN IF NOT EXISTS country_code CHAR(2) DEFAULT 'MX' REFERENCES public.countries(code);

ALTER TABLE public.driver_profiles 
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.zones(id);

END $$;

-- Seed Zones for Mexico (Generic) and Colombia (Bogotá example)
DO $$
DECLARE
    mx_zone_id UUID;
    co_zone_id UUID;
BEGIN
    -- Ensure zones exist and capture IDs
    INSERT INTO public.zones (country_code, name) VALUES ('MX', 'General México') 
    ON CONFLICT DO NOTHING RETURNING id INTO mx_zone_id;
    
    -- If not inserted (exists), fetch it
    IF mx_zone_id IS NULL THEN
        SELECT id INTO mx_zone_id FROM public.zones WHERE country_code = 'MX' AND name = 'General México' LIMIT 1;
    END IF;

    INSERT INTO public.zones (country_code, name) VALUES ('CO', 'Bogotá D.C.') 
    ON CONFLICT DO NOTHING RETURNING id INTO co_zone_id;

    IF co_zone_id IS NULL THEN
        SELECT id INTO co_zone_id FROM public.zones WHERE country_code = 'CO' AND name = 'Bogotá D.C.' LIMIT 1;
    END IF;

    -- Seed Prices
    -- MX Membership: $524.00 MXN
    INSERT INTO public.zone_prices (zone_id, type, amount, currency)
    VALUES (mx_zone_id, 'membership', 52400, 'MXN')
    ON CONFLICT (zone_id, type) DO NOTHING;

    -- MX Unlock: $15.00 MXN (Example)
    INSERT INTO public.zone_prices (zone_id, type, amount, currency)
    VALUES (mx_zone_id, 'unlock', 1500, 'MXN')
    ON CONFLICT (zone_id, type) DO NOTHING;

    -- CO Membership: $100,000 COP (Example)
    INSERT INTO public.zone_prices (zone_id, type, amount, currency)
    VALUES (co_zone_id, 'membership', 10000000, 'COP')
    ON CONFLICT (zone_id, type) DO NOTHING;

    -- CO Unlock: $3,000 COP (Example)
    INSERT INTO public.zone_prices (zone_id, type, amount, currency)
    VALUES (co_zone_id, 'unlock', 300000, 'COP')
    ON CONFLICT (zone_id, type) DO NOTHING;

END $$;

-- 6. Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_prices ENABLE ROW LEVEL SECURITY;

-- Public read access
DO $$ BEGIN
  CREATE POLICY "Public read countries" ON public.countries FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public read zones" ON public.zones FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public read zone_prices" ON public.zone_prices FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
