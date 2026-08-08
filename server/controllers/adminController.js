import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { getAllSettings, updateSettings } from '../services/settingsService.js';
import {
  getParticipantsReport,
  getEventsReport,
  getSchedulesReport,
  getFeedbackReport,
} from '../services/reportService.js';

export async function getDashboard(req, res, next) {
  try {
    const [participants, events, schedules, feedback] = await Promise.all([
      getParticipantsReport(),
      getEventsReport(),
      getSchedulesReport(),
      getFeedbackReport(),
    ]);

    res.json({
      stats: {
        totalParticipants: participants.summary.total_participants,
        activeParticipants: participants.summary.active_participants,
        totalEvents: events.summary.totalEvents,
        totalSchedules: schedules.summary.totalSchedules,
        averageRating: feedback.summary.average_rating,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await User.findAll({ role: 'Participant' });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { first_name, last_name, email, phone, password, role, status, college, department, registration_number } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const password_hash = await hashPassword(password);
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password_hash,
      role: role || 'Participant',
      college,
      department,
      registration_number,
    });

    if (status) await User.update(user.id, { status });
    const created = await User.findById(user.id);
    res.status(201).json({ user: created });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.update(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'Admin' && req.user.id === user.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }
    await User.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getSupervisors(req, res, next) {
  try {
    const supervisors = await User.findAll();
    const filtered = supervisors.filter((u) => u.role === 'Supervisor' || u.role === 'Admin');
    res.json({ supervisors: filtered });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req, res, next) {
  try {
    const settings = await getAllSettings();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSystemSettings(req, res, next) {
  try {
    const settings = await updateSettings(req.body);
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function participantsReport(req, res, next) {
  try {
    res.json(await getParticipantsReport());
  } catch (err) {
    next(err);
  }
}

export async function eventsReport(req, res, next) {
  try {
    res.json(await getEventsReport());
  } catch (err) {
    next(err);
  }
}

export async function schedulesReport(req, res, next) {
  try {
    res.json(await getSchedulesReport());
  } catch (err) {
    next(err);
  }
}

export async function feedbackReport(req, res, next) {
  try {
    res.json(await getFeedbackReport());
  } catch (err) {
    next(err);
  }
}
