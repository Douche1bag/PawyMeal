import connectDB from '../../../../lib/db.js';
import Order from '../../../../models/Order.js';
import { NextResponse } from 'next/server';

// POST /api/order/migrate - Migrate orders without customer_email to have the provided email
export async function POST(request) {
  try {
    await connectDB();
    
    const { customer_email } = await request.json();
    
    if (!customer_email) {
      return NextResponse.json({
        success: false,
        error: 'customer_email is required'
      }, { status: 400 });
    }

    // Find orders without customer_email
    const ordersWithoutEmail = await Order.find({
      $or: [
        { customer_email: { $exists: false } },
        { customer_email: null },
        { customer_email: '' }
      ]
    });

    if (ordersWithoutEmail.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders need migration',
        updated: 0
      });
    }

    // Update all orders without customer_email to have the provided email
    const updateResult = await Order.updateMany(
      {
        $or: [
          { customer_email: { $exists: false } },
          { customer_email: null },
          { customer_email: '' }
        ]
      },
      { $set: { customer_email } }
    );

    console.log(`Order migration: Updated ${updateResult.modifiedCount} orders with email: ${customer_email}`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updateResult.modifiedCount} orders`,
      updated: updateResult.modifiedCount
    });

  } catch (error) {
    console.error('POST /api/order/migrate error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate orders'
    }, { status: 500 });
  }
}