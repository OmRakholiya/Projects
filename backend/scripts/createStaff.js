const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function createStaff() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Check if staff already exists
    const existingStaff = await User.findOne({ email: 'staff@fixitnow.com' });
    if (existingStaff) {
      console.log('Staff user already exists with email: staff@fixitnow.com');
      console.log('Staff details:', {
        name: existingStaff.name,
        email: existingStaff.email,
        role: existingStaff.role,
        isActive: existingStaff.isActive
      });
      await mongoose.disconnect();
      return;
    }

    // Create staff user
    const password = await bcrypt.hash('staff123', 10);
    const staff = new User({
      name: 'Staff User',
      email: 'staff@fixitnow.com',
      password: password,
      role: 'staff',
      department: 'IT Department',
      phone: '123-456-7890',
      isActive: true
    });

    await staff.save();
    console.log('✅ Staff user created successfully!');
    console.log('Login credentials:');
    console.log('Email: staff@fixitnow.com');
    console.log('Password: staff123');
    console.log('\n⚠️  Please change the password after first login for security!');

  } catch (error) {
    console.error('❌ Error creating staff user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createStaff();

