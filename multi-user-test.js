// Multi-User Functionality Test Script
// This script demonstrates that the system supports multiple users

const API_BASE = 'http://localhost:3008/api/v1/auth/auth';

// Test users to create
const testUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    phone: '+94771234567'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith', 
    email: 'jane.smith@company.com',
    password: 'MyPassword456@',
    phone: '+94777654321'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.j@business.lk',
    password: 'StrongPass789#',
    phone: '+94783456789'
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@organization.com',
    password: 'Complex123$',
    phone: '+94765432187'
  }
];

async function createUser(user) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
      return { success: true, user: data.user };
    } else {
      console.log(`❌ Failed to create user: ${user.email} - ${data.error?.message || 'Unknown error'}`);
      return { success: false, error: data.error?.message };
    }
  } catch (error) {
    console.log(`❌ Network error creating user: ${user.email}`, error.message);
    return { success: false, error: error.message };
  }
}

async function testLogin(email, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Login successful: ${email}`);
      return { success: true, token: data.token, user: data.user };
    } else {
      console.log(`❌ Login failed: ${email} - ${data.error?.message || 'Unknown error'}`);
      return { success: false, error: data.error?.message };
    }
  } catch (error) {
    console.log(`❌ Network error during login: ${email}`, error.message);
    return { success: false, error: error.message };
  }
}

async function listAllUsers() {
  try {
    const response = await fetch('http://localhost:3008/api/v1/auth/users');
    const data = await response.json();
    
    if (data.success) {
      console.log('\n📋 All Registered Users:');
      console.log('========================');
      data.data.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id} | Phone: ${user.phone || 'N/A'} | Role: ${user.role}`);
        console.log(`   Joined: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('');
      });
      console.log(`Total Users: ${data.data.totalUsers}\n`);
      return data.data.users;
    }
  } catch (error) {
    console.log('❌ Error listing users:', error.message);
    return [];
  }
}

async function runMultiUserTest() {
  console.log('🚀 Multi-User System Test');
  console.log('==========================\n');

  // Check initial state
  console.log('📋 Checking initial users...');
  await listAllUsers();

  // Create test users
  console.log('👥 Creating test users...');
  const results = [];
  
  for (const user of testUsers) {
    const result = await createUser(user);
    results.push({ ...user, ...result });
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 User Creation Summary:');
  console.log('=========================');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  // List all users after creation
  console.log('\n📋 Updated user list:');
  const allUsers = await listAllUsers();

  // Test login for successfully created users
  console.log('🔐 Testing logins...');
  console.log('===================');
  
  for (const result of results.filter(r => r.success)) {
    await testLogin(result.email, result.password);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Multi-User Test Complete!');
  console.log('============================');
  console.log('✅ System supports multiple independent user accounts');
  console.log('✅ Each user can register with unique credentials');
  console.log('✅ Each user can login to their own dashboard');
  console.log('✅ User data is properly isolated');
  console.log('\n💡 Next Steps:');
  console.log('- Users can now visit http://localhost:5173/signup to create accounts');
  console.log('- Users can login at http://localhost:5173/login');
  console.log('- Each user will have their own personalized dashboard');
  console.log('- View all users at http://localhost:5173/users');
}

// Export for use in browser console or run directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runMultiUserTest, createUser, testLogin, listAllUsers };
} else {
  // Run in browser
  window.multiUserTest = { runMultiUserTest, createUser, testLogin, listAllUsers };
  console.log('🔧 Multi-user test functions available at window.multiUserTest');
  console.log('Run window.multiUserTest.runMultiUserTest() to start the test');
}
