import connectDB from '../../../../lib/db.js';
import Pet from '../../../../models/Pet.js';
import { NextResponse } from 'next/server';

// GET /api/pet/[id] - Get a specific pet by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const pet = await Pet.findById(id);
    
    if (!pet) {
      return NextResponse.json({
        success: false,
        error: 'Pet not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: pet
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/pet/[id] error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pet'
    }, { status: 500 });
  }
}

// PUT /api/pet/[id] - Update a specific pet
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    // Remove fields that shouldn't be updated
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    
    const pet = await Pet.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!pet) {
      return NextResponse.json({
        success: false,
        error: 'Pet not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: pet,
      message: 'Pet updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/pet/[id] error:', error);
    
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
      error: 'Failed to update pet'
    }, { status: 500 });
  }
}

// DELETE /api/pet/[id] - Delete a specific pet
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const pet = await Pet.findByIdAndDelete(id);
    
    if (!pet) {
      return NextResponse.json({
        success: false,
        error: 'Pet not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: pet,
      message: 'Pet deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/pet/[id] error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete pet'
    }, { status: 500 });
  }
}