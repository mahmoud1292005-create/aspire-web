import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { getSetting } from '../services/settingsService.js';
import {
  sendEventInvitationEmail,
  sendEventRequestNotification,
  sendEventApprovedEmail,
  sendEventRejectedEmail,
} from '../services/emailService.js';

export async function getEvents(req, res, next) {
  try {
    const events = await Event.findAll();

    if (req.user.role === 'Participant') {
      const registrations = await Event.findParticipantRegistrations(req.user.id);
      const regMap = Object.fromEntries(registrations.map((r) => [r.event_id, r]));
      const enriched = events.map((e) => ({
        ...e,
        registration: regMap[e.id] || null,
        isRequested: Boolean(regMap[e.id]),
      }));
      return res.json({ events: enriched, myRegistrations: registrations });
    }

    const pendingRegistrations = await Event.findPendingRegistrations();
    res.json({ events, pendingRegistrations });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await Event.create({ ...req.body, created_by: req.user.id });

    // Announce the new event to the configured scope of active participants
    // (this does not register them - they still need to request to join).
    const scope = await getSetting('event_invite_scope');
    const participants = await User.findActiveParticipants(scope || 'all_active_participants');
    participants.forEach((participant) => sendEventInvitationEmail(participant, event));

    res.status(201).json({ event, notifiedCount: participants.length });
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await Event.update(req.params.id, req.body);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    await Event.delete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
}

export async function requestEvent(req, res, next) {
  try {
    const { event_id } = req.body;
    const event = await Event.findById(event_id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existing = await Event.findRegistration(req.user.id, event_id);
    if (existing) {
      return res.status(409).json({ message: 'You already requested this event' });
    }

    const registration = await Event.createRegistration(req.user.id, event_id);
    const participant = await User.findById(req.user.id);
    const supervisors = await User.findSupervisors();

    supervisors.forEach((supervisor) => {
      sendEventRequestNotification(supervisor, participant, event);
    });

    res.status(201).json({ registration });
  } catch (err) {
    next(err);
  }
}

export async function approveRegistration(req, res, next) {
  try {
    const registration = await Event.findRegistrationById(req.params.registrationId);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    const updated = await Event.updateRegistrationStatusById(req.params.registrationId, 'Accepted', req.user.id);
    const participant = await User.findById(registration.participant_id);
    const event = await Event.findById(registration.event_id);

    sendEventApprovedEmail(participant, event);
    res.json({ registration: updated });
  } catch (err) {
    next(err);
  }
}

export async function rejectRegistration(req, res, next) {
  try {
    const registration = await Event.findRegistrationById(req.params.registrationId);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    const updated = await Event.updateRegistrationStatusById(req.params.registrationId, 'Declined', req.user.id);
    const participant = await User.findById(registration.participant_id);
    const event = await Event.findById(registration.event_id);

    sendEventRejectedEmail(participant, event);
    res.json({ registration: updated });
  } catch (err) {
    next(err);
  }
}
