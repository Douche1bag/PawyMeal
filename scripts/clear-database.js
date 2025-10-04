const { MongoClient } = require('mongodb');
require('dotenv').config();

async function clearAllData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('pawymeals');
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));
    
    // Clear all collections
    for (const collection of collections) {
      const result = await db.collection(collection.name).deleteMany({});
      console.log(`Cleared ${collection.name}: deleted ${result.deletedCount} documents`);
    }
    
    console.log('All data cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

clearAllData();