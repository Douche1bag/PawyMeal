import mongoose from "mongoose";

const StockReportSchema = new mongoose.Schema({
  reported_date: { 
    type: Date, 
    required: true 
  },
  employee_reporter_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  status: { 
    type: String, 
    required: true 
  },
  employee_solver_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
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

export default mongoose.models.StockReport || mongoose.model("StockReport", StockReportSchema);