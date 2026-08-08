import pool from '../config/database.js';

export const Assignment = {
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT sr.*, s.title, s.date, s.start_time, s.end_time,
              w.first_name AS participant_first_name, w.last_name AS participant_last_name, w.email AS participant_email
       FROM schedule_requests sr
       JOIN schedules s ON s.id = sr.schedule_id
       JOIN users w ON w.id = sr.participant_id
       WHERE sr.id = $1`,
      [id]
    );
    return rows[0];
  },

  async findByParticipant(participantId) {
    const { rows } = await pool.query(
      `SELECT sr.*, s.title, s.description, s.date, s.start_time, s.end_time
       FROM schedule_requests sr
       JOIN schedules s ON s.id = sr.schedule_id
       WHERE sr.participant_id = $1
       ORDER BY s.date DESC`,
      [participantId]
    );
    return rows;
  },

  async findPending() {
    const { rows } = await pool.query(
      `SELECT sr.*, s.title, s.date, s.start_time, s.end_time,
              w.first_name AS participant_first_name, w.last_name AS participant_last_name, w.email AS participant_email,
              w.college AS participant_college, w.department AS participant_department
       FROM schedule_requests sr
       JOIN schedules s ON s.id = sr.schedule_id
       JOIN users w ON w.id = sr.participant_id
       WHERE sr.status = 'Pending'
       ORDER BY sr.created_at ASC`
    );
    return rows;
  },

  async create(participant_id, schedule_id) {
    const { rows } = await pool.query(
      `INSERT INTO schedule_requests (participant_id, schedule_id)
       VALUES ($1, $2) RETURNING *`,
      [participant_id, schedule_id]
    );
    return rows[0];
  },

  async findExisting(participant_id, schedule_id) {
    const { rows } = await pool.query(
      'SELECT * FROM schedule_requests WHERE participant_id = $1 AND schedule_id = $2',
      [participant_id, schedule_id]
    );
    return rows[0];
  },

  async updateStatus(id, status, approved_by) {
    const { rows } = await pool.query(
      `UPDATE schedule_requests SET status = $1, approved_by = $2, approved_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, approved_by, id]
    );
    return rows[0];
  },
};
