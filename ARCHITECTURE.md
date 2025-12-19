# Backend Architecture Suggestions

## Recommended Structure

```
backend/
├── config/
│   └── database.js          # Database connection configuration
├── models/                   # Database models (Sequelize/Prisma)
│   ├── Category.js
│   ├── Model.js
│   ├── Spec.js
│   ├── Feature.js
│   └── OptionalFeature.js
├── migrations/               # Database migrations
├── controllers/              # Request handlers
│   ├── modelsController.js
│   └── categoriesController.js
├── services/                 # Business logic
│   ├── modelsService.js
│   └── categoriesService.js
├── routes/                   # API routes
│   ├── models.js
│   └── categories.js
├── middleware/               # Custom middleware
│   ├── auth.js
│   └── validation.js
├── utils/                    # Helper functions
│   └── helpers.js
└── server.js                 # Main server file
```

## Database Schema Suggestions

### Categories Table
- id (Primary Key)
- name
- description
- image
- heroImage
- order (for sorting)
- createdAt
- updatedAt

### Models Table
- id (Primary Key)
- categoryId (Foreign Key → Categories)
- name
- description
- shortDescription
- imageFile
- heroImageFile
- contentImageFile
- section2Title
- section2Description
- createdAt
- updatedAt

### Specs Table
- id (Primary Key)
- modelId (Foreign Key → Models)
- key (e.g., "Length", "Beam")
- value (e.g., "9.5 m")
- createdAt
- updatedAt

### Features Table (Standard Features)
- id (Primary Key)
- modelId (Foreign Key → Models)
- feature (text)
- order (for sorting)
- createdAt
- updatedAt

### OptionalFeatures Table
- id (Primary Key)
- modelId (Foreign Key → Models)
- name
- description
- category
- price
- order (for sorting)
- createdAt
- updatedAt

### GalleryImages Table
- id (Primary Key)
- modelId (Foreign Key → Models)
- filename
- order (for sorting)
- createdAt
- updatedAt

### VideoFiles Table
- id (Primary Key)
- modelId (Foreign Key → Models)
- filename
- order (for sorting)
- createdAt
- updatedAt

### InteriorFiles Table
- id (Primary Key)
- modelId (Foreign Key → Models)
- filename
- order (for sorting)
- createdAt
- updatedAt

## Technology Stack Recommendations

1. **ORM**: Prisma (recommended) or Sequelize
   - Prisma: Type-safe, modern, great migrations
   - Sequelize: More mature, flexible

2. **Authentication**: JWT tokens
   - Use `jsonwebtoken` package
   - Protect admin routes

3. **Validation**: Joi or express-validator
   - Validate all incoming data

4. **File Upload**: Multer
   - For handling image/video uploads

5. **Environment Variables**: dotenv
   - Store database credentials securely

## API Endpoints Structure

### Models
- GET    /api/models              - Get all models
- GET    /api/models/:id          - Get single model
- POST   /api/models              - Create model (admin only)
- PUT    /api/models/:id          - Update model (admin only)
- DELETE /api/models/:id          - Delete model (admin only)

### Categories
- GET    /api/categories          - Get all categories
- GET    /api/categories/:id     - Get single category with models
- POST   /api/categories          - Create category (admin only)
- PUT    /api/categories/:id      - Update category (admin only)
- DELETE /api/categories/:id    - Delete category (admin only)

### Auth
- POST   /api/auth/login          - Admin login
- POST   /api/auth/logout         - Logout
- GET    /api/auth/me             - Get current user

## Implementation Steps

1. Set up database connection
2. Create database schema (migrations)
3. Set up Prisma/Sequelize models
4. Create services layer
5. Create controllers
6. Set up routes
7. Add authentication middleware
8. Add validation
9. Test all endpoints
10. Connect frontend admin dashboard


