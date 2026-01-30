-- Supabase Schema for DreamJob Feed
-- Run this in the Supabase SQL Editor

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_answers_subject_id ON answers(subject_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on subjects"
  ON subjects FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on subjects"
  ON subjects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access on answers"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on answers"
  ON answers FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for both tables
-- Go to Database > Replication in Supabase Dashboard
-- Or run these commands:
ALTER PUBLICATION supabase_realtime ADD TABLE subjects;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;

-- Insert some sample subjects
INSERT INTO subjects (name) VALUES
  ('Career Growth'),
  ('Work-Life Balance'),
  ('Interview Tips'),
  ('Remote Work'),
  ('Salary Negotiation')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample answers
INSERT INTO answers (content, author, subject_id)
SELECT
  'Always keep learning new skills. The tech industry moves fast!',
  'Sarah Chen',
  id
FROM subjects WHERE name = 'Career Growth';

INSERT INTO answers (content, author, subject_id)
SELECT
  'Set clear boundaries. Turn off notifications after work hours.',
  'Mike Johnson',
  id
FROM subjects WHERE name = 'Work-Life Balance';

INSERT INTO answers (content, author, subject_id)
SELECT
  'Research the company thoroughly before your interview. Know their mission and recent news.',
  'Emily Davis',
  id
FROM subjects WHERE name = 'Interview Tips';
