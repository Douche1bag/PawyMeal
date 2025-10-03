import mongoose from 'mongoose';

const PetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: false
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: false
  },
  allergies: [{
    type: String,
    trim: true
  }],
  age: {
    type: Number,
    required: false
  },
  active: {
    type: String,
    required: false
  },
  breed: {
    type: String,
    required: false
  },
  body_conditions: {
    type: String,
    required: false
  },
  neutered: {
    type: Boolean,
    default: false
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
PetSchema.index({ customer_id: 1 });
PetSchema.index({ breed: 1 });

export default mongoose.models.Pet || mongoose.model('Pet', PetSchema);