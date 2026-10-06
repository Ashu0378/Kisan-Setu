const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    // Farmer profile details
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    village: { type: String, trim: true },
    pincode: { type: String, trim: true },
    landSize: { type: Number }, // in acres
    preferredLanguage: {
      type: String,
      enum: ['hi', 'en', 'mr', 'pa', 'gu', 'ta', 'te', 'kn'],
      default: 'hi',
    },
    age: { type: Number },
    kcc: { type: String },
    soilType: { type: String },
    irrigation: { type: String },
    equipment: { type: String },
    primaryCrop: { type: String },
    secondaryCrop: { type: String },
    livestock: { type: String },
    storageCapacity: { type: String },
    profilePicture: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
// NOTE: Mongoose v9+ async pre-hooks must NOT call next() — just return the promise
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
