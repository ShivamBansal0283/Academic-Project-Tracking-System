# APTS

## Apps
- backend: Express + Prisma
- frontend: Vite + React

## Setup
1) Copy envs
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`

2) Install
   - `cd backend && npm i && npx prisma generate`
   - `cd ../frontend && npm i`

3) Run (dev)
   - Backend: `npm run dev` (in `backend/`)
   - Frontend: `npm run dev` (in `frontend/`)