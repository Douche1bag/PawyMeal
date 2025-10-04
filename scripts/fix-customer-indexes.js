import connectDB from '../src/lib/db.js';
import mongoose from 'mongoose';

async function fixCustomerIndexes() {
  try {
    await connectDB();
    console.log('Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('customers');

    // List current indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('Index:', index.name, 'Keys:', index.key);
    });

    // Drop the problematic memberNumber index if it exists
    try {
      await collection.dropIndex('memberNumber_1');
      console.log('Successfully dropped memberNumber_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('memberNumber_1 index does not exist (already dropped)');
      } else {
        console.log('Error dropping index:', error.message);
      }
    }

    // Create the new sparse index for memberNumber
    try {
      await collection.createIndex(
        { memberNumber: 1 }, 
        { 
          unique: true, 
          sparse: true,
          name: 'memberNumber_sparse'
        }
      );
      console.log('Created new sparse memberNumber index');
    } catch (error) {
      console.log('Error creating sparse index:', error.message);
    }

    // List indexes after changes
    console.log('\nIndexes after cleanup:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log('Index:', index.name, 'Keys:', index.key, 'Sparse:', index.sparse);
    });

    console.log('Database cleanup completed');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCustomerIndexes();