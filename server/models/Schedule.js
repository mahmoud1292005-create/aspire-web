import pool from '../config/database.js';

export const Schedule = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT s.*, u.first_name AS creator_first_name, u.last_name AS creator_last_name
       FROM schedules s
       JOIN users u ON u.id = s.created_by
       ORDER BY s.date, s.start_time`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM schedules WHERE id = $1', [id]);
    return rows[0];
  },

  async create(data) {
    const { title, description, date, start_time, end_time, created_by } = data;
    const { rows } = await pool.query(
      `INSERT INTO schedules (title, description, date, start_time, end_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, date, start_time, end_time, created_by]
    );
    return rows[0];
  },

  async update(id, data) {
    const { title, description, date, start_time, end_time } = data;
    const { rows } = await pool.query(
      `UPDATE schedules SET title = $1, description = $2, date = $3, start_time = $4, end_time = $5
       WHERE id = $6 RETURNING *`,
      [title, description, date, start_time, end_time, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
  },
};
