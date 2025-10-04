#!/bin/bash

# PawyMeal Database Seeding Script using cURL - CORRECTED VERSION
# Make sure your Next.js server is running on localhost:3000

BASE_URL="http://localhost:3000"

echo "🌱 Starting database seeding with cURL (Corrected Version)..."
echo "Make sure your Next.js server is running: npm run dev"
echo ""

# Function to check if server is running
check_server() {
    if ! curl -s "$BASE_URL" > /dev/null; then
        echo "❌ Server not running on $BASE_URL"
        echo "Please start your Next.js server first: npm run dev"
        exit 1
    fi
    echo "✅ Server is running"
}

# Check server
check_server

echo ""
echo "=== Adding Employees (using correct API endpoints) ==="

# Add Chef Employee
echo "Adding Chef John..."
curl -X POST "$BASE_URL/api/user" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Chef",
    "mobile_no": "1234567890",
    "email": "john.chef@example.com",
    "password": "chef123",
    "role": "Cook"
  }' || echo "Employee API not available"

echo ""

# Add Admin Employee  
echo "Adding Admin Jane..."
curl -X POST "$BASE_URL/api/user" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Admin",
    "mobile_no": "0987654321", 
    "email": "admin@example.com",
    "password": "admin123",
    "role": "Admin"
  }' || echo "Employee API not available"

echo ""
echo ""
echo "=== Adding Customers ==="

# Add Customer 1
echo "Adding Customer 1..."
curl -X POST "$BASE_URL/api/customer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Olja Aaolla",
    "mobile_no": "9991231221",
    "password": "12345",
    "email": "oilja@hotmail.com",
    "address": "123 Bangkok Street",
    "zipcode": "10001",
    "city": "Bangkok"
  }' 

echo ""

# Add Customer 2
echo "Adding Customer 2..."
curl -X POST "$BASE_URL/api/customer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson",
    "mobile_no": "5559876543",
    "password": "54321", 
    "email": "bob@example.com",
    "address": "456 Chiang Mai Road",
    "zipcode": "50000",
    "city": "Chiang Mai"
  }'

echo ""
echo ""
echo "=== Adding Menu Items (simplified structure) ==="

# Add Chicken Meal
echo "Adding Chicken Meal..."
curl -X POST "$BASE_URL/api/menu" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Meal",
    "description": "Chicken breast is a great source of lean protein include with vegetable for fiber.",
    "image_url": "/images/chicken_meal.png",
    "price": 299,
    "status": "available"
  }'

echo ""

# Add Beef Meal
echo "Adding Beef Meal..."
curl -X POST "$BASE_URL/api/menu" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Beef Meal",
    "description": "Test beef meal with vegetables...",
    "image_url": "/images/beef_meal.png", 
    "price": 349,
    "status": "available"
  }'

echo ""

# Add Salmon Meal
echo "Adding Salmon Meal..."
curl -X POST "$BASE_URL/api/menu" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salmon Meal",
    "description": "Salmon contains high protein, omega-3 fatty acids, and a wide range of minerals and B vitamins along with vegetables.",
    "image_url": "/images/salmon_meal.png",
    "price": 399,
    "status": "available"
  }'

echo ""

# Add Lamb Meal
echo "Adding Lamb Meal..."
curl -X POST "$BASE_URL/api/menu" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lamb Meal", 
    "description": "Lamb is naturally rich in protein which helps muscle growth and supports muscle mass include fiber sources.",
    "image_url": "/images/lamb_meal.png",
    "price": 429,
    "status": "available"
  }'

echo ""

# Add Vegy Meal
echo "Adding Vegy Meal..."
curl -X POST "$BASE_URL/api/menu" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vegy Meal",
    "description": "A healthy mix of vegetables...",
    "image_url": "/images/vegy_meal.png",
    "price": 249,
    "status": "available"
  }'

echo ""

echo ""
echo "=== Adding Sample Orders (using correct order structure) ==="

# Add Sample Order 1 (simplified structure)
echo "Adding sample order 1..."
curl -X POST "$BASE_URL/api/order" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "oilja@hotmail.com",
    "menuName": "Chicken Meal",
    "menuDescription": "Chicken breast is a great source of lean protein include with vegetable for fiber.",
    "petName": "Coffee",
    "petBreed": "Chihuahua", 
    "petAge": 1,
    "petWeight": 2,
    "petAllergies": ["Salmon", "Dairy"],
    "plan": "weekly",
    "quantity": 7,
    "price": 299,
    "order_status": "pending"
  }'

echo ""

# Add Sample Order 2  
echo "Adding sample order 2..."
curl -X POST "$BASE_URL/api/order" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "bob@example.com",
    "menuName": "Salmon Meal", 
    "menuDescription": "Salmon contains high protein, omega-3 fatty acids, and a wide range of minerals and B vitamins along with vegetables.",
    "petName": "Milo",
    "petBreed": "Poodle",
    "petAge": 2,
    "petWeight": 8.2,
    "petAllergies": ["Chicken"],
    "plan": "monthly",
    "quantity": 30,
    "price": 399,
    "order_status": "completed"
  }'

echo ""
echo ""
echo "🎉 Database seeding completed!"
echo ""
echo "If successful, you should now have:"
echo "- 👥 Employees in the system"
echo "- 👤 2 Customers"  
echo "- 🍽️ 5 Menu Items"
echo "- 📦 2 Sample Orders"
echo ""
echo "You can now:"
echo "1. Visit http://localhost:3000 to see the home page"
echo "2. Try logging in as admin with: admin@example.com / admin123"
echo "3. Try logging in as chef with: john.chef@example.com / chef123"
echo "4. View the admin dashboard to manage all data"
echo ""
echo "Note: If some API calls failed, the endpoints might need to be implemented"
echo "or the data structure might need adjustment. Check the server logs for details."