import { verifyToken } from '../utils/generateToken.js';
import { jwtConfig } from '../config/jwt.js';
import { User } from '../models/User.js';

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies[jwtConfig.cookieName];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid or inactive account' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, res, next) {
  const token = req.cookies[jwtConfig.cookieName];
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
  } catch {
    // ignore invalid token
  }
  next();
}
