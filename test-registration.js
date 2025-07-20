// Direct test of the registration functionality
import { authService } from './src/services/authService.ts';

async function testRegistration() {
  try {
    console.log('Testing registration...');
    
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      phone: '+1234567890',
      password: 'testpass123'
    };

    const result = await authService.register(userData);
    console.log('Registration successful:', result);
    
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

testRegistration();
