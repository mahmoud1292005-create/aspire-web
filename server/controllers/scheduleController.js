import { Schedule } from '../models/Schedule.js';
import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';
import {
  sendScheduleApprovedEmail,
  sendScheduleRejectedEmail,
  sendScheduleRequestNotification,
} from '../services/emailService.js';

export async function getSchedules(req, res, next) {
  try {
    const schedules = await Schedule.findAll();

    if (req.user.role === 'Participant') {
      const requests = await Assignment.findByParticipant(req.user.id);
      const requestMap = Object.fromEntries(requests.map((r) => [r.schedule_id, r]));

      const enriched = schedules.map((s) => ({
        ...s,
        request: requestMap[s.id] || null,
        isRequested: Boolean(requestMap[s.id]),
      }));

      return res.json({ schedules: enriched, myRequests: requests });
    }

    const pendingRequests = await Assignment.findPending();
    res.json({ schedules, pendingRequests });
  } catch (err) {
    next(err);
  }
}

export async function createSchedule(req, res, next) {
  try {
    const schedule = await Schedule.create({ ...req.body, created_by: req.user.id });
    res.status(201).json({ schedule });
  } catch (err) {
    next(err);
  }
}

export async function updateSchedule(req, res, next) {
  try {
    const schedule = await Schedule.update(req.params.id, req.body);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ schedule });
  } catch (err) {
    next(err);
  }
}

export async function deleteSchedule(req, res, next) {
  try {
    await Schedule.delete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    next(err);
  }
}

export async function requestSchedule(req, res, next) {
  try {
    const { schedule_id } = req.body;
    const schedule = await Schedule.findById(schedule_id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const existing = await Assignment.findExisting(req.user.id, schedule_id);
    if (existing) {
      return res.status(409).json({ message: 'You already requested this schedule' });
    }

    const request = await Assignment.create(req.user.id, schedule_id);
    const participant = await User.findById(req.user.id);
    const supervisors = await User.findSupervisors();

    supervisors.forEach((supervisor) => {
      sendScheduleRequestNotification(supervisor, participant, schedule);
    });

    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
}

export async function approveRequest(req, res, next) {
  try {
    const assignment = await Assignment.findById(req.params.requestId);
    if (!assignment) return res.status(404).json({ message: 'Request not found' });

    const updated = await Assignment.updateStatus(req.params.requestId, 'Approved', req.user.id);
    const participant = await User.findById(assignment.participant_id);
    const schedule = await Schedule.findById(assignment.schedule_id);

    sendScheduleApprovedEmail(participant, schedule);
    res.json({ request: updated });
  } catch (err) {
    next(err);
  }
}

export async function rejectRequest(req, res, next) {
  try {
    const assignment = await Assignment.findById(req.params.requestId);
    if (!assignment) return res.status(404).json({ message: 'Request not found' });

    const updated = await Assignment.updateStatus(req.params.requestId, 'Rejected', req.user.id);
    const participant = await User.findById(assignment.participant_id);
    const schedule = await Schedule.findById(assignment.schedule_id);

    sendScheduleRejectedEmail(participant, schedule);
    res.json({ request: updated });
  } catch (err) {
    next(err);
  }
}
