const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function fixAdminRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Find and update the admin user
    const admin = await User.findOneAndUpdate(
      { email: 'admin@fixitnow.com' },
      { 
        role: 'admin',
        name: 'Admin User'
      },
      { new: true }
    );

    if (admin) {
      console.log('✅ Admin user role updated successfully!');
      console.log('Admin details:', {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      });
      console.log('\nYou can now login with:');
      console.log('Email: admin@fixitnow.com');
      console.log('Password: (your current password)');
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error updating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixAdminRole();

