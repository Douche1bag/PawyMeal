import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
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
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true,
    enum: ['Cook', 'Admin']
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

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);