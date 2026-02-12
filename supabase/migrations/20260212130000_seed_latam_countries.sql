-- Migration: 2026-02-12-seed-latam
-- Description: Seed additional Latin American countries with default Zones and Prices

-- 1. Insert Countries
INSERT INTO public.countries (code, name, currency, phone_code, id_label)
VALUES 
    ('AR', 'Argentina', 'ARS', '54', 'DNI'),
    ('CL', 'Chile', 'CLP', '56', 'RUT'),
    ('PE', 'Perú', 'PEN', '51', 'DNI'),
    ('EC', 'Ecuador', 'USD', '593', 'Cédula'),
    ('CR', 'Costa Rica', 'CRC', '506', 'Cédula'),
    ('UY', 'Uruguay', 'UYU', '598', 'Cédula'),
    ('PA', 'Panamá', 'USD', '507', 'Cédula'),
    ('DO', 'República Dominicana', 'DOP', '1', 'Cédula'), -- Phone code +1 requires special handling or just store '1'
    ('GT', 'Guatemala', 'GTQ', '502', 'DPI')
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Zones and Prices for each
DO $$
DECLARE
    -- Country Zone IDs
    ar_zone_id UUID;
    cl_zone_id UUID;
    pe_zone_id UUID;
    ec_zone_id UUID;
    cr_zone_id UUID;
    uy_zone_id UUID;
    pa_zone_id UUID;
    do_zone_id UUID;
    gt_zone_id UUID;
