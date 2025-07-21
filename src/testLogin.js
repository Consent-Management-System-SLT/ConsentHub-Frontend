// Simple test to verify CSR login works
const testLogin = () => {
  const credentials = {
    email: 'csr@sltmobitel.lk',
    password: 'csr123'
  };

  const demoUsers = [
    {
      email: 'admin@sltmobitel.lk',
      password: 'admin123',
      role: 'admin'
    },
    {
      email: 'csr@sltmobitel.lk',
      password: 'csr123',
      role: 'csr'
    },
    {
      email: 'customer@sltmobitel.lk',
      password: 'customer123',
      role: 'customer'
    }
  ];

  const user = demoUsers.find(u => 
    u.email === credentials.email && u.password === credentials.password
  );

  console.log('Test results:');
  console.log('Input credentials:', credentials);
  console.log('Available users:', demoUsers.map(u => ({email: u.email, password: u.password})));
  console.log('Found user:', user);
  console.log('Login should work:', !!user);
  
  return !!user;
};

export default testLogin;
