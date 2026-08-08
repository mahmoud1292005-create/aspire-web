import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://fake:fake@localhost:5432/fake';

// pool is a plain mutable object ({ query() {...} }), so tests can swap out
// `pool.query` for an in-memory fake instead of hitting a real database.
const pool = (await import('../config/database.js')).default;
const app = (await import('../app.js')).default;
const { hashPassword } = await import('../utils/password.js');

let server;
let baseUrl;

function fakeUserRow(overrides = {}) {
  return {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email: 'participant1@aspire.local',
    phone: null,
    role: 'Participant',
    status: 'active',
    college: null,
    department: null,
    registration_number: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
});

describe('GET /api/health', () => {
  test('returns 200 ok without touching the database', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok' });
  });
});

describe('unknown routes', () => {
  test('returns 404 with a JSON body', async () => {
    const res = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.message, 'Route not found');
  });
});

describe('custom JSON body parser', () => {
  test('parses a valid JSON body', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.message, 'Validation failed');
  });

  test('rejects malformed JSON with 400 instead of crashing', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not valid json',
    });
    assert.equal(res.status, 400);
  });

  test('GET requests are not blocked waiting on a body', async () => {
    const res = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
    assert.equal(res.status, 200);
  });
});

describe('POST /api/auth/login', () => {
  test('rejects an unknown email with 401', async (t) => {
    t.mock.method(pool, 'query', async () => ({ rows: [] }));

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@aspire.local', password: 'Password123!' }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.message, 'Invalid email or password');
  });

  test('rejects the wrong password with 401', async (t) => {
    const hash = await hashPassword('CorrectPassword1!');
    t.mock.method(pool, 'query', async () => ({
      rows: [fakeUserRow({ password_hash: hash })],
    }));

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'participant1@aspire.local', password: 'WrongPassword' }),
    });

    assert.equal(res.status, 401);
  });

  test('logs in successfully and sets an httpOnly cookie', async (t) => {
    const hash = await hashPassword('CorrectPassword1!');
    t.mock.method(pool, 'query', async () => ({
      rows: [fakeUserRow({ password_hash: hash })],
    }));

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'participant1@aspire.local', password: 'CorrectPassword1!' }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.user.email, 'participant1@aspire.local');
    assert.equal(body.user.password_hash, undefined, 'password_hash must never be returned');
    assert.equal(body.redirectTo, '/participant/dashboard');

    const setCookie = res.headers.get('set-cookie') || '';
    assert.match(setCookie, /token=/);
    assert.match(setCookie, /HttpOnly/i);
  });

  test('rejects an inactive account with 403', async (t) => {
    const hash = await hashPassword('CorrectPassword1!');
    t.mock.method(pool, 'query', async () => ({
      rows: [fakeUserRow({ password_hash: hash, status: 'inactive' })],
    }));

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'participant1@aspire.local', password: 'CorrectPassword1!' }),
    });

    assert.equal(res.status, 403);
  });
});

describe('auth-protected routes', () => {
  test('/api/auth/me returns 401 with no cookie', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
  });

  test('/api/admin/dashboard returns 401 with no cookie', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.equal(res.status, 401);
  });
});
