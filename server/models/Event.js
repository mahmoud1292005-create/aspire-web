import pool from '../config/database.js';

export const Event = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT e.*, u.first_name AS creator_first_name, u.last_name AS creator_last_name
       FROM events e
       JOIN users u ON u.id = e.created_by
       ORDER BY e.date, e.start_time`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return rows[0];
  },

  async create(data) {
    const { title, description, location, date, start_time, end_time, created_by } = data;
    const { rows } = await pool.query(
      `INSERT INTO events (title, description, location, date, start_time, end_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, location, date, start_time, end_time, created_by]
    );
    return rows[0];
  },

  async update(id, data) {
    const { title, description, location, date, start_time, end_time } = data;
    const { rows } = await pool.query(
      `UPDATE events SET title = $1, description = $2, location = $3, date = $4, start_time = $5, end_time = $6
       WHERE id = $7 RETURNING *`,
      [title, description, location, date, start_time, end_time, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
  },

  async getRegistrations(eventId) {
    const { rows } = await pool.query(
      `SELECT er.*, u.first_name, u.last_name, u.email
       FROM event_registrations er
       JOIN users u ON u.id = er.participant_id
       WHERE er.event_id = $1`,
      [eventId]
    );
    return rows;
  },

  async createRegistration(participant_id, event_id) {
    const { rows } = await pool.query(
      `INSERT INTO event_registrations (participant_id, event_id)
       VALUES ($1, $2) RETURNING *`,
      [participant_id, event_id]
    );
    return rows[0];
  },

  async findRegistration(participant_id, event_id) {
    const { rows } = await pool.query(
      'SELECT * FROM event_registrations WHERE participant_id = $1 AND event_id = $2',
      [participant_id, event_id]
    );
    return rows[0];
  },

  async findRegistrationById(id) {
    const { rows } = await pool.query(
      `SELECT er.*, e.title, e.date, e.start_time, e.created_by,
              w.first_name AS participant_first_name, w.last_name AS participant_last_name, w.email AS participant_email
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       JOIN users w ON w.id = er.participant_id
       WHERE er.id = $1`,
      [id]
    );
    return rows[0];
  },

  async findPendingRegistrations() {
    const { rows } = await pool.query(
      `SELECT er.*, e.title, e.date, e.start_time, e.end_time,
              w.first_name AS participant_first_name, w.last_name AS participant_last_name, w.email AS participant_email,
              w.college AS participant_college, w.department AS participant_department
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       JOIN users w ON w.id = er.participant_id
       WHERE er.status = 'Pending'
       ORDER BY er.created_at ASC`
    );
    return rows;
  },

  async updateRegistrationStatusById(id, status, approved_by) {
    const { rows } = await pool.query(
      `UPDATE event_registrations SET status = $1, approved_by = $2, approved_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, approved_by, id]
    );
    return rows[0];
  },

  async findParticipantRegistrations(participantId) {
    const { rows } = await pool.query(
      `SELECT er.*, e.title, e.description, e.location, e.date, e.start_time, e.end_time
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       WHERE er.participant_id = $1
       ORDER BY e.date DESC`,
      [participantId]
    );
    return rows;
  },

  async findUpcomingForReminders(hoursAhead) {
    const { rows } = await pool.query(
      `SELECT er.*, e.title, e.location, e.date, e.start_time,
              u.email, u.first_name, u.last_name
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       JOIN users u ON u.id = er.participant_id
       WHERE er.status = 'Accepted'
         AND er.reminder_sent_at IS NULL
         AND (e.date + e.start_time) BETWEEN NOW() AND NOW() + ($1 || ' hours')::interval`,
      [hoursAhead]
    );
    return rows;
  },

  async markReminderSent(id) {
    await pool.query(
      'UPDATE event_registrations SET reminder_sent_at = NOW() WHERE id = $1',
      [id]
    );
  },
};
