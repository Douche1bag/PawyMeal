import connectDB from '../../../lib/db.js';
import Employee from '../../../models/Employee.js';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// GET /api/employee - Get all employees or filter by role/email
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const email = searchParams.get('email');
    const showPassword = searchParams.get('showPassword') === 'true';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    if (role) filter.role = role;
    if (email) filter.email = email;

    // Get employees with pagination
    const selectFields = showPassword ? '' : '-password'; // Include password if showPassword is true
    const employees = await Employee.find(filter)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Employee.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/employee error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employees',
      details: error.message
    }, { status: 500 });
  }
}

// POST /api/employee - Create a new employee
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'mobile_no', 'email', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [
        { email: body.email },
        { mobile_no: body.mobile_no }
      ]
    });

    if (existingEmployee) {
      return NextResponse.json({
        success: false,
        error: 'Employee with this email or mobile number already exists'
      }, { status: 400 });
    }

    // Hash password before creating employee
    const hashedPassword = await bcrypt.hash(body.password, 12);
    const employee = new Employee({
      ...body,
      password: hashedPassword
    });
    await employee.save();

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    return NextResponse.json({
      success: true,
      data: employeeResponse,
      message: 'Employee created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/employee error:', error);
    
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
      error: 'Failed to create employee',
      details: error.message
    }, { status: 500 });
  }
}

// PUT /api/employee - Update an employee
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID is required'
      }, { status: 400 });
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    
    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }
    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/employee error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update employee',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE /api/employee - Soft delete an employee
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID is required'
      }, { status: 400 });
    }

    // Soft delete (mark as inactive)
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: { isActive: false, updatedAt: new Date() } },
      { new: true }
    ).select('-password');
    
    if (!employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/employee error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete employee',
      details: error.message
    }, { status: 500 });
  }
}