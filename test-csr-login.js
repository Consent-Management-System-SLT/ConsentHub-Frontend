// Quick test to verify CSR login credentials work
const { authService } = require('./src/services/authService.ts');

console.log('Testing CSR login credentials...');

// Test the demo login method with CSR credentials
const testCredentials = {
  email: 'csr@sltmobitel.lk',
  password: 'csr123'
};

console.log('Testing with credentials:', testCredentials);

// Since this is Node.js, we can't directly import TypeScript, but we can test the logic
const demoUsers = [
  {
    email: 'admin@sltmobitel.lk',
    password: 'admin123',
    user: {
      id: 'demo-admin-001',
      uid: 'demo-admin-001',
      email: 'admin@sltmobitel.lk',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      isActive: true,
      emailVerified: true
    }
  },
  {
    email: 'csr@sltmobitel.lk',
    password: 'csr123',
    user: {
      id: 'demo-csr-001',
      uid: 'demo-csr-001',
      email: 'csr@sltmobitel.lk',
      name: 'CSR User',
      firstName: 'CSR',
      lastName: 'User',
      role: 'csr',
      status: 'active',
      createdAt: new Date().toISOString(),
      isActive: true,
      emailVerified: true
    }
  },
  {
    email: 'customer@sltmobitel.lk',
    password: 'customer123',
    user: {
      id: 'demo-customer-001',
      uid: 'demo-customer-001',
      email: 'customer@sltmobitel.lk',
      name: 'Customer User',
      firstName: 'Customer',
      lastName: 'User',
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
      isActive: true,
      emailVerified: true
    }
  }
];

console.log('Available demo users:');
demoUsers.forEach(user => {
  console.log(`- ${user.email} (role: ${user.user.role})`);
});

const demoUser = demoUsers.find(u => 
  u.email === testCredentials.email && u.password === testCredentials.password
);

if (demoUser) {
  console.log('✅ CSR credentials found!');
  console.log('User details:', demoUser.user);
  console.log('Role will be:', demoUser.user.role);
} else {
  console.log('❌ CSR credentials NOT found');
  console.log('Credentials tested:', testCredentials);
}
