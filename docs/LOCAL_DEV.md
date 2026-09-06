# CollegeKhoj — Local Development (Website Only)

This covers running the **student website + backend API + MySQL** on your
own machine, without Docker or Jenkins (those come later).

## 1. Prerequisites

- Node.js 20+
- MySQL 8.x running locally (or any reachable MySQL instance)

## 2. Database

```bash
mysql -u root -p < database/schema.sql
# Optional, local dev only — inserts one clearly-labelled DEMO college:
mysql -u root -p < database/seed_demo.sql
```

Create an app-specific DB user rather than using root in real use:

```sql
CREATE USER 'collegekhoj_app'@'%' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON collegekhoj.* TO 'collegekhoj_app'@'%';
FLUSH PRIVILEGES;
```

## 3. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set DB_HOST=localhost, DB_USER, DB_PASSWORD, JWT_SECRET
npm install
npm run dev
```

The API listens on `http://localhost:4000`. Check `http://localhost:4000/api/health`.

## 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The site runs on `http://localhost:5173` and talks to the API via `VITE_API_BASE_URL`.

## 5. Creating your first accounts

There's no self-serve admin signup (by design — `POST /api/auth/register`
only allows `student` or `college` roles). To get an admin account for
local testing, register as a student, then manually promote the row:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Log out and back in afterward so a fresh JWT carries the new role.

## 6. What's included in this pass

- Full student website: Home, Search (with filters/sort/pagination),
  College Details (tabbed), Course Explorer/Details, Compare (2–3
  colleges), Find My College (explainable questionnaire, no black-box
  score), College Map (Leaflet + OpenStreetMap), Admissions (live
  OPEN/UPCOMING/CLOSING_SOON/CLOSED status), Reviews, Login/Register,
  Student Dashboard, Saved Colleges, Application Checklist, Profile.
- A working (simplified) College Portal: claim a college, submit an
  update request (info/courses/fees/admissions/facilities/gallery) —
  everything queues for admin review before going live.
- A working (simplified) Admin Panel: dashboard with data-quality
  alerts, verify/publish colleges, moderate reviews, resolve college
  update requests, audit log viewer.

## 7. Known gaps to build next

- Admin "Add/Edit College" and granular Manage Courses/Fees/Admissions
  CRUD screens (currently colleges are created via `POST /api/colleges`
  and go straight into the approval queue — there's no admin UI form
  for it yet).
- Admin "Manage Users" and "Reports"/"Analytics" charts pages.
- Gallery upload (S3) — the schema and update-request flow support it,
  but there's no file-upload UI yet.
- Notification delivery (email/browser) — the `notifications` table
  and triggers for it aren't wired up yet.
- Docker, Nginx, Jenkins, Prometheus/Grafana, and AWS deployment config
  — intentionally deferred per your last message.
