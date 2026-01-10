# Railway Shell - Quick Guide

## 🚀 How to Access Railway Dashboard Shell

### Quick Steps:

1. **Go to:** https://railway.app
2. **Click:** Your project
3. **Click:** Your Web Service (Node.js backend)
4. **Click:** "Deployments" tab (top menu)
5. **Click:** Latest deployment (first in list)
6. **Click:** "Shell" tab (next to "Logs")

**You're now in Railway's shell!** 🎉

## 📝 What to Run

Once in the shell, run these commands:

```bash
# 1. Run database migrations
npx prisma migrate deploy

# 2. Seed the database (admin + models)
npm run seed:all

# 3. Test connection (optional)
npm run test:db
```

## 🎯 Visual Path

```
Railway.app
  └── Your Project
      └── Web Service (click this!)
          └── Deployments (click this!)
              └── Latest Deployment (click this!)
                  └── Shell Tab (click this!) ← YOU ARE HERE
```

## ⚠️ Important Notes

- ✅ Shell runs **inside Railway** (database accessible)
- ✅ Environment variables are **already set**
- ✅ You're in the **project directory**
- ✅ Works like your local terminal

## 🆘 Can't Find Shell?

- Make sure you clicked on **Web Service** (not Database)
- Make sure deployment is **completed** (not "Building")
- Look for **"Shell"** tab next to **"Logs"** tab
- Try refreshing the page

## ✅ That's It!

The shell is the easiest way to run database commands on Railway!
