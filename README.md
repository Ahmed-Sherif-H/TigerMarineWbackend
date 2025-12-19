# Tiger Marine Backend API

Backend server for the Tiger Marine website admin dashboard and API endpoints.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Models
- `GET /api/models` - Get all models
- `GET /api/models/:id` - Get single model
- `POST /api/models` - Create new model
- `PUT /api/models/:id` - Update model
- `DELETE /api/models/:id` - Delete model

### Categories
- `GET /api/categories` - Get all categories

## Development Notes

- The backend currently reads/writes to `../frontend/src/data/models.js`
- For production, consider using a database (MongoDB, PostgreSQL, etc.)
- Add authentication/authorization for admin endpoints
- Implement proper error handling and validation

## Next Steps

1. Set up database connection
2. Implement authentication (JWT, sessions, etc.)
3. Add file upload for images
4. Create proper models.js parser/writer
5. Add validation middleware
6. Set up environment variables