BEGIN
    -- Argentina (~$30 USD equivalent for membership)
    INSERT INTO public.zones (country_code, name) VALUES ('AR', 'General Argentina') ON CONFLICT DO NOTHING RETURNING id INTO ar_zone_id;
    IF ar_zone_id IS NULL THEN SELECT id INTO ar_zone_id FROM public.zones WHERE country_code = 'AR' LIMIT 1; END IF;
    -- Price: 30,000 ARS (Approx, volatile)
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (ar_zone_id, 'membership', 3000000, 'ARS') ON CONFLICT (zone_id, type) DO NOTHING;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (ar_zone_id, 'unlock', 100000, 'ARS') ON CONFLICT (zone_id, type) DO NOTHING;

    -- Chile (~$26 USD -> 25,000 CLP)
    INSERT INTO public.zones (country_code, name) VALUES ('CL', 'General Chile') ON CONFLICT DO NOTHING RETURNING id INTO cl_zone_id;
    IF cl_zone_id IS NULL THEN SELECT id INTO cl_zone_id FROM public.zones WHERE country_code = 'CL' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (cl_zone_id, 'membership', 25000, 'CLP') ON CONFLICT (zone_id, type) DO NOTHING; -- CLP usually no decimals in common usage but Stripe might require cents logic. standard is zero-decimal currency for CLP? Stripe treats CLP as zero-decimal. So 25000 is $25,000. Wait, 52400 MXN is 524.00.
    -- Stripe: CLP is a zero-decimal currency. So amount=25000 is 25,000 CLP.
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (cl_zone_id, 'unlock', 1000, 'CLP') ON CONFLICT (zone_id, type) DO NOTHING;

    -- Perú (~$26 USD -> 100 PEN)
    INSERT INTO public.zones (country_code, name) VALUES ('PE', 'General Perú') ON CONFLICT DO NOTHING RETURNING id INTO pe_zone_id;
    IF pe_zone_id IS NULL THEN SELECT id INTO pe_zone_id FROM public.zones WHERE country_code = 'PE' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (pe_zone_id, 'membership', 10000, 'PEN') ON CONFLICT (zone_id, type) DO NOTHING; -- 100.00 PEN
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (pe_zone_id, 'unlock', 300, 'PEN') ON CONFLICT (zone_id, type) DO NOTHING; -- 3.00 PEN

    -- Ecuador (USD)
    INSERT INTO public.zones (country_code, name) VALUES ('EC', 'General Ecuador') ON CONFLICT DO NOTHING RETURNING id INTO ec_zone_id;
    IF ec_zone_id IS NULL THEN SELECT id INTO ec_zone_id FROM public.zones WHERE country_code = 'EC' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (ec_zone_id, 'membership', 2600, 'USD') ON CONFLICT (zone_id, type) DO NOTHING; -- $26.00
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (ec_zone_id, 'unlock', 100, 'USD') ON CONFLICT (zone_id, type) DO NOTHING; -- $1.00

    -- Costa Rica (~$26 USD -> 14,000 CRC)
    INSERT INTO public.zones (country_code, name) VALUES ('CR', 'General Costa Rica') ON CONFLICT DO NOTHING RETURNING id INTO cr_zone_id;
    IF cr_zone_id IS NULL THEN SELECT id INTO cr_zone_id FROM public.zones WHERE country_code = 'CR' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (cr_zone_id, 'membership', 1400000, 'CRC') ON CONFLICT (zone_id, type) DO NOTHING; -- 14,000.00 CRC
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (cr_zone_id, 'unlock', 50000, 'CRC') ON CONFLICT (zone_id, type) DO NOTHING; -- 500.00 CRC

    -- Uruguay (~$26 USD -> 1,100 UYU)
    INSERT INTO public.zones (country_code, name) VALUES ('UY', 'General Uruguay') ON CONFLICT DO NOTHING RETURNING id INTO uy_zone_id;
    IF uy_zone_id IS NULL THEN SELECT id INTO uy_zone_id FROM public.zones WHERE country_code = 'UY' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (uy_zone_id, 'membership', 110000, 'UYU') ON CONFLICT (zone_id, type) DO NOTHING; -- 1,100.00 UYU
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (uy_zone_id, 'unlock', 4000, 'UYU') ON CONFLICT (zone_id, type) DO NOTHING; -- 40.00 UYU

    -- Panamá (USD)
    INSERT INTO public.zones (country_code, name) VALUES ('PA', 'General Panamá') ON CONFLICT DO NOTHING RETURNING id INTO pa_zone_id;
    IF pa_zone_id IS NULL THEN SELECT id INTO pa_zone_id FROM public.zones WHERE country_code = 'PA' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (pa_zone_id, 'membership', 2600, 'USD') ON CONFLICT (zone_id, type) DO NOTHING;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (pa_zone_id, 'unlock', 100, 'USD') ON CONFLICT (zone_id, type) DO NOTHING;

    -- República Dominicana (~$26 USD -> 1,600 DOP)
    INSERT INTO public.zones (country_code, name) VALUES ('DO', 'General República Dominicana') ON CONFLICT DO NOTHING RETURNING id INTO do_zone_id;
    IF do_zone_id IS NULL THEN SELECT id INTO do_zone_id FROM public.zones WHERE country_code = 'DO' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (do_zone_id, 'membership', 160000, 'DOP') ON CONFLICT (zone_id, type) DO NOTHING; -- 1,600.00 DOP
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (do_zone_id, 'unlock', 6000, 'DOP') ON CONFLICT (zone_id, type) DO NOTHING; -- 60.00 DOP

    -- Guatemala (~$26 USD -> 200 GTQ)
    INSERT INTO public.zones (country_code, name) VALUES ('GT', 'General Guatemala') ON CONFLICT DO NOTHING RETURNING id INTO gt_zone_id;
    IF gt_zone_id IS NULL THEN SELECT id INTO gt_zone_id FROM public.zones WHERE country_code = 'GT' LIMIT 1; END IF;
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (gt_zone_id, 'membership', 20000, 'GTQ') ON CONFLICT (zone_id, type) DO NOTHING; -- 200.00 GTQ
    INSERT INTO public.zone_prices (zone_id, type, amount, currency) VALUES (gt_zone_id, 'unlock', 800, 'GTQ') ON CONFLICT (zone_id, type) DO NOTHING; -- 8.00 GTQ

END $$;
