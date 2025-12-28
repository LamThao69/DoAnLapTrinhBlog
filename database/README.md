# Database (blog_db)

This folder contains the SQL schema and example seeds for the blog project.

Files
- `schema.sql` — creates `blog_db` and all tables, indexes and constraints.
- `seeds/seed.sql` — example seed data (placeholder bcrypt hashes).

Import instructions
1. Using MySQL Workbench:
   - Open MySQL Workbench and connect to your MySQL server (host: `127.0.0.1`, port: `3306`, user: `root` by default or use your env values).
   - Go to "File → Open SQL Script..." → choose `schema.sql` → click the lightning bolt (Execute) to run the script.
   - Open `seeds/seed.sql`, replace placeholders (`BCRYPT_HASH_*`) or set `ADMIN_PASSWORD` env var in your backend before running seeds, then execute the seed script the same way.
   - You can also use the **Adminer** service provided in docker-compose at http://localhost:8080 to browse tables and run queries.

2. Or via CLI:

   mysql -u root -p < schema.sql
   mysql -u root -p blog_db < seeds/seed.sql

3. Connecting with MySQL Workbench (if server runs in Docker):
   - If using docker-compose: connect to host `127.0.0.1`. Default port is `3306` but if your host already uses 3306 the compose maps it to `3307` — try port `3307` in that case. Use username/password from `docker-compose.yml` or `.env` (`MYSQL_ROOT_PASSWORD`, `MYSQL_USER`, `MYSQL_PASSWORD`).
   - If Workbench cannot connect to `127.0.0.1:3306`/`3307`, check that Docker exposes the port and no firewall blocks it.

Notes
- If you prefer not to run seeds manually, the backend Docker entrypoint runs migrations and seeds automatically using Knex when the backend container starts.
- When replacing passwords for seeds, use bcrypt: `node -e "const bcrypt=require('bcrypt'); bcrypt.hash('Admin@123',10).then(h=>console.log(h))"` and paste the output into `seeds/seed.sql` or set `ADMIN_PASSWORD` env var.

Generating bcrypt hashes
- To generate a bcrypt hash on your machine (Node):

  node -e "const bcrypt=require('bcrypt'); bcrypt.hash('Admin@123',10).then(h=>console.log(h))"

- Replace `BCRYPT_HASH_ADMIN` in `seeds/seed.sql` with the generated hash.

Notes & mapping
- Use `posts` (status='published') for homepage listing, `categories` for filtering.
- Search: `MATCH(title,content) AGAINST (? IN NATURAL LANGUAGE MODE)` or `LIKE`.
- Only authenticated users can comment; saved posts are in `saved_posts`.

Next steps
- If you want migrations instead of raw SQL, I can add a Knex/Sequelize setup and create migrations and seeds.
- If you'd like, I can also add a Docker Compose file to run MySQL locally.