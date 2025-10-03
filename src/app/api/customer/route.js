import connectDB from '../../../lib/db.js';
import Customer from '../../../models/Customer.js';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// GET /api/customer - Get all customers or filter by email
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    if (email) {
      // Get specific customer by email
      const customer = await Customer.findOne({ email, isActive: true }).select('-password');
      if (!customer) {
        return NextResponse.json({ 
          success: false, 
          error: "Customer not found" 
        }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        data: customer 
      }, { status: 200 });
    }

    // Get all customers with pagination
    const filter = { isActive: true };
    const customers = await Customer.find(filter)
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Customer.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/customer error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customers',
      details: error.message
    }, { status: 500 });
  }
}

// POST /api/customer - Create a new customer
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields (matching SQL schema)
    const requiredFields = ['name', 'mobile_no', 'password', 'email'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [
        { email: body.email },
        { mobile_no: body.mobile_no }
      ]
    });

    if (existingCustomer) {
      return NextResponse.json({
        success: false,
        error: 'Customer with this email or mobile number already exists'
      }, { status: 400 });
    }

    // Hash password before creating customer
    const hashedPassword = await bcrypt.hash(body.password, 12);
    const customer = new Customer({
      ...body,
      password: hashedPassword
    });
    await customer.save();

    // Remove password from response
    const customerResponse = customer.toObject();
    delete customerResponse.password;

    return NextResponse.json({
      success: true,
      data: customerResponse,
      message: 'Customer created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/customer error:', error);
    
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
      error: 'Failed to create customer',
      details: error.message
    }, { status: 500 });
  }
}

// PUT /api/customer - Update a customer
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 });
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/customer error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update customer',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE /api/customer - Soft delete a customer
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 });
    }

    // Soft delete (mark as inactive)
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: { isActive: false, updatedAt: new Date() } },
      { new: true }
    ).select('-password');
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/customer error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete customer',
      details: error.message
    }, { status: 500 });
  }
}