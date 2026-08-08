import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { hashPassword, comparePassword } = await import('../utils/password.js');
const { generateToken, verifyToken } = await import('../utils/generateToken.js');

describe('password hashing', () => {
  test('hashPassword produces a bcrypt hash different from the input', async () => {
    const hash = await hashPassword('Password123!');
    assert.notEqual(hash, 'Password123!');
    assert.match(hash, /^\$2[aby]\$/);
  });

  test('comparePassword returns true for the correct password', async () => {
    const hash = await hashPassword('Password123!');
    assert.equal(await comparePassword('Password123!', hash), true);
  });

  test('comparePassword returns false for the wrong password', async () => {
    const hash = await hashPassword('Password123!');
    assert.equal(await comparePassword('WrongPassword', hash), false);
  });
});

describe('jwt tokens', () => {
  test('generateToken + verifyToken round-trips the payload', () => {
    const token = generateToken({ id: 42, role: 'Admin' });
    const decoded = verifyToken(token);
    assert.equal(decoded.id, 42);
    assert.equal(decoded.role, 'Admin');
  });

  test('verifyToken throws on a tampered token', () => {
    const token = generateToken({ id: 1, role: 'Participant' });
    const tampered = token.slice(0, -2) + 'xx';
    assert.throws(() => verifyToken(tampered));
  });
});
