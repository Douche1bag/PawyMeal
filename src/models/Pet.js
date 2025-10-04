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
    enum: ['male', 'female'],
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
  breed: {
    type: String,
    required: false
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  bodyCondition: {
    type: String,
    required: false
  },
  activityLevel: {
    type: String,
    required: true
  },
  neutered: {
    type: Boolean,
    default: false
  },
  customer_email: {
    type: String,
    required: false, // Temporarily make it optional for existing pets
    trim: true
  },

}, {
  timestamps: true
});

// Index for efficient queries
PetSchema.index({ breed: 1 });

// Clear any existing model to avoid caching issues
if (mongoose.models.Pet) {
  delete mongoose.models.Pet;
}

export default mongoose.model('Pet', PetSchema);