# Tiger Marine Backend API

Backend server for the Tiger Marine website admin dashboard and API endpoints.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tigermarine?schema=public"
   PORT=3001
   FRONTEND_URL="http://localhost:5173"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   ADMIN_EMAIL="admin@tigermarine.com"
   ADMIN_PASSWORD="your-secure-password"
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

5. **Seed the database (optional):**
   ```bash
   npm run seed:all
   ```

6. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

## 📁 Project Structure

```
Backend/
├── config/           # Configuration files
│   └── database.js   # Database connection
├── controllers/      # Request handlers
│   ├── categoriesController.js
│   ├── eventsController.js
│   └── modelsController.js
├── routes/          # API routes
│   ├── categories.js
│   ├── events.js
│   ├── inquiries.js
│   ├── models.js
│   └── upload.js
├── services/        # Business logic
│   ├── categoriesService.js
│   ├── emailService.js
│   ├── eventsService.js
│   └── modelsService.js
├── scripts/        # Utility scripts
│   ├── seed.js           # Seed admin user
│   ├── seedAll.js        # Seed admin + import data
│   ├── importFromJson.js # Import models from JSON
│   ├── checkConnection.js # Test database connection
│   └── checkDatabase.js   # Check database status
├── prisma/         # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/         # Static files (images, etc.)
│   ├── images/
│   └── Customizer-images/
└── server.js       # Main server file
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Models
- `GET /api/models` - Get all models
- `GET /api/models/:id` - Get single model
- `POST /api/models` - Create new model (admin)
- `PUT /api/models/:id` - Update model (admin)
- `DELETE /api/models/:id` - Delete model (admin)

### Categories
- `GET /api/categories` - Get all categories with models
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Inquiries
- `POST /api/inquiries/contact` - Submit contact form
- `POST /api/inquiries/customizer` - Submit customizer inquiry
- `GET /api/inquiries` - Get all inquiries (admin)

### Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/list` - List files in folder
- `DELETE /api/upload/delete` - Delete file

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed admin user only
- `npm run seed:all` - Seed admin user + import all data
- `npm run import:json` - Import models from JSON file
- `npm run test:db` - Test database connection
- `npm run check:db` - Check database status

## 📚 Documentation

- [API Endpoints](./API_ENDPOINTS.md) - Detailed API documentation
- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Email Setup](./EMAIL_SETUP.md) - Email configuration
- [Testing](./TESTING.md) - Testing guide
- [Railway Deployment](./docs/RAILWAY_DEPLOYMENT.md) - Deployment guide for Railway
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🔒 Security Notes

- Admin endpoints require authentication (to be implemented)
- Change default admin password after first login
- Use environment variables for sensitive data
- Never commit `.env` file to git

## 🚨 Important Notes

### Database
- Always run migrations before deploying
- Backup database before major changes
- Use `prisma migrate deploy` for production

## 🐛 Troubleshooting

See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common issues.

Quick fixes:
- **Can't connect to database**: Check `.env` DATABASE_URL
- **Prisma errors**: Run `npm run prisma:generate`
- **Port already in use**: Change PORT in `.env`
- **CORS errors**: Check FRONTEND_URL in `.env`

## 📝 License

ISC
