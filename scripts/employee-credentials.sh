#!/bin/bash

# Create test employees for the system
BASE_URL="http://localhost:3000"

echo "=== Creating Test Employees ==="

# Creating employees automatically via API
echo "Creating employees via API..."
echo ""

# 1. ADMIN USER
echo "Creating Admin User..."
curl -X POST "$BASE_URL/api/employee" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@pavymeal.com",
    "password": "admin123",
    "role": "Admin",
    "mobile_no": "0000000001"
  }'
echo ""
echo ""

# 2. CHEF USER
echo "Creating Chef John..."
curl -X POST "$BASE_URL/api/employee" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chef John",
    "email": "chef@pavymeal.com",
    "password": "chef123",
    "role": "Cook",
    "mobile_no": "0000000002"
  }'
echo ""
echo ""

# 3. CHEF USER 2
echo "Creating Chef Sarah..."
curl -X POST "$BASE_URL/api/employee" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chef Sarah",
    "email": "sarah@pavymeal.com",
    "password": "chef456",
    "role": "Cook",
    "mobile_no": "0000000003"
  }'
echo ""
echo ""

echo "=== LOGIN CREDENTIALS SUMMARY ==="
echo ""
echo "CUSTOMERS:"
echo "- Email: oilja@hotmail.com | Password: 12345"
echo ""
echo "EMPLOYEES (created via API):"
echo "- Admin: admin@pavymeal.com | Password: admin123"
echo "- Chef 1: chef@pavymeal.com | Password: chef123"  
echo "- Chef 2: sarah@pavymeal.com | Password: chef456"
echo ""
echo "You can now login with these credentials:"
echo "1. Go to http://localhost:3000/login"
echo "2. Use any of the employee emails and passwords above"
echo "3. Access admin dashboard or chef dashboard based on role"