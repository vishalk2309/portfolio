-- Add column to track auto-fetched jobs
ALTER TABLE job_updates
ADD COLUMN IF NOT EXISTS is_auto_fetched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_external_id ON job_updates(external_id);
CREATE INDEX IF NOT EXISTS idx_is_auto_fetched ON job_updates(is_auto_fetched);

-- Add constraint to prevent duplicate external IDs
ALTER TABLE job_updates
ADD CONSTRAINT unique_external_id UNIQUE (external_id) ON CONFLICT DO NOTHING;
