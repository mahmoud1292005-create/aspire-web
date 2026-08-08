-- Default password for all seeded users: Password123!
-- bcrypt hash generated with cost factor 10

INSERT INTO users (first_name, last_name, email, phone, password_hash, role, status, college, department, registration_number) VALUES
  ('Alice', 'Admin', 'admin@aspire.local', '555-0100', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Admin', 'active', NULL, NULL, NULL),
  ('Sam', 'Carter', 'supervisor1@aspire.local', '555-0101', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Supervisor', 'active', NULL, NULL, NULL),
  ('Sarah', 'Nguyen', 'supervisor2@aspire.local', '555-0102', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Supervisor', 'active', NULL, NULL, NULL),
  ('John', 'Doe', 'participant1@aspire.local', '555-0201', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Participant', 'active', 'College of Engineering', 'Computer Science', 'REG-2026-0001'),
  ('Jane', 'Smith', 'participant2@aspire.local', '555-0202', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Participant', 'active', 'College of Business', 'Marketing', 'REG-2026-0002'),
  ('Mike', 'Johnson', 'participant3@aspire.local', '555-0203', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Participant', 'active', 'College of Engineering', 'Electrical Engineering', 'REG-2026-0003'),
  ('Emily', 'Davis', 'participant4@aspire.local', '555-0204', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Participant', 'active', 'College of Arts & Sciences', 'Psychology', 'REG-2026-0004'),
  ('David', 'Lee', 'participant5@aspire.local', '555-0205', '$2a$10$va/GP07bBX47g7lpg3QrwOfiI73ObrdOG3zPqosmJB.4y04.wKaA2', 'Participant', 'inactive', 'College of Business', 'Finance', 'REG-2026-0005');

INSERT INTO schedules (title, description, date, start_time, end_time, created_by) VALUES
  ('Morning Shift', 'Front desk coverage', CURRENT_DATE + 1, '08:00', '12:00', 2),
  ('Afternoon Shift', 'Operations support', CURRENT_DATE + 1, '13:00', '17:00', 2),
  ('Weekend Shift', 'Weekend staffing', CURRENT_DATE + 3, '09:00', '15:00', 3),
  ('Evening Shift', 'Closing duties', CURRENT_DATE + 5, '17:00', '21:00', 3);

INSERT INTO schedule_requests (participant_id, schedule_id, status, approved_by, approved_at) VALUES
  (4, 1, 'Approved', 2, NOW() - INTERVAL '1 day'),
  (5, 2, 'Pending', NULL, NULL),
  (6, 1, 'Pending', NULL, NULL),
  (7, 3, 'Rejected', 3, NOW() - INTERVAL '2 days');

INSERT INTO events (title, description, location, date, start_time, end_time, created_by) VALUES
  ('Team Training', 'Quarterly safety training', 'Conference Room A', CURRENT_DATE + 7, '10:00', '12:00', 2),
  ('Community Outreach', 'Local volunteer event', 'City Park', CURRENT_DATE + 10, '09:00', '14:00', 3),
  ('Past Workshop', 'Completed workshop for feedback demo', 'Main Hall', CURRENT_DATE - 3, '14:00', '16:00', 2);

INSERT INTO event_registrations (participant_id, event_id, status) VALUES
  (4, 1, 'Accepted'),
  (5, 1, 'Pending'),
  (6, 2, 'Accepted'),
  (4, 3, 'Accepted'),
  (5, 3, 'Accepted');

INSERT INTO feedback (participant_id, event_id, rating, comment) VALUES
  (4, 3, 5, 'Great session, very informative.'),
  (5, 3, 4, 'Good content, room was a bit crowded.');
