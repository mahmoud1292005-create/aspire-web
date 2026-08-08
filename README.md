# Aspire

Full-stack participant management application with role-based access for Participants, Supervisors, and Admins.

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, React Hook Form, React Calendar, React Hot Toast
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Email:** Nodemailer (SMTP)

## Project Structure

```
aspire/
├── client/          # React frontend (Vite) - deploys to Cloudflare Pages
├── server/          # Express API - runs locally with Node, deploys to
│                     # Cloudflare Workers (server/src/worker.js) via wrangler
├── database/         # schema.sql & seed.sql
├── DEPLOYMENT.md      # Cloudflare + Supabase deployment guide
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

## Setup with Supabase

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Choose a name, database password, and region
4. Wait until the project is ready

### 2. Run the database schema

1. In Supabase, open **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy all of [`database/schema.sql`](database/schema.sql), paste, and click **Run**
4. Open another query, paste [`database/seed.sql`](database/seed.sql), and **Run**

Check **Table Editor** — you should see `users`, `schedules`, `events`, etc.

### 3. Get your connection string

1. **Project Settings** (gear) → **Database**
2. Under **Connection string**, pick **URI**
3. Use **Direct connection** (port 5432) for this Express app
4. Copy the URI and replace `RzgK9FIMCHl46ZDR` with your database password

### 4. Environment

```powershell
copy .env.example .env
```

Edit `D:\aspire\.env`:

```env
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-xx-xx.pooler.supabase.com:5432/postgres
DB_SSL=true
```

### 5. Install dependencies

```bash
npm run install:all
```

### 6. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Setup (local PostgreSQL — optional)

```bash
createdb aspire_db
psql -d aspire_db -f database/schema.sql
psql -d aspire_db -f database/seed.sql
```

Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aspire_db` and `DB_SSL=false`.

## Seeded Accounts

All accounts use password: **Password123!**

| Role       | Email                        |
|------------|------------------------------|
| Admin      | admin@aspire.local           |
| Supervisor | supervisor1@aspire.local     |
| Supervisor | supervisor2@aspire.local     |
| Participant| participant1@aspire.local    |
| Participant| participant2@aspire.local    |
| Participant| participant3@aspire.local    |
| Participant| participant4@aspire.local    |
| Participant| participant5@aspire.local    |

## Email Configuration

Email is sent via [Mailtrap's](https://mailtrap.io/) HTTP Send API (not raw
SMTP), so the only values needed are an API token and a from-address. Leave
`SMTP_PASS` blank in development and emails will log to the server console
instead of sending.

```
SMTP_PASS=your-mailtrap-send-api-token
SMTP_FROM=Aspire <noreply@aspire.local>
```

## Features

- Participant signup (with college, department, registration number), schedule requests, event accept/decline, feedback
- Supervisor schedule/event management, approvals, reports
- Admin user management, system settings, reports
- Automated emails: welcome, schedule approval/rejection, event invitations, reminders, password reset, daily supervisor summary

## API Health Check

```
GET http://localhost:5000/api/health
```

## Testing

```bash
cd server
npm test
```

Runs the server test suite (Node's built-in test runner) against a stubbed
database — no live Supabase connection needed.

## Deployment

Aspire deploys to **Cloudflare (Pages + Workers) with Supabase** as the
database — see [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full step-by-step
guide.
