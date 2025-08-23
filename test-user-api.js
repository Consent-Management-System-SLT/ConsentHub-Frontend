/**
 * Test script for User Management API endpoints
 */

const BASE_URL = 'http://localhost:3001/api/v1';

async function testUserAPI() {
    console.log('🧪 Testing User Management API...');
    
    try {
        // First, login to get a token
        console.log('\n1. Logging in as admin...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@sltmobitel.lk',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.statusText}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');
        
        // Test GET /users endpoint
        console.log('\n2. Fetching users...');
        const getUsersResponse = await fetch(`${BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!getUsersResponse.ok) {
            throw new Error(`Get users failed: ${getUsersResponse.statusText}`);
        }
        
        const usersData = await getUsersResponse.json();
        console.log(`✅ Found ${usersData.users.length} users`);
        console.log('Sample user:', usersData.users[0]);
        
        // Test POST /users endpoint - Create new CSR
        console.log('\n3. Creating new CSR user...');
        const testUser = {
            name: 'Test CSR Agent',
            email: `test.csr.${Date.now()}@sltmobitel.lk`,
            password: 'testpass123',
            phone: '+94 77 123 4567',
            role: 'csr',
            department: 'Customer Service'
        };
        
        const createUserResponse = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });
        
        if (!createUserResponse.ok) {
            const responseText = await createUserResponse.text();
            console.log('Response status:', createUserResponse.status);
            console.log('Response text:', responseText.substring(0, 500));
            throw new Error(`Create user failed: ${createUserResponse.statusText}`);
        }
        
        const newUserData = await createUserResponse.json();
        console.log('✅ User created successfully');
        console.log('New user:', newUserData.user);
        
        // Test login with new user
        console.log('\n4. Testing login with new user...');
        const testLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        
        if (!testLoginResponse.ok) {
            throw new Error(`New user login failed: ${testLoginResponse.statusText}`);
        }
        
        const testLoginData = await testLoginResponse.json();
        console.log('✅ New user can login successfully');
        console.log('Login response:', {
            role: testLoginData.user.role,
            email: testLoginData.user.email
        });
        
        console.log('\n🎉 All tests passed! User Management API is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Error details:', error);
    }
}

// Run the tests
testUserAPI();
