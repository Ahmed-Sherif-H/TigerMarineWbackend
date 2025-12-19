# Quick Start Guide

## Step 1: Create Database in PgAdmin

1. Open PgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `tigermarine`
4. Click "Save"

## Step 2: Update .env File

Open `.env` file and update the DATABASE_URL:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tigermarine?schema=public"
```

Replace:
- `postgres` with your PostgreSQL username (usually `postgres`)
- `YOUR_PASSWORD` with your PostgreSQL password
- `5432` with your PostgreSQL port (default is 5432)

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma Client based on your schema.

## Step 4: Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in your database
- Set up relationships
- Create indexes

## Step 5: (Optional) Open Prisma Studio

```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

## Step 6: Start Server

```bash
npm run dev
```

## Verify Everything Works

1. Check server: http://localhost:3001/api/health
2. Check database: Open Prisma Studio or check in PgAdmin
3. All tables should be created automatically

## Troubleshooting

**Connection Error?**
- Check PostgreSQL is running
- Verify username/password in .env
- Check port number (default 5432)
- Make sure database `tigermarine` exists

**Migration Error?**
- Make sure database exists
- Check DATABASE_URL in .env
- Try: `npx prisma migrate reset` (WARNING: deletes all data)


