#!/bin/bash

# API-based database cleanup using curl
# Make sure your Next.js server is running on localhost:3000

echo "=== Clearing Database via API ==="
echo "Make sure your Next.js server is running first: npm run dev"
echo ""

BASE_URL="http://localhost:3000"

echo "Attempting to clear data via API endpoints..."

# Note: These would need to be implemented in your API routes
# For now, this shows the structure you could use

echo "1. Clearing employees..."
# curl -X DELETE "$BASE_URL/api/employee" || echo "No DELETE endpoint for employees"

echo "2. Clearing customers..."  
# curl -X DELETE "$BASE_URL/api/customer" || echo "No DELETE endpoint for customers"

echo "3. Clearing orders..."
# curl -X DELETE "$BASE_URL/api/order" || echo "No DELETE endpoint for orders"

echo "4. Clearing menu items..."
# curl -X DELETE "$BASE_URL/api/menu" || echo "No DELETE endpoint for menu"

echo ""
echo "Note: DELETE endpoints would need to be implemented in your API routes"
echo "For immediate cleanup, use MongoDB Compass or mongosh instead"
echo ""
echo "Alternative: Restart with fresh data using the seed script"
echo "node scripts/seed.js"