CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('Admin', 'Supervisor', 'Participant');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE request_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE registration_status AS ENUM ('Pending', 'Accepted', 'Declined');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'Participant',
  status user_status NOT NULL DEFAULT 'active',
  college VARCHAR(255),
  department VARCHAR(255),
  registration_number VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schedule_requests (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  status request_status NOT NULL DEFAULT 'Pending',
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, schedule_id)
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_registrations (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'Pending',
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, event_id)
);

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_id, event_id)
);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_summary_log (
  id SERIAL PRIMARY KEY,
  summary_date DATE NOT NULL,
  supervisor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(summary_date, supervisor_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_registration_number ON users(registration_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_created_by ON schedules(created_by);
CREATE INDEX idx_schedule_requests_participant ON schedule_requests(participant_id);
CREATE INDEX idx_schedule_requests_schedule ON schedule_requests(schedule_id);
CREATE INDEX idx_schedule_requests_status ON schedule_requests(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_event_registrations_participant ON event_registrations(participant_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);
CREATE INDEX idx_feedback_event ON feedback(event_id);
CREATE INDEX idx_feedback_participant ON feedback(participant_id);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);

INSERT INTO system_settings (key, value) VALUES
  ('email_toggles', '{"welcome": true, "scheduleApproved": true, "scheduleRejected": true, "eventInvitation": true, "eventReminder": true, "passwordReset": true, "scheduleRequest": true, "eventRegistration": true, "feedbackSubmitted": true, "dailySummary": true}'::jsonb),
  ('event_reminder_hours', '24'::jsonb),
  ('daily_summary_time', '"08:00"'::jsonb),
  ('event_invite_scope', '"all_active_participants"'::jsonb);
