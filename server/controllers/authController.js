import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/generateToken.js';
import { jwtConfig } from '../config/jwt.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  generateResetToken,
  hashResetToken,
} from '../services/emailService.js';

function setTokenCookie(res, user) {
  const token = generateToken({ id: user.id, role: user.role, email: user.email });
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(jwtConfig.cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    // Frontend (Cloudflare Pages) and backend (Cloudflare Workers) are on
    // different domains in production, so the cookie must be sameSite:
    // 'none' to be sent cross-site. That requires secure: true (HTTPS),
    // which Cloudflare provides automatically. Locally (http://localhost)
    // 'lax' still works.
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function signup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { first_name, last_name, email, phone, password, college, department, registration_number } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await hashPassword(password);
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password_hash,
      role: 'Participant',
      college,
      department,
      registration_number,
    });

    sendWelcomeEmail(user);
    setTokenCookie(res, user);

    res.status(201).json({ user, redirectTo: '/participant/dashboard' });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const { password_hash, ...safeUser } = user;
    setTokenCookie(res, safeUser);

    const redirectMap = {
      Admin: '/admin/dashboard',
      Supervisor: '/supervisor/dashboard',
      Participant: '/participant/dashboard',
    };

    res.json({ user: safeUser, redirectTo: redirectMap[user.role] });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(jwtConfig.cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByEmail(req.user.email);

    if (!(await comparePassword(currentPassword, user.password_hash))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const password_hash = await hashPassword(newPassword);
    await User.updatePassword(req.user.id, password_hash);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (user) {
      const resetToken = generateResetToken();
      const token_hash = hashResetToken(resetToken);
      const expires_at = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
      await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, token_hash, expires_at]
      );

      sendPasswordResetEmail(user, resetToken);
    }

    res.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const token_hash = hashResetToken(token);

    const { rows } = await pool.query(
      `SELECT prt.*, u.email FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = $1 AND prt.expires_at > NOW()`,
      [token_hash]
    );

    if (!rows[0]) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const password_hash = await hashPassword(password);
    await User.updatePassword(rows[0].user_id, password_hash);
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [rows[0].user_id]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}
