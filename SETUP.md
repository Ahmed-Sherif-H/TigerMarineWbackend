# Backend Setup Guide

## 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

## 2. Create Database

```sql
CREATE DATABASE tigermarine;
```

Or using psql command line:
```bash
createdb tigermarine
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Set Up Environment Variables

Copy `.env` file and update with your database credentials:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/tigermarine?schema=public"
```

## 5. Initialize Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- Generate Prisma Client
- Create database tables based on schema.prisma

## 6. (Optional) Seed Database

If you want to migrate existing data from models.js:
```bash
node scripts/seed.js
```

## 7. Start Server

```bash
npm start
# or for development
npm run dev
```

## 8. Test API

- Health: http://localhost:3001/api/health
- Models: http://localhost:3001/api/models
- Categories: http://localhost:3001/api/categories

## Next Steps

1. Implement authentication
2. Create admin user
3. Connect frontend admin dashboard
4. Migrate existing data from models.js


