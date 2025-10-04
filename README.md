# 🐾 Pawy Meals - Pet Nutrition Management System

A comprehensive full-stack web application for managing pet nutrition with custom meal plans, order tracking, and multi-role user management.

## 👥 Team Members

- **6610608 Ayyada Kriangkaisak** 
- **6511252 Thapana Dermbangchon** 

## 📋 Project Description

Pawy Meals is a home cooked meal for our lovely furry friends. This plat form able to let customer make the meal order for each pet. Admin and cook are able to use this platform to organized meal and order. 

### 🎯 Key Features

- **Multi-Role Authentication**: Customer, Chef, Admin
- **Pet Profile Management**: Detailed pet profiles with dietary requirements and health information
- **Custom Meal Planning**: Nutritionally balanced meals tailored to individual pets
- **Order Management**: Complete order lifecycle 
- **Admin Dashboard**: Comprehensive management tools for administrators
- **Chef Interface**: Tools for meal preparation and order management
- **Delivery Tracking**: Real-time order status updates

### 🏗️ Data Model (3 Main Entities)

#### 1. **Pet** 🐕
- Pet profiles with breed, age, weight, size
- Activity levels and dietary requirements
- Allergies 


#### 2. **Meal** 🍽️
- Detailed meal information 
- Pricing and availability 
- Plan for the meal

#### 3. **Order** 📦
- Customer and pet information
- Selected meals and plan
- Delivery address 
- Order status tracking


## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- MongoDB 4.4 or higher
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pawy-meal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Update the `.env.local` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pawy_meals
   NODE_ENV=development
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB Community Edition
   mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 API Documentation

### � Authentication & User Management

#### POST /api/customer
- **Description**: Register a new customer account
- **Required Fields**: `username`, `email`, `firstName`, `lastName`, `phoneNumber`, `password`, `streetAddress`, `city`, `state`, `zipCode`
- **Optional Fields**: `accountType` (defaults to 'Customer')
- **Response**: Customer object (password excluded)

#### GET /api/customer
- **Description**: Retrieve customers with filtering and pagination
- **Query Parameters**:
  - `email`: Get specific customer by email
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**: Array of customer objects or single customer

#### POST /api/employee
- **Description**: Create employee accounts (Admin/Chef)
- **Required Fields**: `name`, `email`, `password`, `role`, `phone`
- **Optional Fields**: `isActive` (defaults to true)

#### GET /api/employee
- **Description**: Retrieve all employees
- **Response**: Array of employee objects

#### GET /api/user
- **Description**: General user management endpoint
- **Query Parameters**: `role`, `isActive`

#### POST /api/login
- **Description**: Authenticate users (all roles)
- **Required Fields**: `email`, `password`
- **Response**: User session data

### 🐾 Pet Management API

#### GET /api/pet
- **Description**: Retrieve pets by customer
- **Query Parameters**:
  - `customer_id`: Filter by customer ID (required)
- **Response**: Array of pet objects

#### POST /api/pet
- **Description**: Create a new pet profile
- **Required Fields**: `name`, `breed`, `age`, `weight`, `gender`, `neutered`, `bodyCondition`, `activityLevel`
- **Optional Fields**: `allergies` (array), `customer_id`
- **Auto-calculated**: `size` (based on weight)

#### GET /api/pet/[id]
- **Description**: Get specific pet by ID
- **Response**: Pet object

#### PUT /api/pet/[id]
- **Description**: Update specific pet profile
- **Fields**: All pet fields are updatable

#### DELETE /api/pet/[id]
- **Description**: Delete pet profile

### 🍽️ Menu Management API

#### GET /api/menu
- **Description**: Retrieve all active menu items with pagination
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
- **Response**: Paginated menu items with ingredients populated

#### POST /api/menu
- **Description**: Create a new menu item
- **Required Fields**: `name`, `description`
- **Optional Fields**: `image_url`, `ingredients` (array), `isActive`
- **Response**: Created menu item

#### GET /api/menu/[id]
- **Description**: Get specific menu item by ID
- **Response**: Menu item with populated ingredients

#### PUT /api/menu/[id]
- **Description**: Update specific menu item
- **Fields**: All menu fields are updatable

#### DELETE /api/menu
- **Description**: Soft delete multiple menu items
- **Query Parameters**: `ids` (comma-separated menu IDs)

### 📦 Order Management API

#### GET /api/order
- **Description**: Retrieve all orders with pagination
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Response**: Paginated orders array

#### POST /api/order
- **Description**: Create a new order
- **Required Fields**: `plan`, `quantity`, `price`, `customer_email`, `selectedMenu`, `selectedPet`
- **Auto-generated**: `date_order`, `order_status` ('pending')
- **Response**: Created order object

#### GET /api/order/[orderId]
- **Description**: Get specific order by ID
- **Response**: Order object

#### PUT /api/order
- **Description**: Bulk update orders (status changes)
- **Required Fields**: `ids` (array), `updateData`
- **Common use**: Status updates for order management

### 🍲 Recipe Management API

#### GET /api/recipe
- **Description**: Retrieve all recipes
- **Response**: Array of recipe objects

