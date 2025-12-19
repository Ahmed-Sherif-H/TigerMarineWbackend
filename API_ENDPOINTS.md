# API Endpoints Reference

Base URL: `http://localhost:3001`

## Root Endpoints

- `GET /api` - API information and available endpoints
- `GET /api/health` - Health check

## Models Endpoints

- `GET /api/models` - Get all models
- `GET /api/models/:id` - Get single model by ID
- `POST /api/models` - Create new model
- `PUT /api/models/:id` - Update model
- `DELETE /api/models/:id` - Delete model

## Categories Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Testing Examples

### Get API Info
```bash
curl http://localhost:3001/api
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Get All Models
```bash
curl http://localhost:3001/api/models
```

### Get All Categories
```bash
curl http://localhost:3001/api/categories
```

### Create a Model
```bash
curl -X POST http://localhost:3001/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "name": "TestModel",
    "description": "Test description"
  }'
```


