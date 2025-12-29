@echo off
echo Starting Backend Server...
echo.
echo Make sure you have:
echo 1. Installed dependencies: npm install
echo 2. Database configured in .env file
echo 3. Prisma migrated: npx prisma migrate dev
echo.
cd /d %~dp0
npm run dev




