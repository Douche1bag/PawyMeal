import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define upload path
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    const filePath = path.join(uploadDir, fileName);

    // Write file to public/images directory
    await writeFile(filePath, buffer);

    // Return the public URL path
    const imageUrl = `/images/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: imageUrl
      },
      message: 'File uploaded successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload file',
      details: error.message
    }, { status: 500 });
  }
}