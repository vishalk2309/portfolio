-- Separate work mode (Remote/Hybrid/On-site) from job type (Full-time/Internship/...).
-- Safe to re-run.

ALTER TABLE job_updates
ADD COLUMN IF NOT EXISTS work_mode TEXT;

COMMENT ON COLUMN job_updates.work_mode IS 'Where the work happens: Remote, Hybrid, On-site';
COMMENT ON COLUMN job_updates.job_type IS 'Employment type: Full-time, Part-time, Internship, Apprenticeship, Contract';

-- Backfill: existing rows stored the work mode in job_type. Move it across
-- and clear job_type so it can hold a real employment type.
UPDATE job_updates
SET work_mode = job_type
WHERE work_mode IS NULL
  AND job_type IN ('Remote', 'Hybrid', 'On-site');

UPDATE job_updates
SET job_type = NULL
WHERE job_type IN ('Remote', 'Hybrid', 'On-site');
