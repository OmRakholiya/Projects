const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['electrical', 'plumbing', 'furniture', 'wifi', 'heating', 'cleaning', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  location: {
    building: {
      type: String,
      required: true,
      trim: true
    },
    room: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: String,
      trim: true
    },
    qrCode: {
      type: String,
      trim: true
    }
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: {
    before: [{
      filename: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    after: [{
      filename: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  estimatedCompletion: {
    type: Date
  },
  actualCompletion: {
    type: Date
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolutionNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
complaintSchema.index({ status: 1, priority: 1, createdAt: -1 });
complaintSchema.index({ 'location.building': 1, 'location.room': 1 });
complaintSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Complaint', complaintSchema); 