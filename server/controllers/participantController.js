import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';

export async function getParticipants(req, res, next) {
  try {
    const participants = await User.findAll({ role: 'Participant' });
    res.json({ participants });
  } catch (err) {
    next(err);
  }
}

export async function getParticipant(req, res, next) {
  try {
    const participant = await User.findById(req.params.id);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    if (req.user.role === 'Participant' && req.user.id !== Number(req.params.id)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    res.json({ participant });
  } catch (err) {
    next(err);
  }
}

export async function updateParticipant(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (req.user.role === 'Participant' && req.user.id !== id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    if (req.user.role === 'Participant') {
      const { first_name, last_name, phone, college, department, registration_number } = req.body;
      const participant = await User.update(id, { first_name, last_name, phone, college, department, registration_number });
      return res.json({ participant });
    }

    const participant = await User.update(id, req.body);
    res.json({ participant });
  } catch (err) {
    next(err);
  }
}
