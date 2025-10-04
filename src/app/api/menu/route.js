import connectDB from '../../../lib/db.js';
import Menu from '../../../models/Menu.js';
import Ingredient from '../../../models/Ingredient.js';
import { NextResponse } from 'next/server';

// GET /api/menu - Get all menus with optional filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    // Get menus with pagination and populate ingredients
    const menus = await Menu.find(filter)
      .populate('ingredients')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Menu.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: menus.map(menu => ({
        id: menu._id,
        name: menu.name,
        description: menu.description,
        image_url: menu.image_url,
        ingredients: menu.ingredients,
        isActive: menu.isActive,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/menu error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch menu',
      details: error.message
    }, { status: 500 });
  }
}

// POST /api/menu - Create a new menu
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Prepare menu data
    const menuData = {
      name: body.name,
      description: body.description,
      image_url: body.image_url || null,
      ingredients: body.ingredients || [],
      isActive: body.isActive !== undefined ? body.isActive : true
    };

    // Create new menu
    const menu = new Menu(menuData);
    await menu.save();

    return NextResponse.json({
      success: true,
      data: menu,
      message: 'Menu created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/menu error:', error);
    
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
      error: 'Failed to create menu'
    }, { status: 500 });
  }
}

// DELETE /api/menu - Soft delete multiple menus
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({
        success: false,
        error: 'Menu IDs are required'
      }, { status: 400 });
    }

    const ids = idsParam.split(',');

    // Soft delete (mark as inactive)
    const result = await Menu.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: false } }
    );

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} menus deleted successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/menu error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete menus'
    }, { status: 500 });
  }
}