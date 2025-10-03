const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function recreateStaff() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Delete existing staff user
    const deleted = await User.findOneAndDelete({ email: 'staff@fixitnow.com' });
    if (deleted) {
      console.log('✅ Deleted existing staff user');
    }

    // Create new staff user with a simple password first
    const password = 'staff123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const staff = new User({
      name: 'Staff User',
      email: 'staff@fixitnow.com',
      password: hashedPassword,
      role: 'staff',
      department: 'IT Department',
      phone: '123-456-7890',
      isActive: true
    });

    await staff.save();
    console.log('✅ New staff user created successfully!');

    // Verify the password works
    const savedStaff = await User.findOne({ email: 'staff@fixitnow.com' });
    const passwordValid = await bcrypt.compare('staff123', savedStaff.password);
    
    console.log('Password verification:', passwordValid ? '✅ Success' : '❌ Failed');
    
    if (passwordValid) {
      console.log('\n🎉 Staff login credentials:');
      console.log('Email: staff@fixitnow.com');
      console.log('Password: staff123');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

recreateStaff();

