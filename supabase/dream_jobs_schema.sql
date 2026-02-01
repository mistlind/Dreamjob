-- Dream Jobs Table Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the table

-- Create the dream_jobs table
CREATE TABLE IF NOT EXISTS dream_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dream_job TEXT NOT NULL,
    country_code CHAR(2) NOT NULL,
    country_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dream_jobs_created_at ON dream_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dream_jobs_country ON dream_jobs(country_code);

-- Enable Row Level Security
ALTER TABLE dream_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view entries)
CREATE POLICY "Allow public read access" ON dream_jobs
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Create policy for public insert access (anyone can submit)
CREATE POLICY "Allow public insert access" ON dream_jobs
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE dream_jobs;

-- Create a function to get the total count of entries
-- This can be called from the client for real-time count
CREATE OR REPLACE FUNCTION get_dream_jobs_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM dream_jobs);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION get_dream_jobs_count() TO anon;
GRANT EXECUTE ON FUNCTION get_dream_jobs_count() TO authenticated;

-- Optional: Create a view for the feed that excludes email for privacy
CREATE OR REPLACE VIEW dream_jobs_feed AS
SELECT
    id,
    dream_job,
    country_code,
    country_name,
    created_at
FROM dream_jobs
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON dream_jobs_feed TO anon;
GRANT SELECT ON dream_jobs_feed TO authenticated;
