CREATE TABLE IF NOT EXISTS public.quote_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id), -- Nullable if system action, though unlikely here
    action TEXT NOT NULL, -- 'created', 'status_changed', 'contact_viewed'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.quote_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Drivers can view logs for quotes sent to them
CREATE POLICY "Drivers can view logs of their quotes" ON public.quote_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quote_requests qr
            WHERE qr.id = quote_audit_logs.quote_id
            AND qr.driver_id IN (
                SELECT id FROM public.driver_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Passengers can view logs of their own quotes
CREATE POLICY "Passengers can view logs of their quotes" ON public.quote_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quote_requests qr
            WHERE qr.id = quote_audit_logs.quote_id
            AND qr.passenger_id = auth.uid()
        )
    );

-- Policy: Authenticated users can insert logs (for their actions)
CREATE POLICY "Users can insert logs" ON public.quote_audit_logs
    FOR INSERT
    WITH CHECK (auth.uid() = actor_id);
