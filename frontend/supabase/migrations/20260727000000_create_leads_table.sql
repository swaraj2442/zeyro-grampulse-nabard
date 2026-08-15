-- Create leads table for Get Started & Get In Touch form submissions
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    website TEXT,
    mobile TEXT NOT NULL,
    source TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous form submissions (INSERT)
CREATE POLICY "Allow public insert to leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to view leads
CREATE POLICY "Allow authenticated read to leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);
