-- Update leave_requests table to standardize status values
-- Run this script in your Supabase SQL editor

-- First, update any existing status values to match the valid ones
UPDATE leave_requests
SET status = 'approved'
WHERE status ILIKE 'approved' OR status ILIKE 'approve' OR status = 'Approved';

UPDATE leave_requests
SET status = 'rejected'
WHERE status ILIKE 'rejected' OR status ILIKE 'reject' OR status = 'Rejected';

UPDATE leave_requests
SET status = 'pending'
WHERE status ILIKE 'pending' OR status ILIKE 'wait' OR status = 'Pending' OR status IS NULL;

-- Check for any remaining invalid statuses and set them to pending as default
UPDATE leave_requests
SET status = 'pending'
WHERE status NOT IN ('pending', 'approved', 'rejected');

-- Now add the check constraint to ensure only valid status values are allowed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'leave_requests_status_check'
    ) THEN
        ALTER TABLE leave_requests
        ADD CONSTRAINT leave_requests_status_check
        CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- Verify the constraint was added
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'leave_requests_status_check';