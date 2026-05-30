# Online Learning Platform

This repository contains a full-stack online learning platform built with a Vite + React frontend and an Express/MongoDB backend. It includes user authentication, courses, quizzes, certificates, and basic admin pages.

## Quick overview

- **Frontend:** Vite + React in the repository root (`src/`).
- **Backend:** Express server and REST API in the `backend/` folder.
- **Database:** MongoDB (connect via `MONGODB_URI`).

## Features

- User registration, login (JWT / cookies)
- Courses listing and detail pages
- Quiz creation and attempts
- Certificates upload and download
- Admin user management

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or hosted)

## Quick start (development)

1. Clone the repo

```bash
git clone <repo-url>
cd online_learning_platform
```

2. Backend: install and run

```bash
cd backend
npm install
# Start backend in development (check backend/package.json for exact script)
npm run dev
```

3. Frontend: install and run (from repo root)

```bash
npm install
npm run dev
```

Open the frontend URL shown by Vite (usually http://localhost:5173) and confirm the backend API is reachable.

## Environment variables

Create a `.env` file in `backend/` with values similar to the following:

```
MONGODB_URI=mongodb://localhost:27017/learning_platform
PORT=4000
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
```

Adjust keys as needed for production.

## Important files and structure

- `backend/server.js` — Express app entry point ([backend/server.js](backend/server.js)).
- `backend/routes/` — API route definitions.
- `backend/controllers/` — Route handlers and core business logic.
- `src/` — React app source ([src/main.jsx](src/main.jsx)).
- `src/components/` — Reusable UI components.

## API notes

The backend exposes REST endpoints under `/api` (see `backend/routes/`). Common routes include authentication, courses, quizzes, certificates, and users. Inspect the route files for exact endpoints and request shapes.

## Tests and utilities

- Several test and utility scripts exist under `backend/` and `backend/scripts/` for data inspection and maintenance (e.g., `listCourses.js`, `runDbInit.js`). Review and run them as needed.

## Contributing

- Fork the repo, create a branch for your feature/fix, and open a PR with a clear description.
- Run linters and tests locally before opening PRs.

## Troubleshooting

- If MongoDB connection fails, verify `MONGODB_URI` and that the DB is running.
- Check `backend/headers.txt` and `backend/cookiejar` only for debugging; do not commit secrets.

## License & Contact

This project is provided as-is. Add a license file (`LICENSE`) if you need an explicit license. For questions, open an issue or contact the maintainers via the repository.

---

The updated README focuses on quick onboarding, where to find core code, and how to run the app locally. If you'd like, I can add a Development Notes section with common commands, or generate a `README-Backend.md` and `README-Frontend.md` with deeper details.
