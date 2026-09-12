# Night Class Schedule

Public weekly schedule showing which teacher is teaching Form V / Form VI each night.
Teachers log in with pre-created accounts to add themselves to a night; anyone can
view the schedule without logging in.

## Stack
- Next.js (App Router)
- Vercel Postgres (database)
- Custom auth: bcrypt-hashed passwords + iron-session cookie (no third-party auth service)
- Tailwind CSS
- Vercel (hosting)

Everything — code, database, and hosting — lives under one Vercel project, so there's
only one dashboard to deal with.

## Setup

### 1. Push this repo to GitHub, then import it into Vercel
1. Push the repo to GitHub.
2. Go to https://vercel.com/new and import it. Deploy once (it will fail to build
   fully-functional pages without a database yet, but that's fine).

### 2. Add a Postgres database
1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database → Postgres**, and connect it to this project.
3. Vercel automatically adds the `POSTGRES_URL` etc. environment variables to your
   project — you don't need to copy/paste keys manually.
4. Still in the Storage tab, open the **Query** tab and paste in everything from
   `db/schema.sql`, then run it. This creates the `teachers` and `schedule` tables.

### 3. Add your session secret
1. In Vercel project **Settings → Environment Variables**, add `SESSION_SECRET` with
   any long random string (e.g. run `openssl rand -base64 32` locally, or just mash
   the keyboard for 40+ characters).
2. Redeploy so the new env variable takes effect.

### 4. Create your first admin account
There's no signup form on purpose. To create the first admin:
1. Generate a bcrypt hash for your chosen password. Easiest way: run this once
   locally (needs Node + this repo's `node_modules`, or use any bcrypt hash
   generator site you trust):
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password-here', 10))"
   ```
2. In the Vercel Postgres **Query** tab, run:
   ```sql
   insert into teachers (name, email, password_hash, is_admin, must_change_password)
   values ('Your Name', 'you@example.com', 'paste-the-bcrypt-hash-here', true, false);
   ```
3. Log in at `/login` with that email/password. You'll see an "Admin panel" link on
   your dashboard.

From then on, use the Admin Panel in the app to add every other teacher — no more
manual SQL needed for new accounts.

### 5. Local development (optional)
```bash
npm install
vercel env pull .env.local   # pulls POSTGRES_URL etc. from your Vercel project
npm run dev
```

## How it works
- `/` — public schedule, no login required.
- `/login` — teacher login (custom email + password, checked against the `teachers`
  table).
- `/dashboard` — logged-in teacher marks/cancels their own nights. First login forces
  a password change.
- `/admin` — admin-only: add teachers, remove any schedule entry.

## Notes
- Teacher accounts are created by the admin only — no public signup.
- Passwords are hashed with bcrypt before being stored; nothing is ever stored in
  plain text.
- Sessions are a signed, encrypted cookie (iron-session) — no session table needed.
