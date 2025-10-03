# 🚀 Pawy Meals Demo & Testing Guide

This guide will help you set up, run, and test the complete Pawy Meals application.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18.0+** installed
- **MongoDB 4.4+** installed and running
- **pnpm** package manager
- A terminal/command prompt

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd pawy-meal
pnpm install
```

### 2. Environment Configuration

Ensure your `.env.local` file has the correct MongoDB connection:

```env
MONGODB_URI=mongodb://localhost:27017/pawy_meals
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# Option 1: If MongoDB is installed locally
mongod

# Option 2: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed the Database

```bash
pnpm run seed
```

This will create sample data including:
- 4 users (admin, chef, customer, delivery driver)
- 3 pets
- 3 meals
- 1 sample order

### 5. Start the Development Server

```bash
pnpm dev
```

The application will be available at: http://localhost:3000

## 🧪 Testing the Application

### 📱 User Authentication

#### Test Login Credentials:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@pawymeals.com | admin123 | Full system access |
| **Chef** | mario@pawymeals.com | chef123 | Meal preparation & order management |
| **Customer** | john@example.com | customer123 | Pet management & ordering |
| **Delivery** | driver@pawymeals.com | driver123 | Delivery management |

#### Login Process:
1. Go to http://localhost:3000/login
2. Select your role from the dropdown
3. Enter credentials
4. You'll be redirected to the appropriate dashboard

### 🐾 Pet Management CRUD Operations

#### Create a Pet:
```json
POST /api/pet
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 30,
  "size": "Large",
  "activityLevel": "High",
  "allergies": ["Chicken"],
  "preferredProteins": ["Beef", "Fish"],
  "ownerId": "customer-id-here"
}
```

#### Read Pets:
```bash
# Get all pets
GET /api/pet

# Get pets by owner
GET /api/pet?ownerId=customer-id

# Get pets by size
GET /api/pet?size=Large

# Get specific pet
GET /api/pet/pet-id
```

#### Update a Pet:
```json
PUT /api/pet/pet-id
{
  "age": 4,
  "weight": 32
}
```

#### Delete a Pet:
```bash
DELETE /api/pet/pet-id
```

### 🍽️ Meal Management CRUD Operations

#### Create a Meal:
```json
POST /api/menu
{
  "name": "Premium Beef Bowl",
  "description": "High-quality grass-fed beef with vegetables",
  "primaryProtein": "Beef",
  "suitableFor": {
    "sizes": ["Medium", "Large"],
    "activityLevels": ["High", "Very High"],
    "ageGroups": ["Adult"]
  },
  "ingredients": [
    {
      "name": "Grass-fed beef",
      "quantity": "200",
      "unit": "grams"
    }
  ],
  "nutrition": {
    "calories": 450,
    "protein": 35,
    "fat": 18,
    "carbohydrates": 25,
    "fiber": 4
  },
  "price": 12.99,
  "servingSize": "380g",
  "preparationTime": 25,
  "category": "Dinner"
}
```

#### Read Meals:
```bash
# Get all meals
GET /api/menu

# Filter by protein
GET /api/menu?primaryProtein=Beef

# Filter by price range
GET /api/menu?minPrice=10&maxPrice=20

# Get specific meal
GET /api/menu/meal-id
```

#### Update a Meal:
```json
PUT /api/menu/meal-id
{
  "price": 14.99,
  "preparationTime": 30
}
```

#### Delete a Meal:
```bash
DELETE /api/menu/meal-id
```

### 📦 Order Management CRUD Operations

#### Create an Order:
```json
POST /api/order
{
  "customerId": "customer-id",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "items": [
    {
      "mealId": "meal-id",
      "petId": "pet-id",
      "quantity": 2,
      "specialInstructions": "Extra sauce please"
    }
  ],
  "paymentMethod": "Credit Card",
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "scheduledDeliveryDate": "2024-01-15",
  "scheduledDeliveryTime": "2:00 PM - 4:00 PM"
}
```

