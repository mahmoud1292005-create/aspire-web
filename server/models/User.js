import pool from '../config/database.js';

const userFields = 'id, first_name, last_name, email, phone, role, status, college, department, registration_number, created_at, updated_at';

export const User = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT ${userFields}, password_hash FROM users WHERE email = $1`,
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${userFields} FROM users WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async create({
    first_name,
    last_name,
    email,
    phone,
    password_hash,
    role = 'Participant',
    college = null,
    department = null,
    registration_number = null,
  }) {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, college, department, registration_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${userFields}`,
      [first_name, last_name, email, phone, password_hash, role, college, department, registration_number]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    for (const key of ['first_name', 'last_name', 'email', 'phone', 'role', 'status', 'college', 'department', 'registration_number']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${userFields}`,
      values
    );
    return rows[0];
  },

  async updatePassword(id, password_hash) {
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, id]
    );
  },

  async findAll({ role, status } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (role) {
      conditions.push(`role = $${i++}`);
      values.push(role);
    }
    if (status) {
      conditions.push(`status = $${i++}`);
      values.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT ${userFields} FROM users ${where} ORDER BY created_at DESC`,
      values
    );
    return rows;
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  },

  async findSupervisors() {
    const { rows } = await pool.query(
      `SELECT ${userFields} FROM users WHERE role IN ('Supervisor', 'Admin') AND status = 'active'`
    );
    return rows;
  },

  async findActiveParticipants(scope = 'all_active_participants') {
    if (scope === 'approved_schedule_participants') {
      const { rows } = await pool.query(
        `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.status, u.created_at, u.updated_at
         FROM users u
         JOIN schedule_requests sr ON sr.participant_id = u.id
         WHERE u.role = 'Participant' AND u.status = 'active' AND sr.status = 'Approved'`
      );
      return rows;
    }

    const { rows } = await pool.query(
      `SELECT ${userFields} FROM users WHERE role = 'Participant' AND status = 'active'`
    );
    return rows;
  },
};
