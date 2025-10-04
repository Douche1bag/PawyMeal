import connectDB from '../../../../lib/db.js';
import Pet from '../../../../models/Pet.js';
import { NextResponse } from 'next/server';

// POST /api/pet/migrate - Migrate pets without customer_email to have the provided email
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

    // Find pets without customer_email
    const petsWithoutEmail = await Pet.find({
      $or: [
        { customer_email: { $exists: false } },
        { customer_email: null },
        { customer_email: '' }
      ]
    });

    if (petsWithoutEmail.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pets need migration',
        updated: 0
      });
    }

    // Update all pets without customer_email to have the provided email
    const updateResult = await Pet.updateMany(
      {
        $or: [
          { customer_email: { $exists: false } },
          { customer_email: null },
          { customer_email: '' }
        ]
      },
      { $set: { customer_email } }
    );

    console.log(`Pet migration: Updated ${updateResult.modifiedCount} pets with email: ${customer_email}`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updateResult.modifiedCount} pets`,
      updated: updateResult.modifiedCount
    });

  } catch (error) {
    console.error('POST /api/pet/migrate error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate pets'
    }, { status: 500 });
  }
}