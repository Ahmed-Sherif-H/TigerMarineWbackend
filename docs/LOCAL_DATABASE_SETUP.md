# Local Database Setup Guide

## Why Use Local Database?

✅ **Benefits:**
- Safe testing without affecting production data
- Faster development (no network latency)
- Can test destructive operations
- No risk of breaking production
- Free to use

❌ **Using Production Database:**
- Risk of corrupting production data
- Slower (network latency)
- Can't test freely
- Other users might be affected

## Setup Steps

### Option 1: PostgreSQL (Recommended)

#### Step 1: Install PostgreSQL

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the password you set for `postgres` user
4. Default port: `5432`

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Step 2: Create Local Database

Open PostgreSQL command line (pgAdmin or terminal):

```sql
-- Connect as postgres user
-- Create database
CREATE DATABASE tigermarine_local;

-- Create user (optional, or use postgres user)
CREATE USER tigermarine_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tigermarine_local TO tigermarine_user;
```

#### Step 3: Update .env File

Create or update your `.env` file:

```env
# Local Database (for development)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/tigermarine_local?schema=public"

# Or with custom user:
# DATABASE_URL="postgresql://tigermarine_user:your_password@localhost:5432/tigermarine_local?schema=public"

# Other environment variables...
PORT=3001
FRONTEND_URL=http://localhost:3000
# ... rest of your variables
```

#### Step 4: Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npx prisma migrate dev

# Or push schema directly (if no migrations yet)
npx prisma db push
```

#### Step 5: Seed Database (Optional)

```bash
# Seed admin user
npm run prisma:seed

# Or seed everything (admin + models)
npm run seed:all
```

### Option 2: Docker (Easier, No Installation)

#### Step 1: Install Docker Desktop

Download from: https://www.docker.com/products/docker-desktop

#### Step 2: Run PostgreSQL Container

```bash
docker run --name tigermarine-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tigermarine_local \
  -p 5432:5432 \
  -d postgres:15
```

#### Step 3: Update .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tigermarine_local?schema=public"
```

#### Step 4: Run Migrations

```bash
npm run prisma:generate
npx prisma migrate dev
npm run seed:all
```

### Option 3: SQLite (Simplest, No Installation)

#### Step 1: Update prisma/schema.prisma

Change datasource:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### Step 2: Update .env

```env
DATABASE_URL="file:./dev.db"
```

#### Step 3: Run Migrations

```bash
npm run prisma:generate
npx prisma migrate dev
npm run seed:all
```

**Note:** SQLite has limitations, but good for quick testing.

## Switching Between Local and Production

### Method 1: Separate .env Files

Create two files:
- `.env.local` - Local database
- `.env.production` - Production database

Then use:
```bash
# For local development
cp .env.local .env
npm run dev

# For production (before deploy)
cp .env.production .env
```

### Method 2: Environment Variable Override

Keep production in `.env`, override locally:

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine_local?schema=public"
npm run dev

# Windows CMD
set DATABASE_URL=postgresql://postgres:password@localhost:5432/tigermarine_local?schema=public
npm run dev

# Mac/Linux
DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine_local?schema=public" npm run dev
```

### Method 3: .env.local (Recommended)

Create `.env.local` file (add to .gitignore):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine_local?schema=public"
```

Then modify your code to load `.env.local` first (or use a package like `dotenv-cli`).

## Quick Setup Script

Create `setup-local-db.js`:

```javascript
require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

console.log('🚀 Setting up local database...\n');

try {
  console.log('1. Generating Prisma Client...');
  execSync('npm run prisma:generate', { stdio: 'inherit' });
  
  console.log('\n2. Running migrations...');
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  
  console.log('\n3. Seeding database...');
  execSync('npm run seed:all', { stdio: 'inherit' });
  
  console.log('\n✅ Local database setup complete!');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
```

Add to package.json:
```json
"scripts": {
  "setup:local": "node setup-local-db.js"
}
```

Then run:
```bash
npm run setup:local
```

## Verify Setup

```bash
# Test connection
npm run test:db

# Open Prisma Studio to view data
npm run prisma:studio
```

## Current Setup Check

To see what database you're currently using:

```bash
# Check .env file
cat .env | grep DATABASE_URL

# Or in Node.js
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

## Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `pg_isready` or check services
- Verify port 5432 is correct
- Check firewall settings

### Authentication Failed
- Verify username/password in DATABASE_URL
- Check PostgreSQL user permissions

### Database Doesn't Exist
- Create it: `CREATE DATABASE tigermarine_local;`
- Or let Prisma create it: `npx prisma db push`

### Migration Issues
- Reset database: `npx prisma migrate reset` (⚠️ deletes all data)
- Or: `npx prisma db push --force-reset`

## Recommended Workflow

1. **Development:** Use local database (`.env.local`)
2. **Testing:** Use local database
3. **Production:** Use Render database (`.env` or Render environment variables)

## Next Steps

1. Set up local PostgreSQL (or Docker)
2. Create local database
3. Update `.env` with local DATABASE_URL
4. Run migrations: `npx prisma migrate dev`
5. Seed data: `npm run seed:all`
6. Test locally
7. When ready, push to GitHub (Render will use production database)

