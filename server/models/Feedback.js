import pool from '../config/database.js';

export const Feedback = {
  async create({ participant_id, event_id, rating, comment }) {
    const { rows } = await pool.query(
      `INSERT INTO feedback (participant_id, event_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [participant_id, event_id, rating, comment]
    );
    return rows[0];
  },

  async findAll({ event_id } = {}) {
    const values = [];
    let where = '';

    if (event_id) {
      where = 'WHERE f.event_id = $1';
      values.push(event_id);
    }

    const { rows } = await pool.query(
      `SELECT f.*, u.first_name, u.last_name, u.college, u.department, e.title AS event_title
       FROM feedback f
       JOIN users u ON u.id = f.participant_id
       JOIN events e ON e.id = f.event_id
       ${where}
       ORDER BY f.created_at DESC`,
      values
    );
    return rows;
  },

  async findByEvent(eventId) {
    const { rows } = await pool.query(
      `SELECT f.*, u.first_name, u.last_name
       FROM feedback f
       JOIN users u ON u.id = f.participant_id
       WHERE f.event_id = $1`,
      [eventId]
    );
    return rows;
  },

  async findExisting(participant_id, event_id) {
    const { rows } = await pool.query(
      'SELECT * FROM feedback WHERE participant_id = $1 AND event_id = $2',
      [participant_id, event_id]
    );
    return rows[0];
  },

  async findRecentSince(since) {
    const { rows } = await pool.query(
      `SELECT f.*, u.first_name, u.last_name, e.title AS event_title
       FROM feedback f
       JOIN users u ON u.id = f.participant_id
       JOIN events e ON e.id = f.event_id
       WHERE f.created_at >= $1
       ORDER BY f.created_at DESC`,
      [since]
    );
    return rows;
  },
};
