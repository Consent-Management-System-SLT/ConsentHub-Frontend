const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3014;

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:5175', 
        'http://localhost:3000',
        'https://consent-management-system-api.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'Privacy Notice Service (Mock)', port: PORT });
});

// Mock privacy notice endpoints
app.get('/api/v1/privacy-notice', (req, res) => {
    res.json({ 
        success: true,
        data: [
            {
                id: '1',
                title: 'Privacy Policy',
                version: '2.0',
                effectiveDate: '2025-01-01',
                status: 'active',
                description: 'Our comprehensive privacy policy'
            },
            {
                id: '2',
                title: 'Cookie Policy',
                version: '1.5',
                effectiveDate: '2024-12-01',
                status: 'active',
                description: 'How we use cookies on our website'
            }
        ]
    });
});

app.get('/api/v1/privacy-notice/:id', (req, res) => {
    res.json({ 
        success: true,
        data: {
            id: req.params.id,
            title: 'Privacy Policy',
            content: 'This is the full privacy policy content...',
            version: '2.0',
            effectiveDate: '2025-01-01'
        }
    });
});

app.listen(PORT, () => {
    console.log(`✓ Privacy Notice Service (Mock) running on port ${PORT}`);
});
