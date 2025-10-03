const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing staff login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'staff@fixitnow.com',
      password: 'staff123'
    });

    console.log('✅ Login successful!');
    console.log('Response:', {
      token: response.data.token ? 'Present' : 'Missing',
      user: {
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role
      }
    });

  } catch (error) {
    console.log('❌ Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();

