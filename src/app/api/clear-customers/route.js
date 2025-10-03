import connectDB from '../../../lib/db.js';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// DELETE /api/clear-customers - Clear all customers and reset collection
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Drop the entire customers collection (removes all data and indexes)
    await mongoose.connection.db.collection('customers').drop();
    
    return NextResponse.json({
      success: true,
      message: 'Customers collection cleared successfully'
    }, { status: 200 });

  } catch (error) {
    if (error.message.includes('ns not found')) {
      return NextResponse.json({
        success: true,
        message: 'Customers collection was already empty'
      }, { status: 200 });
    }
    
    console.error('Clear customers error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear customers',
      details: error.message
    }, { status: 500 });
  }
}