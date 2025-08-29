// Environment Configuration Test
// This script helps verify which API URLs are being used by the frontend

console.log('🔧 ConsentHub Frontend - Environment Configuration Check');
console.log('===============================================');

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
    // Browser environment - can access import.meta.env
    const envVars = {
        'VITE_API_URL': import.meta.env.VITE_API_URL,
        'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
        'VITE_CSR_API_URL': import.meta.env.VITE_CSR_API_URL,
        'VITE_CUSTOMER_API_URL': import.meta.env.VITE_CUSTOMER_API_URL,
        'VITE_PARTY_API_URL': import.meta.env.VITE_PARTY_API_URL,
        'VITE_CONSENT_API_URL': import.meta.env.VITE_CONSENT_API_URL,
        'VITE_DSAR_API_URL': import.meta.env.VITE_DSAR_API_URL,
        'VITE_EVENT_API_URL': import.meta.env.VITE_EVENT_API_URL,
        'VITE_PREFERENCES_API_URL': import.meta.env.VITE_PREFERENCES_API_URL,
        'MODE': import.meta.env.MODE,
        'NODE_ENV': import.meta.env.NODE_ENV
    };

    console.log('Current Environment Variables:');
    Object.entries(envVars).forEach(([key, value]) => {
        const isCorrect = value && (value.includes('localhost:3001') || value.includes('http://localhost:3001'));
        const status = isCorrect ? 'CORRECT' : 'INCORRECT';
        console.log(`${status} ${key}: ${value || 'undefined'}`);
    });

    console.log('\nExpected Configuration:');
    console.log('All URLs should point to: http://localhost:3001');
    console.log('MODE should be: development');
    
    // Test actual API connectivity
    console.log('\nTesting Backend Connectivity...');
    
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    fetch(`${backendUrl}/api/csr/stats`)
        .then(response => response.json())
        .then(data => {
            console.log('Backend Connection Successful!');
            console.log(`CSR Stats: ${data.totalCustomers} customers, ${data.pendingRequests} pending requests`);
        })
        .catch(error => {
            console.error('Backend Connection Failed:', error.message);
            console.log('💡 Make sure backend is running on http://localhost:3001');
        });
        
} else {
    console.log('Running outside browser environment');
}

export {};
