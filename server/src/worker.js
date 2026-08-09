// Entry point used only when deploying to Cloudflare Workers (via `wrangler
// deploy` / `npm run cf:deploy`). Local development still uses server.js
// (plain `node server.js`) — this file is not used in that path at all.
//
// Express keeps working almost unmodified here: `httpServerHandler` bridges
// Workers' fetch-per-request model to Express's normal `app.listen()` model.
import { httpServerHandler } from 'cloudflare:node';
import app from '../app.js';

import { getSetting } from '../services/settingsService.js';
import { sendEventReminders, sendDailySummaries } from '../jobs/reminderJobs.js';
import { executionContextStorage } from '../utils/executionContext.js';

app.listen(3000);
const httpHandler = httpServerHandler({ port: 3000 });

// Every request's ctx (and its ctx.waitUntil) gets stashed here, for the
// duration of that request's async call chain, so background.js can read
// it back synchronously from inside emailService - see
// utils/executionContext.js for why this needs to be AsyncLocalStorage
// rather than a dynamic import.
function fetchWithContext(request, env, ctx) {
  return executionContextStorage.run(ctx, () => httpHandler.fetch(request, env, ctx));
}

// --- Cron jobs -------------------------------------------------------------
// node-cron (used in server.js for local dev) only works inside a
// long-running Node process, which Workers doesn't have. Cloudflare's
// equivalent is Cron Triggers: Cloudflare calls this `scheduled` handler on
// the schedule configured in wrangler.jsonc, instead of a timer running
// inside our own process. The actual job logic lives in jobs/reminderJobs.js
// so local dev and the deployed Worker can never drift out of sync.

async function handleScheduled(event) {
  // event.cron tells us which of the crons configured in wrangler.jsonc fired.
  if (event.cron === '0 * * * *') {
    await sendEventReminders();
    return;
  }

  if (event.cron === '* * * * *') {
    const timeSetting = await getSetting('daily_summary_time');
    const configured = (timeSetting || '08:00').replace(/"/g, '');
    const now = new Date();
    const current = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
    if (current === configured) {
      await sendDailySummaries();
    }
  }
}

export default {
  fetch: fetchWithContext,
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event));
  },
};
