const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fixitnow.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@fixitnow.com');
      console.log('Admin details:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role,
        isActive: existingAdmin.isActive
      });
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const password = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@fixitnow.com',
      password: password,
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@fixitnow.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login for security!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
