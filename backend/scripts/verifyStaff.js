const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function verifyStaff() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Find the staff user
    const staff = await User.findOne({ email: 'staff@fixitnow.com' });
    
    if (!staff) {
      console.log('❌ Staff user not found');
      return;
    }

    console.log('Staff user found:');
    console.log({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isActive: staff.isActive,
      department: staff.department
    });

    // Test password verification
    const testPassword = 'staff123';
    const isPasswordValid = await bcrypt.compare(testPassword, staff.password);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
      console.log('Let me reset the password...');
      
      // Reset password
      const newPassword = await bcrypt.hash('staff123', 10);
      staff.password = newPassword;
      await staff.save();
      console.log('✅ Password reset successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyStaff();

