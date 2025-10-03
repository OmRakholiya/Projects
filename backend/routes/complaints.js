const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Create new complaint
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      building,
      room,
      floor,
      qrCode
    } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      location: {
        building,
        room,
        floor,
        qrCode
      },
      reportedBy: req.user._id,
      images: {
        before: req.files ? req.files.map(file => ({
          filename: file.filename,
          path: file.path
        })) : []
      }
    });

    await complaint.save();

    // Populate user details
    await complaint.populate('reportedBy', 'name email');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Complaint creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all complaints (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      building,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    // Apply filters based on user role
    if (req.user.role === 'student') {
      filter.reportedBy = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (building) filter['location.building'] = building;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user has access to this complaint
    if (req.user.role === 'student' || req.user.role === 'staff') {
      if (complaint.reportedBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status (maintenance/admin/staff only)
router.patch('/:id/status', auth, authorize('maintenance', 'admin', 'staff'), async (req, res) => {
  try {
    const { status, notes, estimatedCompletion } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (notes) {
      complaint.notes.push({
        content: notes,
        addedBy: req.user._id
      });
    }
    if (estimatedCompletion) {
      complaint.estimatedCompletion = estimatedCompletion;
    }

    // If status is resolved, set completion date
    if (status === 'resolved') {
      complaint.actualCompletion = new Date();
      complaint.isResolved = true;
    }

    await complaint.save();

    res.json({
      message: 'Status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign complaint to maintenance staff (admin/staff only)
router.patch('/:id/assign', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const maintenanceUser = await User.findById(assignedTo);
    if (!maintenanceUser || maintenanceUser.role !== 'maintenance') {
      return res.status(400).json({ message: 'Invalid maintenance staff' });
    }

    complaint.assignedTo = assignedTo;
    complaint.status = 'assigned';

    await complaint.save();

    res.json({
      message: 'Complaint assigned successfully',
      complaint
    });
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add resolution notes and after photos
router.patch('/:id/resolve', auth, authorize('maintenance', 'admin', 'staff'), upload.array('afterImages', 5), async (req, res) => {
  try {
    const { resolutionNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.resolutionNotes = resolutionNotes;
    complaint.status = 'resolved';
    complaint.isResolved = true;
    complaint.actualCompletion = new Date();

    if (req.files) {
      complaint.images.after = req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }));
    }

    await complaint.save();

    res.json({
      message: 'Complaint resolved successfully',
      complaint
    });
  } catch (error) {
    console.error('Resolution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note to complaint
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.notes.push({
      content,
      addedBy: req.user._id
    });

    await complaint.save();

    res.json({
      message: 'Note added successfully',
      complaint
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete complaint (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 