import crypto from 'crypto';
import { runInBackground } from '../utils/background.js';
import { sendEmail, isEmailConfigured, getFromAddress } from '../config/email.js';
import { isEmailEnabled } from './settingsService.js';

async function sendMail({ to, subject, html, type }) {
  if (type && !(await isEmailEnabled(type))) {
    console.log(`Email disabled for type: ${type}`);
    return;
  }

  if (!isEmailConfigured()) {
    console.log('--- EMAIL (console fallback) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    console.log('--------------------------------');
    return;
  }
  try {
    await sendEmail({ to, subject, html });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

export function sendWelcomeEmail(user) {
  runInBackground(() => {
    sendMail({
      to: user.email,
      subject: 'Welcome to Aspire',
      type: 'welcome',
      html: `<h2>Welcome, ${user.first_name}!</h2>
        <p>Your participant account has been created successfully.</p>
        <p>You can now log in and request available schedules.</p>`,
    });
  });
}

export function sendScheduleApprovedEmail(participant, schedule) {
  runInBackground(() => {
    sendMail({
      to: participant.email,
      subject: 'Schedule Request Approved',
      type: 'scheduleApproved',
      html: `<h2>Schedule Approved</h2>
        <p>Hi ${participant.first_name}, your request for <strong>${schedule.title}</strong> on ${schedule.date} has been approved.</p>
        <p>Time: ${schedule.start_time} - ${schedule.end_time}</p>`,
    });
  });
}

export function sendScheduleRejectedEmail(participant, schedule) {
  runInBackground(() => {
    sendMail({
      to: participant.email,
      subject: 'Schedule Request Rejected',
      type: 'scheduleRejected',
      html: `<h2>Schedule Rejected</h2>
        <p>Hi ${participant.first_name}, your request for <strong>${schedule.title}</strong> on ${schedule.date} was not approved.</p>`,
    });
  });
}

export function sendScheduleRequestNotification(supervisor, participant, schedule) {
  runInBackground(() => {
    sendMail({
      to: supervisor.email,
      subject: 'New Schedule Request',
      type: 'scheduleRequest',
      html: `<h2>New Schedule Request</h2>
        <p>${participant.first_name} ${participant.last_name} requested <strong>${schedule.title}</strong> on ${schedule.date}.</p>
        <p>Please review and approve or reject the request.</p>`,
    });
  });
}

export function sendEventInvitationEmail(participant, event) {
  runInBackground(() => {
    sendMail({
      to: participant.email,
      subject: `New Event: ${event.title}`,
      type: 'eventInvitation',
      html: `<h2>New Event Available</h2>
        <p>Hi ${participant.first_name}, a new event <strong>${event.title}</strong> is now open for requests.</p>
        <p>Date: ${event.date} | Time: ${event.start_time} - ${event.end_time}</p>
        <p>Location: ${event.location || 'TBD'}</p>
        <p>Log in to request a spot.</p>`,
    });
  });
}

export function sendEventReminderEmail(participant, event) {
  runInBackground(() => {
    sendMail({
      to: participant.email,
      subject: `Reminder: ${event.title}`,
      type: 'eventReminder',
      html: `<h2>Event Reminder</h2>
        <p>Hi ${participant.first_name}, this is a reminder for <strong>${event.title}</strong>.</p>
        <p>Date: ${event.date} | Time: ${event.start_time}</p>
        <p>Location: ${event.location || 'TBD'}</p>`,
    });
  });
}

export function sendEventRequestNotification(supervisor, participant, event) {
  runInBackground(() => {
    sendMail({
      to: supervisor.email,
      subject: 'New Event Registration Request',
      type: 'eventRegistration',
      html: `<h2>New Event Registration Request</h2>
        <p>${participant.first_name} ${participant.last_name} requested to join <strong>${event.title}</strong> on ${event.date}.</p>
        <p>Please review and approve or reject the request.</p>`,
    });
  });
}

export function sendEventApprovedEmail(participant, event) {
  runInBackground(() => {
    sendMail({
      to: participant.email,
      subject: 'Event Registration Approved',
      type: 'eventRegistration',
      html: `<h2>Registration Approved</h2>
        <p>Hi ${participant.first_name}, your request to join <strong>${event.title}</strong> on ${event.date} has been approved.</p>
        <p>Time: ${event.start_time} - ${event.end_time}</p>
        <p>Location: ${event.location || 'TBD'}</p>`,
    });
  });
}

export function sendEventRejectedEmail(participant, event) {
  runInBackground(() => {
    sendMail({
      to: participant.email,
      subject: 'Event Registration Rejected',
      type: 'eventRegistration',
      html: `<h2>Registration Not Approved</h2>
        <p>Hi ${participant.first_name}, your request to join <strong>${event.title}</strong> on ${event.date} was not approved.</p>`,
    });
  });
}

export function sendFeedbackNotification(supervisor, participant, event, feedback) {
  runInBackground(() => {
    sendMail({
      to: supervisor.email,
      subject: 'New Feedback Submitted',
      type: 'feedbackSubmitted',
      html: `<h2>New Feedback</h2>
        <p>${participant.first_name} ${participant.last_name} submitted feedback for <strong>${event.title}</strong>.</p>
        <p>Rating: ${feedback.rating}/5</p>
        <p>Comment: ${feedback.comment || 'No comment'}</p>`,
    });
  });
}

export function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  runInBackground(() => {
    sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      type: 'passwordReset',
      html: `<h2>Password Reset</h2>
        <p>Hi ${user.first_name}, click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>`,
    });
  });
}

export function sendDailySummaryEmail(supervisor, summary) {
  runInBackground(() => {
    sendMail({
      to: supervisor.email,
      subject: 'Daily Supervisor Summary',
      type: 'dailySummary',
      html: `<h2>Daily Summary</h2>
        <p>Hi ${supervisor.first_name}, here is your daily digest:</p>
        <ul>
          <li>Pending schedule requests: ${summary.pendingRequests}</li>
          <li>New event registrations (24h): ${summary.newRegistrations}</li>
          <li>New feedback (24h): ${summary.newFeedback}</li>
        </ul>`,
    });
  });
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
