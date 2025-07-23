// Quick authentication test
async function quickTest() {
    try {
        console.log('Testing backend directly...');
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
        
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (data.success) {
            console.log('✅ Login successful!');
            console.log('User role:', data.user.role);
            console.log('User name:', data.user.name);
        } else {
            console.log('❌ Login failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

quickTest();
