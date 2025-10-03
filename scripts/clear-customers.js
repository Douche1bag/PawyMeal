// Clear customers collection and fix index issues
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function clearCustomers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stock');
    console.log('Connected to MongoDB');

    // Drop the entire customers collection (removes all data and indexes)
    await mongoose.connection.db.collection('customers').drop();
    console.log('Customers collection dropped successfully');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    if (error.message.includes('ns not found')) {
      console.log('Customers collection does not exist - that\'s fine');
    } else {
      console.error('Error:', error.message);
    }
  }
}

clearCustomers();