#### Read Orders:
```bash
# Get all orders
GET /api/order

# Filter by customer
GET /api/order?customerId=customer-id

# Filter by status
GET /api/order?status=Pending

# Get specific order
GET /api/order/order-id
```

#### Update an Order:
```json
PUT /api/order/order-id
{
  "status": "Preparing",
  "assignedChef": "chef-id"
}
```

#### Cancel an Order:
```bash
DELETE /api/order/order-id?reason=Customer requested cancellation
```

## 🧪 Automated API Testing

### Run the Test Script:

```bash
# In browser console (after starting the app)
window.testPawyMealsAPI()

# Or run as Node.js script
node scripts/test-api.js
```

### Manual Testing with cURL:

#### Test Pet Creation:
```bash
curl -X POST http://localhost:3000/api/pet \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Dog",
    "breed": "Labrador",
    "age": 2,
    "weight": 25,
    "size": "Large",
    "activityLevel": "High",
    "ownerId": "test-owner-123"
  }'
```

#### Test User Registration:
```bash
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "role": "customer"
  }'
```

#### Test Login:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "customer123"
  }'
```

## 📊 Database Verification

### Connect to MongoDB:

```bash
# Using MongoDB shell
mongosh pawy_meals

# View collections
show collections

# Check users
db.users.find().pretty()

# Check pets
db.pets.find().pretty()

# Check meals
db.meals.find().pretty()

# Check orders
db.orders.find().pretty()
```

## 🎯 Feature Testing Checklist

### ✅ Authentication & Authorization
- [ ] User registration with different roles
- [ ] Login with email/username
- [ ] Role-based access control
- [ ] Password validation
- [ ] Session management

### ✅ Pet Management
- [ ] Create pet profiles
- [ ] View pet list with filtering
- [ ] Update pet information
- [ ] Delete/deactivate pets
- [ ] Search pets by breed/size

### ✅ Meal Management
- [ ] Create new meals
- [ ] Browse meal catalog
- [ ] Filter by protein/category/price
- [ ] Update meal details
- [ ] Remove meals from catalog

### ✅ Order Management
- [ ] Place new orders
- [ ] View order history
- [ ] Update order status
- [ ] Cancel orders
- [ ] Order status tracking

### ✅ Data Validation
- [ ] Required field validation
- [ ] Data type validation
- [ ] Business rule validation
- [ ] Error handling

### ✅ Performance
- [ ] Pagination works correctly
- [ ] Search/filter performance
- [ ] Database queries optimize
- [ ] Response times acceptable

## 🐛 Common Issues & Solutions

### MongoDB Connection Issues:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string
echo $MONGODB_URI
```

### Port Already in Use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Dependencies Issues:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
pnpm install

# Clear Next.js cache
rm -rf .next
```

### Database Reset:
```bash
# Clear and reseed database
pnpm run seed
```

## 📸 Testing Screenshots

Take screenshots for documentation:

1. **Login Page**: Different role selections
2. **Pet Management**: Create/edit/list pets
3. **Meal Catalog**: Browse and filter meals
4. **Order Process**: Complete order workflow
5. **Admin Dashboard**: Management interface
6. **API Responses**: Postman/curl results

## 🚀 Production Deployment Testing

### Build Test:
```bash
pnpm build
pnpm start
```

### Environment Variables:
- Update MongoDB URI for production
- Set secure session secrets
- Configure proper CORS settings

### Performance Testing:
- Load testing with multiple concurrent users
- Database performance under load
- API response time monitoring

## 📞 Support

If you encounter issues:

1. Check the console for error messages
2. Verify MongoDB is running
3. Ensure all environment variables are set
4. Check the GitHub issues page
5. Contact the development team

---

**Happy Testing! 🎉**

Remember: This is a comprehensive REST API demonstrating CRUD operations on three main entities (Pet, Meal, Order) with proper authentication, validation, and role-based access control.