const axios = require('axios');

async function testStaffRegistration() {
  try {
    console.log('Testing staff registration...');
    
    const staffData = {
      name: 'Test Staff Member',
      email: 'teststaff@fixitnow.com',
      password: 'test123',
      role: 'staff',
      department: 'IT Department',
      phone: '555-0123'
    };

    const response = await axios.post('http://localhost:5000/api/auth/register', staffData);

    console.log('✅ Staff registration successful!');
    console.log('Response:', {
      message: response.data.message,
      user: {
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role
      },
      token: response.data.token ? 'Present' : 'Missing'
    });

  } catch (error) {
    console.log('❌ Staff registration failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testStaffRegistration();

