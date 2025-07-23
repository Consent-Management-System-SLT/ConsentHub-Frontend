// Debug script to test authentication
console.log('Testing authentication...');

async function testAuth() {
    // Test 1: Direct backend call
    console.log('1. Testing direct backend call...');
    try {
        const response = await fetch('http://localhost:3001/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'customer@sltmobitel.lk',
                password: 'customer123'
            })
        });
        
        const result = await response.json();
        console.log('Backend response:', result);
        
        if (result.success) {
            console.log('✅ Backend login works!');
        } else {
            console.log('❌ Backend login failed:', result.message);
        }
    } catch (error) {
        console.log('❌ Backend call failed:', error.message);
    }
    
    // Test 2: Check if frontend auth service works
    console.log('\n2. Testing frontend auth service...');
    try {
        // Import auth service
        const { authService } = await import('./src/services/authService.js');
        
        const loginResult = await authService.login({
            email: 'customer@sltmobitel.lk',
            password: 'customer123'
        });
        
        console.log('AuthService result:', loginResult);
        
        if (loginResult.success) {
            console.log('✅ Frontend auth service works!');
        } else {
            console.log('❌ Frontend auth service failed');
        }
    } catch (error) {
        console.log('❌ Frontend auth service error:', error.message);
    }
}

testAuth();
