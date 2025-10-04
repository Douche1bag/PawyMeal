const mongoose = require('mongoose');

// Import your existing models
const Order = require('../src/models/Order.js');
const Pet = require('../src/models/Pet.js');
const Menu = require('../src/models/Menu.js');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavymeal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for data update');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const updateExistingOrders = async () => {
  try {
    await connectDB();
    
    console.log('Starting order update process...');
    
    // Get all orders that don't have menuName or petName
    const orders = await Order.find({
      $or: [
        { menuName: { $exists: false } },
        { petName: { $exists: false } }
      ]
    });
    
    console.log(`Found ${orders.length} orders to update`);
    
    // Get all pets and menus for lookup
    const pets = await Pet.find({});
    const menus = await Menu.find({});
    
    console.log(`Available pets: ${pets.length}, Available menus: ${menus.length}`);
    
    let updatedCount = 0;
    
    for (const order of orders) {
      let updateNeeded = false;
      const updateData = {};
      
      // Update pet name if missing
      if (!order.petName && order.selectedPet) {
        const pet = pets.find(p => p._id.toString() === order.selectedPet);
        if (pet) {
          updateData.petName = pet.name;
          updateNeeded = true;
          console.log(`Found pet name: ${pet.name} for order ${order._id}`);
        }
      }
      
      // Update menu name if missing
      if (!order.menuName && order.selectedMenu) {
        const menu = menus.find(m => m._id.toString() === order.selectedMenu);
        if (menu) {
          updateData.menuName = menu.name;
          updateNeeded = true;
          console.log(`Found menu name: ${menu.name} for order ${order._id}`);
        }
      }
      
      // Update the order if needed
      if (updateNeeded) {
        await Order.findByIdAndUpdate(order._id, updateData);
        updatedCount++;
        console.log(`Updated order ${order._id} with:`, updateData);
      }
    }
    
    console.log(`\nUpdate complete! Updated ${updatedCount} orders.`);
    
  } catch (error) {
    console.error('Error updating orders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the update
updateExistingOrders();