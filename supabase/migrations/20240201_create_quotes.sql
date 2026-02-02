-- Create Quote Status Enum
DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Quotes Table
CREATE TABLE IF NOT EXISTS public.quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES auth.users(id),
    driver_id UUID NOT NULL REFERENCES public.driver_profiles(id),
    
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    details TEXT,
    contact_phone TEXT NOT NULL,
    
    origin_location TEXT, -- Optional: Where they are coming from
    destination_location TEXT, -- Optional: Where they are going
    
    status quote_status DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Passengers can insert requests
CREATE POLICY "Passengers can create quote requests" 
ON public.quote_requests FOR INSERT 
WITH CHECK (auth.uid() = passenger_id);

-- Passengers can view their own requests
CREATE POLICY "Passengers can view own requests" 
ON public.quote_requests FOR SELECT 
USING (auth.uid() = passenger_id);

-- Drivers can view requests sent to them
CREATE POLICY "Drivers can view received requests" 
ON public.quote_requests FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.driver_profiles dp
        WHERE dp.id = quote_requests.driver_id
        AND dp.user_id = auth.uid()
    )
);

-- Drivers can update status of requests sent to them
CREATE POLICY "Drivers can update request status" 
ON public.quote_requests FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.driver_profiles dp
        WHERE dp.id = quote_requests.driver_id
        AND dp.user_id = auth.uid()
    )
);
