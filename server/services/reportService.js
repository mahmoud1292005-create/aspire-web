import pool from '../config/database.js';

export async function getParticipantsReport() {
  const { rows: counts } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE role = 'Participant') AS total_participants,
      COUNT(*) FILTER (WHERE role = 'Participant' AND status = 'active') AS active_participants,
      COUNT(*) FILTER (WHERE role = 'Participant' AND status = 'inactive') AS inactive_participants,
      COUNT(*) FILTER (WHERE role = 'Supervisor') AS total_supervisors,
      COUNT(*) FILTER (WHERE role = 'Admin') AS total_admins
    FROM users
  `);

  const { rows: assignmentStats } = await pool.query(`
    SELECT u.id, u.first_name, u.last_name, u.email, u.status,
      COUNT(sr.id) FILTER (WHERE sr.status = 'Approved') AS approved_schedules,
      COUNT(sr.id) FILTER (WHERE sr.status = 'Pending') AS pending_schedules,
      COUNT(sr.id) FILTER (WHERE sr.status = 'Rejected') AS rejected_schedules
    FROM users u
    LEFT JOIN schedule_requests sr ON sr.participant_id = u.id
    WHERE u.role = 'Participant'
    GROUP BY u.id
    ORDER BY u.last_name
  `);

  return { summary: counts[0], participants: assignmentStats };
}

export async function getEventsReport() {
  const { rows: events } = await pool.query(`
    SELECT e.id, e.title, e.date, e.location,
      COUNT(er.id) AS total_invited,
      COUNT(er.id) FILTER (WHERE er.status = 'Accepted') AS accepted,
      COUNT(er.id) FILTER (WHERE er.status = 'Declined') AS declined,
      COUNT(er.id) FILTER (WHERE er.status = 'Pending') AS pending
    FROM events e
    LEFT JOIN event_registrations er ON er.event_id = e.id
    GROUP BY e.id
    ORDER BY e.date DESC
  `);

  const summary = events.reduce(
    (acc, e) => {
      acc.totalEvents += 1;
      acc.totalInvited += Number(e.total_invited);
      acc.totalAccepted += Number(e.accepted);
      return acc;
    },
    { totalEvents: 0, totalInvited: 0, totalAccepted: 0 }
  );

  summary.attendanceRate =
    summary.totalInvited > 0
      ? Math.round((summary.totalAccepted / summary.totalInvited) * 100)
      : 0;

  return { summary, events };
}

export async function getSchedulesReport() {
  const { rows: schedules } = await pool.query(`
    SELECT s.id, s.title, s.date, s.start_time, s.end_time,
      COUNT(sr.id) AS total_requests,
      COUNT(sr.id) FILTER (WHERE sr.status = 'Approved') AS approved,
      COUNT(sr.id) FILTER (WHERE sr.status = 'Pending') AS pending,
      COUNT(sr.id) FILTER (WHERE sr.status = 'Rejected') AS rejected
    FROM schedules s
    LEFT JOIN schedule_requests sr ON sr.schedule_id = s.id
    GROUP BY s.id
    ORDER BY s.date DESC
  `);

  const summary = schedules.reduce(
    (acc, s) => {
      acc.totalSchedules += 1;
      acc.totalRequests += Number(s.total_requests);
      acc.totalApproved += Number(s.approved);
      return acc;
    },
    { totalSchedules: 0, totalRequests: 0, totalApproved: 0 }
  );

  summary.fillRate =
    summary.totalRequests > 0
      ? Math.round((summary.totalApproved / summary.totalRequests) * 100)
      : 0;

  return { summary, schedules };
}

export async function getFeedbackReport() {
  const { rows: summaryRows } = await pool.query(`
    SELECT COUNT(*) AS total_feedback, ROUND(AVG(rating)::numeric, 2) AS average_rating
    FROM feedback
  `);

  const { rows: byEvent } = await pool.query(`
    SELECT e.id, e.title, e.date,
      COUNT(f.id) AS feedback_count,
      ROUND(AVG(f.rating)::numeric, 2) AS average_rating
    FROM events e
    LEFT JOIN feedback f ON f.event_id = e.id
    GROUP BY e.id
    HAVING COUNT(f.id) > 0
    ORDER BY average_rating DESC
  `);

  const { rows: recent } = await pool.query(`
    SELECT f.*, u.first_name, u.last_name, e.title AS event_title
    FROM feedback f
    JOIN users u ON u.id = f.participant_id
    JOIN events e ON e.id = f.event_id
    ORDER BY f.created_at DESC
    LIMIT 20
  `);

  return { summary: summaryRows[0], byEvent, recent };
}

export async function getSupervisorDailySummary() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { rows: pending } = await pool.query(
    `SELECT COUNT(*) AS count FROM schedule_requests WHERE status = 'Pending'`
  );

  const { rows: registrations } = await pool.query(
    `SELECT COUNT(*) AS count FROM event_registrations WHERE created_at >= $1`,
    [since]
  );

  const { rows: feedback } = await pool.query(
    `SELECT COUNT(*) AS count FROM feedback WHERE created_at >= $1`,
    [since]
  );

  return {
    pendingRequests: Number(pending[0].count),
    newRegistrations: Number(registrations[0].count),
    newFeedback: Number(feedback[0].count),
  };
}
