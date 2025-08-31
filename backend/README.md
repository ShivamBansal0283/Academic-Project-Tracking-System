# APTS Server (Express + Prisma)

Backend for your Vite React APTS app. Provides REST endpoints for projects, courses, tasks, and teams.

## Quick start

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (Postgres/Neon), `PORT`, `ORIGIN`.
2. Install deps
   ```bash
   bun i   # or pnpm i / npm i / yarn
   ```
3. Generate client and run migrations
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. (Optional) Seed demo data
   ```bash
   bun run seed   # or: npx tsx prisma/seed.ts
   ```
5. Start the dev server
   ```bash
   bun run dev    # or: npm run dev
   ```
6. Test: open http://localhost:4000/health

### Auth for local dev
Send headers:
- `X-User-Id`: a valid user id (from `prisma studio` or after seeding)
- `X-User-Role`: `ADMIN` | `TEACHER` | `STUDENT`

### Endpoints (initial)
- `GET /api/projects?status=NEW|ACTIVE|COMPLETED|REJECTED`
- `POST /api/projects` { title, description, courseId, departmentId, deadline? }
- `GET /api/projects/:id`
- `PATCH /api/projects/:id` { title?, description?, deadline?, status? }
- `PUT /api/projects/:id/approve`
- `PUT /api/projects/:id/reject` { reason }

- `GET /api/courses`
- `GET /api/courses/departments`
- `POST /api/courses` { name, code, description?, departmentId, teacherId }
- `POST /api/courses/:id/enroll` { studentId? } (defaults to auth user)

- `GET /api/projects/:projectId/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks/:id/submit` { teamId, notes? }

- `POST /api/teams` { name, projectId, leaderId }
- `POST /api/teams/:id/invite` { email }
- `PUT /api/teams/invitations/:invId/accept`
- `PUT /api/teams/invitations/:invId/decline`
- `DELETE /api/teams/:id/members/:userId`

Extend as needed (grading, file uploads, admin dashboards, etc.).
