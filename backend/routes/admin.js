const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// All routes require admin or staff authorization
router.use(auth, authorize('admin', 'staff'));

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in_progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();
    const maintenanceStaff = await User.countDocuments({ role: 'maintenance' });

    // Get complaints by category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get complaints by priority
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get complaints by building
    const buildingStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$location.building',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        totalUsers,
        maintenanceStaff
      },
      categoryStats,
      priorityStats,
      buildingStats,
      recentComplaints
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (role) filter.role = role;

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get maintenance staff
router.get('/maintenance-staff', async (req, res) => {
  try {
    const staff = await User.find({ role: 'maintenance', isActive: true })
      .select('name email phone');

    res.json(staff);
  } catch (error) {
    console.error('Get maintenance staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create staff members with different roles
router.post('/maintenance-staff', async (req, res) => {
  try {
    const { name, email, password, phone, department, role = 'staff' } = req.body;

    // Validate role
    const allowedRoles = ['staff', 'maintenance', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Allowed roles: staff, maintenance, admin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userData = {
      name,
      email,
      password,
      role,
      phone
    };

    // Add department for staff and maintenance roles
    if ((role === 'staff' || role === 'maintenance') && department) {
      userData.department = department;
    }

    // Add studentId for students (if needed in future)
    if (role === 'student' && req.body.studentId) {
      userData.studentId = req.body.studentId;
    }

    const user = new User(userData);
    await user.save();

    const roleLabels = {
      staff: 'Staff',
      maintenance: 'Maintenance Staff',
      admin: 'Admin'
    };

    res.status(201).json({
      message: `${roleLabels[role]} created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Monthly complaints trend
    const monthlyTrend = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Average resolution time
    const resolutionTime = await Complaint.aggregate([
      { $match: { ...filter, actualCompletion: { $exists: true } } },
      {
        $addFields: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$actualCompletion', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    // Top reported locations
    const topLocations = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            building: '$location.building',
            room: '$location.room'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Complaints by status over time
    const statusOverTime = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            status: '$status',
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      monthlyTrend,
      avgResolutionTime: resolutionTime[0]?.avgResolutionTime || 0,
      topLocations,
      statusOverTime
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export complaints data
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const complaints = await Complaint.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = complaints.map(complaint => ({
        ID: complaint._id,
        Title: complaint.title,
        Description: complaint.description,
        Category: complaint.category,
        Priority: complaint.priority,
        Status: complaint.status,
        Building: complaint.location.building,
        Room: complaint.location.room,
        ReportedBy: complaint.reportedBy?.name || 'N/A',
        AssignedTo: complaint.assignedTo?.name || 'N/A',
        CreatedAt: complaint.createdAt,
        ResolvedAt: complaint.actualCompletion || 'N/A'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
      
      // Simple CSV conversion
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      res.send(csv);
    } else {
      res.json(complaints);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 