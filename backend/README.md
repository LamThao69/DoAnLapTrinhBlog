# Backend (Express + Knex)

This backend skeleton uses Express, Knex (MySQL) and is Dockerized.

Quick start (local with Docker Compose)
1. Copy `.env.example` to `.env` and adjust values if needed.
2. Run: docker-compose up --build
3. Services:
   - MySQL: localhost:3306 (if port 3306 is already used on your machine, the compose file maps the DB to host port 3307)
   - Adminer: http://localhost:8080 (user/password from .env)
   - Backend API: http://localhost:4000
   - Frontend served by Nginx: http://localhost

Run locally without Docker (Windows)
1. Install Node.js (v18+) and MySQL Server (or use an existing MySQL server).
2. Copy `.env.example` to `.env` and update DB credentials to point to your local MySQL (`DB_HOST=127.0.0.1`, `DB_USER`, `DB_PASSWORD`).
3. From the `backend/` folder run:
   - `npm install`
   - `npx knex migrate:latest --knexfile ./knexfile.js`
   - `npx knex seed:run --knexfile ./knexfile.js`
   - `npm run start`
4. Serve frontend (from repo root):
   - `npx serve Front-end -l 3000` (or open `Front-end/index.html` directly in browser).
5. Connect to DB via MySQL Workbench: Host `127.0.0.1`, Port `3306`, Username/Password as in your `.env`.

Notes
- Migrations and seeds are run automatically by the backend entrypoint (see `entrypoint.sh`) when using Docker.
- To change the seeded admin password set `ADMIN_PASSWORD` in the backend env file before bringing up the stack.

Next steps (optional):
- Add HTTPS (Traefik or reverse proxy with certbot) for production.
- Add CI (GitHub Actions) to run tests and build images.
- Expand API endpoints and add tests (Jest + Supertest).
