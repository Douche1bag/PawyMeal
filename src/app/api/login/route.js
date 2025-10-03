import Employee from "../../../models/Employee.js";
import Customer from "../../../models/Customer.js";
import connectDB from "../../../lib/db.js";
import bcrypt from "bcryptjs";
import { NextResponse } from 'next/server';

// POST /api/login
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password, accountType } = body;

    if (!email || !password || !accountType) {
      return NextResponse.json({
        success: false,
        error: 'Email, password, and account type are required'
      }, { status: 400 });
    }

    let user = null;
    let userRole = null;

    // Check based on account type
    if (accountType === 'customer') {
      user = await Customer.findOne({ email, isActive: true });
      userRole = 'customer';
    } else if (accountType === 'chef' || accountType === 'admin') {
      user = await Employee.findOne({ 
        email, 
        role: accountType === 'chef' ? 'Cook' : 'Admin',
        isActive: true 
      });
      userRole = accountType;
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: `No ${accountType} account found with this email`
      }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password'
      }, { status: 401 });
    }

    // Success: return user info (without password)
    const { password: _, ...userData } = user.toObject();
    
    return NextResponse.json({
      success: true,
      data: {
        ...userData,
        role: userRole
      },
      message: 'Login successful'
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed',
      details: error.message
    }, { status: 500 });
  }
}