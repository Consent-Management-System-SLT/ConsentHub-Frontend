// Debug Customer Data
const API_BASE = 'http://localhost:3001';

async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}:`, {
        status: response.status,
        result: result
    });
    
    return result;
}

async function debugCustomerData() {
    try {
        // Login as customer first
        const customerLogin = await makeRequest('/api/v1/auth/login', 'POST', {
            email: 'ojitharajapaksha@gmail.com',
            password: 'ABcd123#'
        });
        
        console.log('\nCustomer ID from login:', customerLogin.user?.id);
        
        // Login as CSR
        const csrLogin = await makeRequest('/api/v1/auth/login', 'POST', {
            email: 'csr@sltmobitel.lk',
            password: 'csr123'
        });
        
        const csrToken = csrLogin.token;
        
        // Try different search terms
        console.log('\nTrying various search terms...');
        
        await makeRequest(`/api/v1/csr/customers/search?query=ojitha`, 'GET', null, csrToken);
        await makeRequest(`/api/v1/csr/customers/search?query=rajapaksha`, 'GET', null, csrToken);
        await makeRequest(`/api/v1/csr/customers/search?query=ojitharajapaksha@gmail.com`, 'GET', null, csrToken);
        await makeRequest(`/api/v1/csr/customers/search?query=${customerLogin.user?.id}`, 'GET', null, csrToken);
        
        // Get all customers
        console.log('\nGetting all CSR customers...');
        await makeRequest('/api/v1/csr/customers', 'GET', null, csrToken);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugCustomerData();
