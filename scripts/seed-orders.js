const mongoose = require('mongoose');

// Order Schema (matching the existing model)
const OrderSchema = new mongoose.Schema({
  plan: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  date_order: { 
    type: Date, 
    required: true 
  },
  customer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  cook_employee_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  order_status: { 
    type: String, 
    required: true 
  },
  admin_employee_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  menus: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Sample orders data
const sampleOrders = [
  {
    plan: '7 Days',
    quantity: 1,
    price: 399,
    date_order: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    customer_id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    order_status: 'completed',
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    plan: '14 Days',
    quantity: 2,
    price: 1398,
    date_order: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    customer_id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    order_status: 'delivered',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    plan: '30 Days',
    quantity: 1,
    price: 999,
    date_order: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    customer_id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    order_status: 'preparing',
    isActive: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    plan: '7 Days',
    quantity: 3,
    price: 1197,
    date_order: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    customer_id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    order_status: 'delivered',
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    plan: '14 Days',
    quantity: 1,
    price: 699,
    date_order: new Date(), // Today
    customer_id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    order_status: 'pending',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavymeal');
    console.log('Connected to MongoDB');

    // Clear existing orders (optional)
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Insert sample orders
    const result = await Order.insertMany(sampleOrders);
    console.log(`Successfully created ${result.length} sample orders`);

    console.log('Sample orders:');
    result.forEach(order => {
      console.log(`- ${order.plan} x${order.quantity} - $${order.price} - Status: ${order.order_status}`);
    });

  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedOrders();
}

module.exports = { seedOrders, sampleOrders };