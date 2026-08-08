// Utility for generating a bcrypt hash to paste into database/seed.sql, or
// for manually resetting a user's password_hash directly in the DB.
// Usage: node scripts/generateHash.js "SomePassword123!"
import { hashPassword } from '../utils/password.js';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generateHash.js "<password>"');
  process.exit(1);
}

const hash = await hashPassword(password);
console.log(hash);
