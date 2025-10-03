import connectDB from '../../../../lib/db.js';
import Menu from '../../../../models/Menu.js';
import Ingredient from '../../../../models/Ingredient.js';
import { NextResponse } from 'next/server';

// GET /api/menu/[id] - Get a specific menu by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const menu = await Menu.findById(id).populate('ingredients');

    if (!menu || !menu.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Menu not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: menu
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch menu'
    }, { status: 500 });
  }
}// PUT /api/menu/[id] - Update a specific menu
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    // Remove fields that shouldn't be updated
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    
    const menu = await Menu.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!menu) {
      return NextResponse.json({
        success: false,
        error: 'Menu not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: menu,
      message: 'Menu updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/menu/[id] error:', error);
    
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
      error: 'Failed to update menu'
    }, { status: 500 });
  }
}

// DELETE /api/menu/[id] - Soft delete a specific menu
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const menu = await Menu.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!menu) {
      return NextResponse.json({
        success: false,
        error: 'Menu not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: menu,
      message: 'Menu deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/menu/[id] error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete menu'
    }, { status: 500 });
  }
}