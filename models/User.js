const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  aadhaar: {
    type: String,
    required: true,
    unique: true,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  // Eligibility-related fields
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },

  dob: {
    type: Date,
  },

  maritalStatus: {
    type: String,
    enum: ['single', 'married'],
  },

  income: {
    type: Number,
  },

  occupation: {
    type: String,
  },

  educationLevel: {
    type: String,
  },

  state: {
    type: String,
  },

  ruralOrUrban: {
    type: String,
    enum: ['rural', 'urban'],
  },

  hasGirlChild: {
    type: Boolean,
    default: false,
  },

  isFarmer: {
    type: Boolean,
    default: false,
  },

  isPregnantOrMother: {
    type: Boolean,
    default: false,
  },

  isDisabled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', userSchema);
