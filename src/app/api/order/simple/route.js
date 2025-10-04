import connectDB from '../../../../lib/db.js';
import Order from '../../../../models/Order.js';
import { NextResponse } from 'next/server';

// POST /api/order/simple - Create a simple order for quick ordering
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields for simple order
    const requiredFields = ['plan', 'quantity', 'price', 'customer_email', 'order_status'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create simple order object matching the Order model
    const orderData = {
      plan: body.plan,
      quantity: parseInt(body.quantity),
      price: parseFloat(body.price),
      date_order: body.date_order || new Date(),
      customer_email: body.customer_email,
      order_status: body.order_status || 'pending',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add all optional fields if provided
    if (body.specialInstructions) {
      orderData.specialInstructions = body.specialInstructions;
    }
    
    // Menu information
    if (body.selectedMenu) {
      orderData.selectedMenu = body.selectedMenu;
    }
    if (body.menuName) {
      orderData.menuName = body.menuName;
    }
    if (body.menuDescription) {
      orderData.menuDescription = body.menuDescription;
    }
    if (body.menuIngredients) {
      orderData.menuIngredients = body.menuIngredients;
    }
    if (body.menuPrice !== undefined) {
      orderData.menuPrice = body.menuPrice;
    }
    
    // Pet information
    if (body.selectedPet) {
      orderData.selectedPet = body.selectedPet;
    }
    if (body.petName) {
      orderData.petName = body.petName;
    }
    if (body.petBreed) {
      orderData.petBreed = body.petBreed;
    }
    if (body.petAge !== undefined) {
      orderData.petAge = body.petAge;
    }
    if (body.petWeight !== undefined) {
      orderData.petWeight = body.petWeight;
    }
    if (body.petAllergies) {
      orderData.petAllergies = body.petAllergies;
    }

    // Create new order
    const order = new Order(orderData);
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/order/simple error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create order',
      details: error.message
    }, { status: 500 });
  }
}