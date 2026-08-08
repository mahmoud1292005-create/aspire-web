import pool from '../config/database.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { getSetting } from '../services/settingsService.js';
import { getSupervisorDailySummary } from '../services/reportService.js';
import { sendEventReminderEmail, sendDailySummaryEmail } from '../services/emailService.js';

export async function sendEventReminders() {
  try {
    const hoursSetting = await getSetting('event_reminder_hours');
    const hours = Number(hoursSetting) || 24;
    const upcoming = await Event.findUpcomingForReminders(hours);

    for (const reg of upcoming) {
      sendEventReminderEmail(
        { email: reg.email, first_name: reg.first_name, last_name: reg.last_name },
        { title: reg.title, date: reg.date, start_time: reg.start_time, location: reg.location }
      );
      await Event.markReminderSent(reg.id);
    }
  } catch (err) {
    console.error('Event reminder job failed:', err.message);
  }
}

export async function sendDailySummaries() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const supervisors = await User.findSupervisors();
    const summary = await getSupervisorDailySummary();

    for (const supervisor of supervisors) {
      const { rows } = await pool.query(
        'SELECT id FROM daily_summary_log WHERE summary_date = $1 AND supervisor_id = $2',
        [today, supervisor.id]
      );

      if (rows.length > 0) continue;

      sendDailySummaryEmail(supervisor, summary);
      await pool.query(
        'INSERT INTO daily_summary_log (summary_date, supervisor_id) VALUES ($1, $2)',
        [today, supervisor.id]
      );
    }
  } catch (err) {
    console.error('Daily summary job failed:', err.message);
  }
}