#### POST /api/recipe
- **Description**: Create a new recipe
- **Required Fields**: `name`, `ingredients`, `instructions`
- **Optional Fields**: `description`, `cookingTime`, `servings`

### 🧾 Ingredient Management API

#### GET /api/ingredients
- **Description**: Retrieve all available ingredients
- **Response**: Array of ingredient objects for recipe/menu creation

### 📤 File Upload API

#### POST /api/upload
- **Description**: Upload images for menu items
- **File Requirements**: 
  - Formats: JPEG, PNG, WebP
  - Max size: 5MB
  - Auto-generates unique filename with timestamp
- **Response**: File URL for database storage

### 🔧 Utility APIs

#### POST /api/fix-db
- **Description**: Database maintenance endpoint (removes old indexes)
- **Usage**: Fix database schema conflicts
- **Response**: Success/failure status

## 🖼️ Screenshots

### 🏠 Home Page
![Home Page](./screenshots/home.png)
*Main landing page with role-based navigation*

### 🔐 Login System
![Login Page](./screenshots/login.png)
*Multi-role login with role selection*

### 📱 Customer Dashboard
![Customer Dashboard](./screenshots/customer-dashboard.png)
*Customer view with pet management and order history*

### 👨‍🍳 Chef Dashboard
![Chef Dashboard](./screenshots/chef-dashboard.png)
*Chef interface for meal preparation and order management*

### 👨‍💼 Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)
*Administrative interface for system management*

### 🐕 Pet Profile Management
![Pet Profile](./screenshots/pet-profile.png)
*Detailed pet profile creation and management*

### 🍽️ Meal Catalog
![Meal Catalog](./screenshots/meal-catalog.png)
*Browse and filter available meals*

### 🛒 Order Management
![Order Management](./screenshots/order-management.png)
*Complete order lifecycle management*

## 🗄️ Database Schema

### MongoDB Collections

#### 👤 Customer Collection
```javascript
{
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['Customer', 'Admin', 'Chef'],
    default: 'Customer'
  },
  streetAddress: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  // Legacy fields for backward compatibility
  name: String,
  mobile_no: String,
  address: String,
  zipcode: String,
  memberNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### 👨‍💼 Employee Collection
```javascript
{
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'chef', 'delivery']
  },
  phone: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### 🐾 Pet Collection
```javascript
{
  name: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  neutered: {
    type: Boolean,
    required: true
  },
  allergies: [{
    type: String
  }],
  bodyCondition: {
    type: String,
    enum: ['underweight', 'ideal', 'overweight'],
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true
  },
  customer_id: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### 🍽️ Menu Collection
```javascript
{
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  image_url: {
    type: String
  },
  ingredients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### 🥕 Ingredient Collection
```javascript
{
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  nutritionalInfo: {
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    calories: Number
  },
  allergenInfo: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

#### 📦 Order Collection
```javascript
{
  plan: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  date_order: {
    type: Date,
    required: true,
    default: Date.now
  },
  customer_email: {
    type: String,
    required: true
  },
  order_status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'cooking', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  selectedMenu: {
    type: String,
    required: true
  },
  menuName: String,
  menuDescription: String,
  menuIngredients: [String],
  menuPrice: Number,
  selectedPet: {
    type: String,
    required: true
  },
  petName: String,
  petBreed: String,
  petAge: Number,
  petWeight: Number,
  petAllergies: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### 📝 Recipe Collection
```javascript
{
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  ingredients: [{
    name: String,
    quantity: String,
    unit: String
  }],
  instructions: [{
    step: Number,
    description: String,
    duration: Number // in minutes
  }],
  cookingTime: {
    type: Number // in minutes
  },
  servings: Number,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: String, // Employee ID
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Database Relationships

- **Customer** ↔ **Pet**: One-to-Many (customer_id)
- **Customer** ↔ **Order**: One-to-Many (customer_email)
- **Pet** ↔ **Order**: Many-to-One (selectedPet)
- **Menu** ↔ **Order**: Many-to-One (selectedMenu)
- **Menu** ↔ **Ingredient**: Many-to-Many (ingredients array with ObjectId refs)
- **Employee** ↔ **Recipe**: One-to-Many (createdBy)

### Indexes

- **Customer**: `username`, `email`, `phoneNumber` (unique)
- **Employee**: `email` (unique)
- **Pet**: `customer_id`, `name`
- **Menu**: `name` (unique), `isActive`
- **Order**: `customer_email`, `order_status`, `date_order`
- **Recipe**: `name` (unique), `tags`, `difficulty`
- **Ingredient**: `name` (unique), `category`

## 🔐 User Roles & Permissions

### 👤 Customer
- Create and manage pet profiles
- Browse meal catalog
- Place and track orders
- Review meals and service

### 👨‍🍳 Chef
- View assigned orders
- Update order preparation status
- Manage meal recipes

### 👨‍💼 Admin
- Full system access
- User management
- Order management
- System analytics and reports




## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB for the database solution
- Next.js team for the framework


---

**Made with ❤️ for pets and their humans**
