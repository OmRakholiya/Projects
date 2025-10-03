const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function createStaffSimple() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Delete existing staff user
    await User.findOneAndDelete({ email: 'staff@fixitnow.com' });
    console.log('Deleted existing staff user');

    // Create staff user - let the User model handle password hashing
    const staff = new User({
      name: 'Staff User',
      email: 'staff@fixitnow.com',
      password: 'staff123', // Let the pre-save middleware hash it
      role: 'staff',
      department: 'IT Department',
      phone: '123-456-7890',
      isActive: true
    });

    await staff.save();
    console.log('✅ Staff user created successfully!');

    // Test login by finding the user and comparing password
    const foundStaff = await User.findOne({ email: 'staff@fixitnow.com' });
    if (foundStaff) {
      const isValid = await foundStaff.comparePassword('staff123');
      console.log('Password verification:', isValid ? '✅ Success' : '❌ Failed');
      
      if (isValid) {
        console.log('\n🎉 Staff login credentials:');
        console.log('Email: staff@fixitnow.com');
        console.log('Password: staff123');
        console.log('\nYou can now login at: http://localhost:3000/login');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createStaffSimple();

