import connectDB from '../../../lib/db.js';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    console.log('Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('customers');

    const result = {
      operations: [],
      success: true
    };

    // List current indexes
    const indexes = await collection.indexes();
    result.currentIndexes = indexes.map(idx => ({ name: idx.name, keys: idx.key, sparse: idx.sparse }));

    // Drop the problematic memberNumber index if it exists
    try {
      await collection.dropIndex('memberNumber_1');
      result.operations.push('Successfully dropped memberNumber_1 index');
    } catch (error) {
      if (error.code === 27) {
        result.operations.push('memberNumber_1 index does not exist (already dropped)');
      } else {
        result.operations.push(`Error dropping index: ${error.message}`);
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
      result.operations.push('Created new sparse memberNumber index');
    } catch (error) {
      result.operations.push(`Error creating sparse index: ${error.message}`);
    }

    // List indexes after changes
    const newIndexes = await collection.indexes();
    result.finalIndexes = newIndexes.map(idx => ({ name: idx.name, keys: idx.key, sparse: idx.sparse }));

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Database indexes fixed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Database fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix database indexes',
      details: error.message
    }, { status: 500 });
  }
}