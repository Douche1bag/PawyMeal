import connectDB from '../../../lib/db.js';
import Pet from '../../../models/Pet.js';
import { NextResponse } from 'next/server';

// GET /api/pet - Get all pets with optional filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const breed = searchParams.get('breed');
    const size = searchParams.get('size');
    const activityLevel = searchParams.get('activityLevel');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (ownerId) filter.ownerId = ownerId;
    if (breed) filter.breed = new RegExp(breed, 'i');
    if (size) filter.size = size;
    if (activityLevel) filter.activityLevel = activityLevel;
    filter.isActive = true; // Only show active pets

    // Get pets with pagination
    const pets = await Pet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Pet.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/pet error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pets'
    }, { status: 500 });
  }
}

// POST /api/pet - Create a new pet
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'breed', 'age', 'weight', 'size', 'activityLevel', 'ownerId'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create new pet
    const pet = new Pet(body);
    await pet.save();

    return NextResponse.json({
      success: true,
      data: pet,
      message: 'Pet created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/pet error:', error);
    
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
      error: 'Failed to create pet'
    }, { status: 500 });
  }
}

// PUT /api/pet - Update multiple pets (bulk update)
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { ids, updateData } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pet IDs array is required'
      }, { status: 400 });
    }

    // Update multiple pets
    const result = await Pet.updateMany(
      { _id: { $in: ids }, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} pets updated successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/pet error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update pets'
    }, { status: 500 });
  }
}

// DELETE /api/pet - Soft delete multiple pets
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({
        success: false,
        error: 'Pet IDs are required'
      }, { status: 400 });
    }

    const ids = idsParam.split(',');

    // Soft delete (mark as inactive)
    const result = await Pet.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: false } }
    );

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} pets deleted successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/pet error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete pets'
    }, { status: 500 });
  }
}