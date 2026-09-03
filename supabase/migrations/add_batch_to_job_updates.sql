-- Add batch column to job_updates table for tracking job cohorts
ALTER TABLE job_updates
ADD COLUMN IF NOT EXISTS batch TEXT;

-- Update comment for batch column
COMMENT ON COLUMN job_updates.batch IS 'Job batch or cohort identifier (e.g., Batch 2026-Q1, Summer Cohort)';
