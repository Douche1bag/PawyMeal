import mongoose from "mongoose";

const PetProfileSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    mobileNumber: String,
    password: String,
    dogName: String,
    gender: String,
    age: Number,
    breed: String,
    neutered: String,
    weight: Number,
    allergies: [String],
    address: String,
    zipCode: String,
    city: String,
  },
  { timestamps: true }
);

export default mongoose.models.PetProfile ||
  mongoose.model("PetProfile", PetProfileSchema);
