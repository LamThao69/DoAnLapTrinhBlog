#!/bin/bash
set -e

echo "=== Waiting for PostgreSQL to be ready ==="
# Test PostgreSQL connection
for i in {1..30}; do
  if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✓ PostgreSQL is ready!"
    break
  fi
  echo "Attempt $i/30: Waiting for PostgreSQL..."
  sleep 2
done

echo "=== Running migrations ==="
npx knex migrate:latest --knexfile ./knexfile.js

echo "=== Running seeds ==="
npx knex seed:run --knexfile ./knexfile.js || echo "Seeds may have already run (expected on idempotent seeds)"

echo "=== Starting Node.js server ==="
exec npm run start
