import connectDB from '../../../../lib/db.js';
import Order from '../../../../models/Order.js';
import Pet from '../../../../models/Pet.js';
import Menu from '../../../../models/Menu.js';
import { NextResponse } from 'next/server';

// POST /api/order/update-names - Update existing orders with missing pet/menu names
export async function POST(request) {
  try {
    await connectDB();
    
    console.log('Starting order names update...');
    
    // Get all orders that might need updates
    const orders = await Order.find({});
    
    // Get all pets and menus for lookup
    const pets = await Pet.find({});
    const menus = await Menu.find({});
    
    let updatedCount = 0;
    const updateResults = [];
    
    for (const order of orders) {
      let updateNeeded = false;
      const updateData = {};
      
      // Update pet name if missing but selectedPet exists
      if ((!order.petName || order.petName === '') && order.selectedPet) {
        const pet = pets.find(p => p._id.toString() === order.selectedPet);
        if (pet) {
          updateData.petName = pet.name;
          updateNeeded = true;
        }
      }
      
      // Update menu name if missing but selectedMenu exists
      if ((!order.menuName || order.menuName === '') && order.selectedMenu) {
        const menu = menus.find(m => m._id.toString() === order.selectedMenu);
        if (menu) {
          updateData.menuName = menu.name;
          updateNeeded = true;
        }
      }
      
      // Update the order if needed
      if (updateNeeded) {
        await Order.findByIdAndUpdate(order._id, updateData);
        updatedCount++;
        updateResults.push({
          orderId: order._id,
          updates: updateData
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} orders with missing names`,
      updatedOrders: updateResults,
      totalOrders: orders.length,
      availablePets: pets.length,
      availableMenus: menus.length
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/order/update-names error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update order names',
      details: error.message
    }, { status: 500 });
  }
}