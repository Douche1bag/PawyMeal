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

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);