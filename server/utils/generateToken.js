import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}
