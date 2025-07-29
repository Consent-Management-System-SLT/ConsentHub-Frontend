#!/usr/bin/env node

/**
 * Test the updated render-server.js registration endpoint
 */

const http = require('http');

const testData = JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    phone: '+94771234567',
    company: 'Test Company',
    acceptTerms: true,
    acceptPrivacy: true
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

console.log('🧪 Testing render-server.js registration endpoint...');

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', JSON.parse(data));
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(testData);
req.end();
