import { Feedback } from '../models/Feedback.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { sendFeedbackNotification } from '../services/emailService.js';

export async function submitFeedback(req, res, next) {
  try {
    const { event_id, rating, comment } = req.body;

    const registration = await Event.findRegistration(req.user.id, event_id);
    if (!registration || registration.status !== 'Accepted') {
      return res.status(400).json({ message: 'You must have accepted this event to submit feedback' });
    }

    const event = await Event.findById(event_id);
    const eventDateTime = new Date(`${event.date}T${event.end_time}`);
    if (eventDateTime > new Date()) {
      return res.status(400).json({ message: 'Feedback can only be submitted after the event ends' });
    }

    const existing = await Feedback.findExisting(req.user.id, event_id);
    if (existing) {
      return res.status(409).json({ message: 'Feedback already submitted for this event' });
    }

    const feedback = await Feedback.create({
      participant_id: req.user.id,
      event_id,
      rating,
      comment,
    });

    const participant = await User.findById(req.user.id);
    const supervisor = await User.findById(event.created_by);
    if (supervisor) {
      sendFeedbackNotification(supervisor, participant, event, feedback);
    }

    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
}

export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findAll({ event_id: req.query.event_id });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

export async function getFeedbackByEvent(req, res, next) {
  try {
    const feedback = await Feedback.findByEvent(req.params.eventId);
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}
