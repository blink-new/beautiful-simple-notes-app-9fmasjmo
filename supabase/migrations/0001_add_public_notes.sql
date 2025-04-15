
-- Add is_public column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Create policy for public notes
CREATE POLICY "Public notes are viewable by everyone." ON notes
  FOR SELECT USING (is_public = true);

-- Update RLS to allow public access to notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;