# Switch to Local Database

## Current Setup
- Production DB: Render PostgreSQL (currently in use)
- Local DB: PostgreSQL database named "tigermarine"

## Steps to Switch

### 1. Update .env File

Open your `.env` file and change the DATABASE_URL:

**From (Production):**
```env
DATABASE_URL="postgresql://boat_db_h4vf_user:eVchYmnJNzm6oZd9VMwmzi2BqMBLhnRf@dpg-d54kin6mcj7s73et7d50-a.virginia-postgres.render.com/boat_db_h4vf"
```

**To (Local):**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tigermarine?schema=public"
```

**Replace `YOUR_PASSWORD` with your PostgreSQL password**

### 2. Test Connection

```bash
npm run test:db
```

### 3. Run Migrations (if needed)

```bash
npx prisma migrate dev
```

Or if you want to reset and start fresh:
```bash
npx prisma migrate reset
```

### 4. Seed Database

```bash
npm run seed:all
```

### 5. Verify

```bash
npm run prisma:studio
```

This opens Prisma Studio where you can see your local data.

## Switch Back to Production

When you're done testing and want to deploy:

1. Restore production URL in `.env`
2. Or use Render's environment variables (they override .env)

## Quick Commands

```bash
# Test local connection
npm run test:db

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run seed:all

# View data
npm run prisma:studio
```

