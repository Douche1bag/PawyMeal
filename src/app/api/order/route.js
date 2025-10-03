import connectDB from '../../../lib/db.js';
import Order from '../../../models/Order.js';
import Pet from '../../../models/Pet.js';
import Menu from '../../../models/Menu.js';
import { NextResponse } from 'next/server';

// GET /api/order - Get all orders with optional filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const assignedChef = searchParams.get('assignedChef');
    const assignedDeliveryDriver = searchParams.get('assignedDeliveryDriver');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (assignedChef) filter.assignedChef = assignedChef;
    if (assignedDeliveryDriver) filter.assignedDeliveryDriver = assignedDeliveryDriver;
    
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Get orders with pagination and populate related data
    const orders = await Order.find(filter)
      .populate('items.petId', 'name breed size')
      .populate('items.mealId', 'name imageUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders'
    }, { status: 500 });
  }
}

// POST /api/order - Create a new order
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['customerId', 'customerName', 'customerEmail', 'customerPhone', 'items', 'paymentMethod', 'deliveryAddress', 'scheduledDeliveryDate', 'scheduledDeliveryTime'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validate items and calculate totals
    let subtotal = 0;
    let totalPreparationTime = 0;

    for (const item of body.items) {
      // Verify pet exists
      const pet = await Pet.findById(item.petId);
      if (!pet || !pet.isActive) {
        return NextResponse.json({
          success: false,
          error: `Pet with ID ${item.petId} not found`
        }, { status: 400 });
      }

      // Verify meal exists
      const meal = await Meal.findById(item.mealId);
      if (!meal || !meal.isAvailable) {
        return NextResponse.json({
          success: false,
          error: `Meal with ID ${item.mealId} not found`
        }, { status: 400 });
      }

      // Calculate item total
      item.unitPrice = meal.price;
      item.totalPrice = meal.price * item.quantity;
      subtotal += item.totalPrice;
      totalPreparationTime += meal.preparationTime * item.quantity;
    }

    // Calculate tax and delivery fee (you can customize these rates)
    const taxRate = 0.08; // 8% tax
    const deliveryFee = 5.99;
    const tax = subtotal * taxRate;
    const discount = body.discount || 0;
    const totalAmount = subtotal + tax + deliveryFee - discount;

    // Create order object with calculated values
    const orderData = {
      ...body,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      estimatedPreparationTime: totalPreparationTime
    };

    // Create new order
    const order = new Order(orderData);
    await order.save();

    // Populate the created order
    await order.populate('items.petId items.mealId');

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/order error:', error);
    
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
      error: 'Failed to create order'
    }, { status: 500 });
  }
}

// PUT /api/order - Update multiple orders (bulk update)
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { ids, updateData } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order IDs array is required'
      }, { status: 400 });
    }

    // Update multiple orders
    const result = await Order.updateMany(
      { _id: { $in: ids } },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} orders updated successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update orders'
    }, { status: 500 });
  }
}