const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function debugStaff() {
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

    console.log('Staff user details:');
    console.log({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isActive: staff.isActive,
      department: staff.department,
      passwordHash: staff.password.substring(0, 20) + '...'
    });

    // Test different passwords
    const passwords = ['staff123', 'admin123', 'password', '123456'];
    
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, staff.password);
      console.log(`Password "${pwd}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }

    // If none work, let's create a fresh password
    console.log('\nCreating fresh password...');
    const freshPassword = await bcrypt.hash('staff123', 10);
    staff.password = freshPassword;
    await staff.save();
    
    // Test the fresh password
    const testFresh = await bcrypt.compare('staff123', staff.password);
    console.log(`Fresh password test: ${testFresh ? '✅ Valid' : '❌ Invalid'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugStaff();
