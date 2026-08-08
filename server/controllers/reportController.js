import {
  getParticipantsReport,
  getEventsReport,
  getSchedulesReport,
  getFeedbackReport,
} from '../services/reportService.js';

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
