const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    default: 'SLT-Mobitel',
    trim: true
  },
  department: {
    type: String,
    default: '',
    trim: true
  },
  jobTitle: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'csr'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  acceptTerms: {
    type: Boolean,
    default: false
  },
  acceptPrivacy: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  profilePicture: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  // Guardian/Minor relationship support
  hasMinorDependents: {
    type: Boolean,
    default: false
  },
  minorDependents: [{
    id: String,
    name: String,
    firstName: String,
    lastName: String,
    age: Number,
    dateOfBirth: String,
    relationship: {
      type: String,
      enum: ['child', 'ward', 'stepchild'],
      default: 'child'
    },
    legalDocuments: {
      birthCertificate: { type: Boolean, default: false },
      guardianshipPapers: { type: Boolean, default: false }
    }
  }],
  guardianOf: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  collection: 'users'
});

// Virtual field for full name
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);
