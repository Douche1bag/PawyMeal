import connectDB from '../../../../lib/db.js';
import Order from '../../../../models/Order.js';
import { NextResponse } from 'next/server';

// GET /api/order/[orderId] - Get a specific order by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { orderId } = params;
    
    const order = await Order.findById(orderId)
      .populate('items.petId', 'name breed size weight')
      .populate('items.mealId', 'name description imageUrl primaryProtein');
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/order/[orderId] error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order'
    }, { status: 500 });
  }
}

// PUT /api/order/[orderId] - Update a specific order
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { orderId } = params;
    const body = await request.json();
    
    // Remove fields that shouldn't be updated
    delete body._id;
    delete body.orderNumber;
    delete body.createdAt;
    delete body.updatedAt;
    
    // If status is being updated to "Delivered", set actual delivery date
    if (body.status === 'Delivered' && !body.actualDeliveryDate) {
      body.actualDeliveryDate = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('items.petId items.mealId');
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/order/[orderId] error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update order'
    }, { status: 500 });
  }
}

// DELETE /api/order/[orderId] - Cancel a specific order
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { orderId } = params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Customer requested cancellation';
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          status: 'Cancelled',
          cancellationReason: reason,
          paymentStatus: 'Refunded'
        } 
      },
      { new: true }
    );
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/order/[orderId] error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel order'
    }, { status: 500 });
  }
} 