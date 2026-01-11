# Fix .env File Format

## The Problem

Your `.env` file has formatting issues. The error shows:
```
DATABASE_URL: "postgresql://...@localhost:5432/tigermarine?schema=public"PORT=3001
```

Notice:
- ❌ Quotes around the URL (shouldn't be there)
- ❌ `PORT=3001` is appended to the same line

## Solution: Fix .env File Format

### Correct Format

Your `.env` file should look like this:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tigermarine?schema=public
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Important Rules:

1. **No quotes around values** (unless the value itself contains spaces)
2. **Each variable on its own line**
3. **No spaces around the `=` sign** (or one space is OK, but no quotes)
4. **No trailing characters** on the same line

### Wrong Examples:

```env
# ❌ WRONG - Has quotes
DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine?schema=public"

# ❌ WRONG - PORT on same line
DATABASE_URL=postgresql://postgres:password@localhost:5432/tigermarine?schema=publicPORT=3001

# ❌ WRONG - Spaces and quotes
DATABASE_URL = "postgresql://postgres:password@localhost:5432/tigermarine?schema=public"
```

### Correct Example:

```env
# ✅ CORRECT
DATABASE_URL=postgresql://postgres:password@localhost:5432/tigermarine?schema=public
PORT=3001
```

## Step-by-Step Fix

1. **Open your `.env` file** in a text editor

2. **Find the DATABASE_URL line** - it probably looks like:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine?schema=public"PORT=3001
   ```

3. **Fix it to:**
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/tigermarine?schema=public
   PORT=3001
   ```

4. **Make sure:**
   - No quotes around the URL
   - `PORT=3001` is on a **separate line**
   - No extra characters at the end

5. **Save the file**

6. **Test again:**
   ```bash
   npm run test:db
   ```

## Complete .env Example

Here's what a complete `.env` file should look like:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tigermarine?schema=public

# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Admin (optional)
ADMIN_EMAIL=admin@tigermarine.com
ADMIN_PASSWORD=your_secure_password
```

## After Fixing

Run the test again:
```bash
npm run test:db
```

You should see:
```
✅ Database connection successful!
✅ Database query test successful!
```

Then you can run the export:
```bash
npm run export:db database-export.json
```
