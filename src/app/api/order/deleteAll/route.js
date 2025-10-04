import connectDB from '../../../../lib/db.js';
import Order from '../../../../models/Order.js';
import { NextResponse } from 'next/server';

// DELETE /api/order/deleteAll - Delete all orders (for testing purposes)
export async function DELETE(request) {
  try {
    await connectDB();
    
    const result = await Order.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} orders`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('DELETE /api/order/deleteAll error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete orders'
    }, { status: 500 });
  }
}