#!/bin/bash

# PawyMeal Database Seeding Script using cURL
# Make sure your Next.js server is running on localhost:3000

BASE_URL="http://localhost:3000"

echo "🌱 Starting database seeding with cURL..."
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
echo "=== Adding Employees ==="

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
  }'

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
  }'

echo ""

# Add another Chef
echo "Adding Chef Emily..."
curl -X POST "$BASE_URL/api/user" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emily Davis",
    "mobile_no": "1122334455",
    "email": "emily@example.com", 
    "password": "chef456",
    "role": "Cook"
  }'

echo ""
echo ""
echo "=== Adding Customers ==="

# Add Customer 1
echo "Adding Customer Inchy..."
curl -X POST "$BASE_URL/api/customer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "olja aaolla",
    "mobile_no": "9991231221",
    "password": "12345",
    "email": "oilja@hotmail.com",
    "address": "123 Bangkok Street",
    "zipcode": "10001",
    "city": "Bangkok"
  }'

echo ""

# Add Customer 2
echo "Adding Customer Bob..."
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
echo "=== Adding Menu Items ==="

# Add Chicken Meal
echo "Adding Chicken Meal..."
curl -X POST "$BASE_URL/api/menu" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Meal",
    "description": "Chicken breast is a great source of lean protein include with vegetable for fiber.",
    "image_url": "/images/chicken_meal.png",
    "price": 299,
    "ingredients": ["Chicken", "Red Rice", "Broccoli", "Sweet Potato"],
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
    "ingredients": ["Beef", "Red Rice", "Carrot", "Sweet Potato"],
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
    "ingredients": ["Salmon", "Red Rice", "Broccoli", "Carrot"],
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
    "ingredients": ["Lamb", "Red Rice", "Sweet Potato", "Broccoli"],
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
    "ingredients": ["Red Rice", "Broccoli", "Sweet Potato", "Carrot"],
    "status": "available"
  }'

echo ""

# Add Carb Meal
echo "Adding Carb Meal..."
curl -X POST "$BASE_URL/api/menu" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carb Meal",
    "description": "A healthy mix of sweet potato and quinoa.",
    "image_url": "/images/carb_meal.png", 
    "price": 199,
    "ingredients": ["Red Rice", "Sweet Potato", "Quinoa"],
    "status": "available"
  }'

echo ""
echo ""
echo "=== Adding Sample Orders ==="

# Add Sample Order 1
echo "Adding sample order..."
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
echo "Adding another sample order..."
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
echo "Summary of added data:"
echo "- 👥 3 Employees (2 Chefs, 1 Admin)"
echo "- 👤 2 Customers"  
echo "- 🍽️ 6 Menu Items"
echo "- 📦 2 Sample Orders"
echo ""
echo "You can now:"
echo "1. Visit http://localhost:3000 to see the home page"
echo "2. Login as admin with: admin@example.com / admin123"
echo "3. Login as chef with: john.chef@example.com / chef123"
echo "4. View the admin dashboard to manage all data"
echo ""