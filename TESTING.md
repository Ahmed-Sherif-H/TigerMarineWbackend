# Testing Your API

## 1. Test Health Endpoint

```bash
curl http://localhost:3001/api/health
```

Or open in browser: http://localhost:3001/api/health

Expected response:
```json
{
  "status": "ok",
  "message": "Tiger Marine Backend API is running"
}
```

## 2. Test Get All Models

```bash
curl http://localhost:3001/api/models
```

Expected: Empty array `[]` if no data, or array of models if data exists.

## 3. Test Get All Categories

```bash
curl http://localhost:3001/api/categories
```

## 4. Create a Test Category

```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestCategory",
    "description": "Test category description",
    "order": 1
  }'
```

## 5. Create a Test Model

```bash
curl -X POST http://localhost:3001/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "name": "TestModel",
    "description": "Test model description",
    "shortDescription": "Test",
    "specs": {
      "Length": "10 m",
      "Beam": "3 m"
    },
    "standardFeatures": ["Feature 1", "Feature 2"],
    "optionalFeatures": [
      {
        "name": "Optional 1",
        "description": "Description",
        "category": "Category",
        "price": "$1000"
      }
    ],
    "galleryFiles": ["image1.jpg"],
    "videoFiles": ["video1.mp4"],
    "interiorFiles": ["interior1.jpg"]
  }'
```

## 6. Using Postman or Thunder Client

Import these endpoints:
- GET http://localhost:3001/api/health
- GET http://localhost:3001/api/models
- GET http://localhost:3001/api/categories
- POST http://localhost:3001/api/models
- PUT http://localhost:3001/api/models/:id
- DELETE http://localhost:3001/api/models/:id

## 7. View Data in Prisma Studio

```bash
npx prisma studio
```

Opens at http://localhost:5555 - visual database browser!


