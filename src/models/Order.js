import mongoose from 'mongoose';

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
  customer_email: { 
    type: String,
    required: true,
    trim: true
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
  
  // Menu information (for detailed display)
  selectedMenu: {
    type: String,
    required: false
  },
  menuName: {
    type: String,
    required: false
  },
  menuDescription: {
    type: String,
    required: false
  },
  menuIngredients: [{
    type: String
  }],
  menuPrice: {
    type: Number,
    required: false
  },
  
  // Pet information (for detailed display)
  selectedPet: {
    type: String,
    required: false
  },
  petName: {
    type: String,
    required: false
  },
  petBreed: {
    type: String,
    required: false
  },
  petAge: {
    type: Number,
    required: false
  },
  petWeight: {
    type: Number,
    required: false
  },
  petAllergies: [{
    type: String
  }],
  
  // Special instructions
  specialInstructions: {
    type: String,
    required: false
  },
  
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

// Clear any existing model to avoid caching issues
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model('Order', OrderSchema);