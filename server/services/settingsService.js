import pool from '../config/database.js';

export async function getSetting(key) {
  const { rows } = await pool.query('SELECT value FROM system_settings WHERE key = $1', [key]);
  return rows[0]?.value;
}

export async function getAllSettings() {
  const { rows } = await pool.query('SELECT key, value FROM system_settings');
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function updateSettings(updates) {
  for (const [key, value] of Object.entries(updates)) {
    await pool.query(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, value]
    );
  }
  return getAllSettings();
}

export async function isEmailEnabled(type) {
  const toggles = await getSetting('email_toggles');
  if (!toggles) return true;
  return toggles[type] !== false;
}
