import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
dotenv.config();

// SQL DATE columns are parsed into JS Date objects by default, which get
// serialized to full UTC timestamps (e.g. "2026-07-25T21:00:00.000Z") and
// can shift by a day depending on server timezone. Keep DATE as the raw
// "YYYY-MM-DD" string instead so dates display and round-trip correctly.
pg.types.setTypeParser(1082, (value) => value);

let nodePool = null;
let isWorkersRuntime = null;

// Detect whether we're running on Cloudflare Workers (via `cloudflare:workers`,
// which only resolves inside the Workers runtime) or plain Node (Render/local).
// This lets every model file keep calling `pool.query(...)` unchanged on both
// platforms — only this file needs to know which environment it's in.
async function detectRuntime() {
  if (isWorkersRuntime !== null) return isWorkersRuntime;
  try {
    await import('cloudflare:workers');
    isWorkersRuntime = true;
  } catch {
    isWorkersRuntime = false;
  }
  return isWorkersRuntime;
}

function getNodePool() {
  if (nodePool) return nodePool;

  const connectionString = process.env.DATABASE_URL;
  const isSupabase =
    process.env.DB_SSL === 'true' ||
    connectionString?.includes('supabase.com') ||
    connectionString?.includes('supabase.co');

  nodePool = new pg.Pool({
    connectionString,
    ...(isSupabase && {
      ssl: { rejectUnauthorized: false },
    }),
  });

  nodePool.on('error', (err) => {
    console.error('Unexpected database error', err);
  });

  return nodePool;
}

const pool = {
  async query(text, params) {
    if (await detectRuntime()) {
      // Cloudflare Workers: Hyperdrive maintains the actual connection pool
      // on Cloudflare's side, so creating a new Client per query is fast
      // and is what Cloudflare recommends (see Hyperdrive docs).
      const { env } = await import('cloudflare:workers');
      const { Client } = await import('pg');
      const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
      await client.connect();
      try {
        return await client.query(text, params);
      } finally {
        await client.end();
      }
    }

    return getNodePool().query(text, params);
  },
};

export default pool;
