import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: { 
    type: String, 
    required: true,
    unique: true
  },
  password: { 
    type: String, 
    required: true 
  },
  accountType: {
    type: String,
    required: true,
    enum: ['Customer', 'Admin', 'Chef'],
    default: 'Customer'
  },
  streetAddress: { 
    type: String,
    required: true
  },
  city: { 
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: { 
    type: String,
    required: true
  },
  // Legacy fields for backward compatibility
  name: { 
    type: String
  },
  mobile_no: { 
    type: String
  },
  address: { 
    type: String 
  },
  zipcode: { 
    type: String 
  },
  memberNumber: {
    type: String,
    sparse: true, // This allows multiple null values
    unique: true
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