#!/bin/bash

# MongoDB Database Cleanup Script
# This script provides multiple ways to clear your MongoDB database

echo "=== PawyMeal Database Cleanup ==="
echo "New MongoDB URI: mongodb+srv://group7:1234@pawymeals.znj4x.mongodb.net/pawymeals"
echo ""

echo "Option 1: Use MongoDB Compass"
echo "1. Open MongoDB Compass"
echo "2. Connect using: mongodb+srv://group7:1234@pawymeals.znj4x.mongodb.net/pawymeals"
echo "3. Navigate to the 'pawymeals' database"
echo "4. Delete all collections or drop the entire database"
echo ""

echo "Option 2: Use MongoDB Shell (mongosh)"
echo "If you have mongosh installed, run these commands:"
echo "mongosh 'mongodb+srv://group7:1234@pawymeals.znj4x.mongodb.net/pawymeals'"
echo "Then in the MongoDB shell:"
echo "db.dropDatabase()"
echo ""

echo "Option 3: Use the Node.js cleanup script"
echo "If Node.js is installed, run:"
echo "node scripts/clear-database.js"
echo ""

echo "Option 4: Clear collections individually via API"
echo "You can also delete data by making requests to your Next.js API endpoints"
echo ""

echo "=== Environment Updated ==="
echo "✅ .env file has been updated with new MongoDB URI"
echo "✅ Database cleanup script created at scripts/clear-database.js"
echo ""
echo "Choose one of the options above to clear your database data."