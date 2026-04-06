@echo off
echo Creating folder structure...

mkdir src 2>nul
mkdir src\config 2>nul
mkdir src\interfaces 2>nul
mkdir src\middlewares 2>nul
mkdir src\middlewares\auth 2>nul
mkdir src\middlewares\validation 2>nul
mkdir src\routes 2>nul
mkdir src\routes\user 2>nul
mkdir src\controllers 2>nul
mkdir src\controllers\user 2>nul
mkdir src\services 2>nul
mkdir src\services\email 2>nul
mkdir src\services\auth 2>nul
mkdir src\services\user 2>nul
mkdir prisma 2>nul
mkdir ..\docs 2>nul
mkdir ..\docs\backend 2>nul
mkdir ..\docs\backend\auth 2>nul

echo Folder structure created!
echo.
echo Running bun install...
bun install

echo.
echo Setup complete!
echo Next steps:
echo 1. Copy .env.example to .env and fill in your values
echo 2. Run: bun run db:generate
echo 3. Run: bun run db:push
