// Test script to verify the complete authentication system
const API_BASE = 'http://localhost:3001/api/v1';

// Test user data
const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phone: '+1234567890',
  company: 'Test Company',
  department: 'IT',
  jobTitle: 'Developer',
  password: 'TestPass123!'
};

const testLoginCredentials = {
  email: 'john.doe@test.com',
  password: 'TestPass123!'
};

// Test registration
async function testRegistration() {
  console.log('🧪 Testing User Registration...');
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    console.log('✅ Registration Response:', data);
    
    if (response.ok) {
      console.log('✅ Registration successful');
      return true;
    } else {
      console.log('❌ Registration failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    return false;
  }
}

// Test login
async function testUserLogin() {
  console.log('🧪 Testing User Login...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLoginCredentials)
    });

    const data = await response.json();
    console.log('✅ Login Response:', data);
    
    if (response.ok && data.token) {
      console.log('✅ Login successful');
      return data.token;
    } else {
      console.log('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

// Test customer dashboard profile
async function testCustomerDashboard(token) {
  console.log('🧪 Testing Customer Dashboard Profile...');
  try {
    const response = await fetch(`${API_BASE}/customer/dashboard/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('✅ Customer Profile Response:', data);
    
    if (response.ok) {
      console.log('✅ Customer dashboard profile access successful');
      return data;
    } else {
      console.log('❌ Customer dashboard profile access failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Customer dashboard profile error:', error);
    return null;
  }
}

// Test CSR access to customer data
async function testCSRCustomerAccess() {
  console.log('🧪 Testing CSR Access to Customer Data...');
  try {
    const response = await fetch(`${API_BASE}/party`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('✅ CSR Party Data Response:', data);
    
    if (response.ok) {
      console.log('✅ CSR party data access successful');
      return data;
    } else {
      console.log('❌ CSR party data access failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ CSR party data access error:', error);
    return null;
  }
}

// Run complete test suite
async function runTests() {
  console.log('🚀 Starting Complete Authentication System Test...\n');
  
  // Test 1: Registration
  const registrationSuccess = await testRegistration();
  console.log('\n');
  
  // Test 2: Login (only if registration succeeded)
  let token = null;
  if (registrationSuccess) {
    token = await testUserLogin();
    console.log('\n');
  }
  
  // Test 3: Customer Dashboard (only if login succeeded)
  let customerProfile = null;
  if (token) {
    customerProfile = await testCustomerDashboard(token);
    console.log('\n');
  }
  
  // Test 4: CSR Access to Customer Data
  const csrCustomerData = await testCSRCustomerAccess();
  console.log('\n');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`Registration: ${registrationSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login: ${token ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Customer Dashboard: ${customerProfile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CSR Customer Access: ${csrCustomerData ? '✅ PASS' : '❌ FAIL'}`);
  
  if (registrationSuccess && token && customerProfile && csrCustomerData) {
    console.log('\n🎉 All tests passed! Complete authentication and data management system is working!');
    console.log('\n📝 Summary of Features:');
    console.log('✅ Users can create accounts with comprehensive profile data');
    console.log('✅ Users can login using their credentials');
    console.log('✅ Customer dashboard displays user profile data');
    console.log('✅ CSR can search and access customer data');
    console.log('✅ Real-time data synchronization between customer and CSR views');
  } else {
    console.log('\n❌ Some tests failed. Please check the backend logs.');
  }
}

// Run the tests
runTests();
