-- Migration: rename worker -> participant, add college/department/registration_number
-- Run this against an existing database that was created before this change.
-- (New databases created from schema.sql already have everything below.)
-- Safe to re-run: every step is guarded so it won't error if already applied.

-- 1. Rename the worker_id columns to participant_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedule_requests' AND column_name = 'worker_id') THEN
    ALTER TABLE schedule_requests RENAME COLUMN worker_id TO participant_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_registrations' AND column_name = 'worker_id') THEN
    ALTER TABLE event_registrations RENAME COLUMN worker_id TO participant_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'worker_id') THEN
    ALTER TABLE feedback RENAME COLUMN worker_id TO participant_id;
  END IF;
END $$;

-- 2. Rename the old indexes to match
ALTER INDEX IF EXISTS idx_schedule_requests_worker RENAME TO idx_schedule_requests_participant;
ALTER INDEX IF EXISTS idx_event_registrations_worker RENAME TO idx_event_registrations_participant;
ALTER INDEX IF EXISTS idx_feedback_worker RENAME TO idx_feedback_participant;

-- 3. Rename the 'Worker' role enum value to 'Participant' (PostgreSQL 10+)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Worker' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role RENAME VALUE 'Worker' TO 'Participant';
  END IF;
END $$;

-- 4. Add the new profile fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS college VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_registration_number ON users(registration_number);

-- 5. If the 'event_invite_scope' setting still uses the old scope name, update it
UPDATE system_settings
SET value = '"all_active_participants"'::jsonb
WHERE key = 'event_invite_scope' AND value = '"all_active_workers"'::jsonb;

-- 6. Add approval tracking to event_registrations (events now go through a
--    request -> supervisor approve/reject flow, same as schedules)
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 7. Events used to auto-register every active participant as a 'Pending'
--    invitation when created. Those old auto-generated pending rows are no
--    longer meaningful under the new request/approve flow, so clear them out.
--    (Only removes rows nobody has acted on yet; Accepted/Declined rows are kept.)
DELETE FROM event_registrations WHERE status = 'Pending';
