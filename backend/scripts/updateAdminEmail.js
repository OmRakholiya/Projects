const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb://localhost:27017/fixitnow'; // Change if needed

async function updateAdminEmail() {
  await mongoose.connect(MONGO_URI);
  const oldEmail = 'admin@fixitnow.com';
  const newEmail = 'dragon111305@gmail.com';
  const admin = await User.findOneAndUpdate(
    { email: oldEmail, role: 'admin' },
    { email: newEmail },
    { new: true }
  );
  if (admin) {
    console.log('Admin email updated:', admin.email);
  } else {
    console.log('Admin user not found.');
  }
  await mongoose.disconnect();
}

updateAdminEmail(); 