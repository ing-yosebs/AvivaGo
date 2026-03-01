-- Usage tracking table for the Driver's trip calculator feature
CREATE TABLE IF NOT EXISTS public.calculator_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- RLS Policies
ALTER TABLE public.calculator_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
    ON public.calculator_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
    ON public.calculator_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
    ON public.calculator_usage FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_calculator_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calculator_usage_updated_at
    BEFORE UPDATE ON public.calculator_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_calculator_usage_updated_at();
