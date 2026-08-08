import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import { Feedback } from '../models/Feedback.js';
import { Event } from '../models/Event.js';

export async function getDashboard(req, res, next) {
  try {
    const pendingRequests = await Assignment.findPending();
    const recentFeedback = await Feedback.findRecentSince(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const events = await Event.findAll();
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter((e) => e.date === today);

    res.json({ pendingRequests, recentFeedback, todayEvents });
  } catch (err) {
    next(err);
  }
}

export async function getSupervisorParticipants(req, res, next) {
  try {
    const participants = await User.findAll({ role: 'Participant' });
    res.json({ participants });
  } catch (err) {
    next(err);
  }
}
