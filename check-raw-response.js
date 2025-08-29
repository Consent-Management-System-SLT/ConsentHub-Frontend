const axios = require('axios');

(async () => {
  try {
    const login = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'ojitharajapaksha@gmail.com',
      password: 'ABcd123#'
    });
    
    const token = login.data.token;
    const response = await axios.get('http://localhost:3001/api/v1/customer/preferences', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { _t: Date.now() }
    });
    
    console.log('Raw MongoDB response structure:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
