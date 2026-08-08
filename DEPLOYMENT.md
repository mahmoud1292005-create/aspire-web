# Deploying Aspire — Cloudflare + Supabase

Aspire has one supported deployment target:

- **Supabase** — Postgres database
- **Cloudflare Workers + Hyperdrive** — hosts the backend/API, connected to
  your Supabase database
- **Cloudflare Pages** — hosts the frontend
- **Cloudflare Cron Triggers** — replaces the local `node-cron` scheduler for
  event reminder emails and the daily supervisor summary

Local development still runs as a plain Node/Express process (`npm run dev`)
against the same Supabase database — the Workers path only activates when you
deploy with `wrangler`.

---

## 0. Before you start

You'll need:
- A free [Supabase account](https://supabase.com)
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Node.js](https://nodejs.org) 18+ installed locally
- Your project pushed to GitHub (for the Pages Git integration in Section 5)
- A [Mailtrap](https://mailtrap.io) account for transactional email (optional
  — without it, emails just log to the console/Worker logs instead of sending)

---

## 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**. Choose a
   name, database password, and region, then wait for it to provision.
2. Open **SQL Editor** → **New query**, paste the contents of
   [`database/schema.sql`](database/schema.sql), and run it.
3. Open another query, paste [`database/seed.sql`](database/seed.sql), and
   run it. Check **Table Editor** — you should see `users`, `schedules`,
   `events`, etc.
4. Go to **Project Settings** (gear icon) → **Database** → **Connection
   string** → **URI**, choose **Direct connection** (port 5432), and copy it.
   You'll need this in Sections 2 and 3.

---

## 2. Install Wrangler and log in

Wrangler is Cloudflare's CLI — it's already listed as a dev dependency in
`server/package.json`.

```
cd server
npm install
npx wrangler login
```

This opens a browser tab to authorize the CLI against your Cloudflare
account.

---

## 3. Create a Hyperdrive (connects Workers to Supabase)

Workers can't hold a normal long-lived database connection the way Node can,
so Cloudflare uses **Hyperdrive** as a connection-pooling proxy in front of
your Postgres database. Still from the `server` folder:

```
npx wrangler hyperdrive create aspire-db --connection-string="<your Supabase DATABASE_URL>"
```

This prints an `id`. Open `server/wrangler.jsonc` and paste it in place of
the existing `hyperdrive[0].id` placeholder value.

---

## 4. Set your secrets and deploy the backend

Sensitive values shouldn't live in `wrangler.jsonc`. Set them one at a time —
each command prompts you to paste the value:

```
npx wrangler secret put JWT_SECRET : 8XxGsL4aOb
npx wrangler secret put CLIENT_URL
npx wrangler secret put SMTP_PASS b331b4697c998fb849f25cab3c728e46
npx wrangler secret put SMTP_FROM
```

- `JWT_SECRET` — any long random string.
- `CLIENT_URL` — you won't have your Pages URL yet; use a placeholder like
  `https://placeholder.pages.dev` for now and update it in Section 6.
- `SMTP_PASS` — your Mailtrap **Send API** token (Mailtrap dashboard →
  Sending Domains → API Tokens). Leave this secret unset if you don't want
  email sending yet; the app falls back to logging emails instead of
  sending them.
- `SMTP_FROM` — e.g. `Aspire <noreply@yourdomain.com>`, using a domain
  verified with Mailtrap.

Then deploy:

```
npm run cf:deploy
```

This uploads your Worker. When it finishes, it prints a URL like
`https://aspire-server.<your-subdomain>.workers.dev` — that's your live API.
Test it:

```
curl https://aspire-server.<your-subdomain>.workers.dev/api/health
```

You should get back `{"status":"ok"}`.

---

## 5. Deploy the frontend to Cloudflare Pages

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com/) →
   **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select your `aspire` GitHub repo.
3. Set the build configuration:
   - **Framework preset**: Vite
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Expand **Environment variables** and add:
   - `VITE_API_URL` = `https://aspire-server.<your-subdomain>.workers.dev/api`
5. Click **Save and Deploy**. When it's done, you'll get a URL like
   `https://aspire.pages.dev`.

---

## 6. Point the backend at the real frontend URL

Now that you have your real Pages URL, update the `CLIENT_URL` secret from
Section 4:

```
cd server
npx wrangler secret put CLIENT_URL
```

Paste your real `https://aspire.pages.dev` URL, then redeploy:

```
npm run cf:deploy
```

---

## 7. Test it

Visit your Pages URL, sign up as a participant, log in. If login redirects
back to the login page, double check the `CLIENT_URL` secret exactly matches
your Pages URL (including `https://`, no trailing slash) — the auth cookie is
`sameSite: 'none'` in production because Pages and Workers are on different
domains, so a mismatch here is the most common cause of silent login
failures.

---

## 8. (Optional) Adding a real custom domain

1. **Frontend** — in the Pages project → **Custom domains** → add your
   domain. If your domain's DNS is already on Cloudflare, this is often a
   single click; Cloudflare configures the records for you automatically.
2. **Backend** — in the Worker → **Settings** → **Domains & Routes** → add
   something like `api.yourdomain.com`.
3. Update the `CLIENT_URL` secret to your new frontend domain, and the
   `VITE_API_URL` environment variable in Pages to your new backend domain
   (redeploy Pages after changing it).
4. Verify your domain in Mailtrap and switch `SMTP_FROM` to
   `noreply@yourdomain.com`.

---

## Notes on how this differs from a normal Node server

- **No idle cold starts** — Workers don't sleep, so there's no wake-up delay
  after inactivity.
- **Cron Triggers replace `node-cron`** — configured in `wrangler.jsonc`
  under `triggers.crons`. Cloudflare calls the Worker's `scheduled` handler
  directly on that schedule; there's no background process running inside
  your app the way `node-cron` works locally. The job logic itself lives in
  `server/jobs/reminderJobs.js` and is shared between local dev
  (`server.js` + `node-cron`) and the deployed Worker (`src/worker.js` +
  Cron Triggers), so the two paths can't drift out of sync.
- **Database queries open a fresh connection per call** — Hyperdrive pools
  connections on Cloudflare's side, so this is by design and fast, not a bug.
- **Email uses Mailtrap's HTTP Send API, not SMTP** — Workers' `nodejs_compat`
  layer doesn't reliably support the raw TCP sockets SMTP needs, so
  `server/config/email.js` sends email with a plain `fetch()` call instead.
  This is a single implementation that works identically in local Node dev
  and in the deployed Worker.
- **Local development is unaffected** — `npm run dev` in `server/` runs the
  plain Node version exactly as before; the Workers path only activates when
  you deploy with `wrangler`.
