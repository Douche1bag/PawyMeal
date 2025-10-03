import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  mobile_no: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^[0-9]{10}$/ 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  address: { 
    type: String 
  },
  zipcode: { 
    type: String 
  },
  city: { 
    type: String 
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

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);