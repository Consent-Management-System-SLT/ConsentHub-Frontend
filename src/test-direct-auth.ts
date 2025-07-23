// Direct API test to bypass multiServiceApiClient issues
import axios from 'axios';

export const testDirectAuth = async () => {
  console.log('Testing direct auth API call...');
  
  try {
    const response = await axios.post('http://localhost:3001/api/v1/auth/register', {
      firstName: 'Test',
      lastName: 'Direct',
      email: 'test@direct.com',
      password: 'Test123!',
      phone: '+1234567890'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Direct API call SUCCESS:', response.data);
    return response.data;
  } catch (error) {
    console.error('Direct API call FAILED:', error);
    return null;
  }
};
