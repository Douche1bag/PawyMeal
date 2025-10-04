#!/bin/bash

# Individual curl commands for manual data seeding
BASE_URL="http://localhost:3000"

echo "=== Manual Data Seeding Commands ==="
echo "Run these commands individually as needed"
echo ""

echo "# Add a customer manually:"
echo "curl -X POST '$BASE_URL/api/customer' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"name\": \"John Customer\",
    \"mobile_no\": \"9876543210\",
    \"password\": \"customer123\",
    \"email\": \"customer@example.com\",
    \"address\": \"123 Test Street\",
    \"zipcode\": \"12345\",
    \"city\": \"Bangkok\"
  }'"
echo ""

echo "# Add another customer:"
echo "curl -X POST '$BASE_URL/api/customer' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"name\": \"Jane Customer\",
    \"mobile_no\": \"1234567890\",
    \"password\": \"customer456\",
    \"email\": \"jane@example.com\",
    \"address\": \"456 Demo Avenue\",
    \"zipcode\": \"67890\",
    \"city\": \"Chiang Mai\"
  }'"
echo ""

echo "# Check existing customers:"
echo "curl -X GET '$BASE_URL/api/customer'"
echo ""

echo "# Check existing menu items:"
echo "curl -X GET '$BASE_URL/api/menu'"
echo ""

echo "# Check if we can get orders:"
echo "curl -X GET '$BASE_URL/api/order'"
echo ""

echo "# Try to add an order with minimal fields:"
echo "curl -X POST '$BASE_URL/api/order' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"customer_email\": \"customer@example.com\",
    \"menuName\": \"Chicken Meal\",
    \"petName\": \"Buddy\",
    \"petBreed\": \"Golden Retriever\",
    \"plan\": \"weekly\",
    \"quantity\": 7,
    \"price\": 299,
    \"order_status\": \"pending\"
  }'"
echo ""

echo "=== Summary of What We Have ==="
echo "✅ Menu Items: 5 successfully added"
echo "- Chicken Meal (฿299)"
echo "- Test Beef Meal (฿349)" 
echo "- Salmon Meal (฿399)"
echo "- Lamb Meal (฿429)"
echo "- Vegy Meal (฿249)"
echo ""
echo "❌ Employees: API endpoints not working (404 errors)"
echo "❌ Customers: Some exist already, some failed due to memberNumber conflicts"
echo "❌ Orders: Missing required fields in API structure"
echo ""
echo "=== Next Steps ==="
echo "1. Check your admin dashboard at: http://localhost:3000/admin/dashboard"
echo "2. The menu items should be visible in the dashboard"
echo "3. You can manually add employees and customers through the dashboard UI"
echo "4. Or run the individual curl commands above to add more data"