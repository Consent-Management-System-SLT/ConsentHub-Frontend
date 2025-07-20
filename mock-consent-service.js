const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3012;

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
    res.json({ status: 'healthy', service: 'Consent Service (Mock)', port: PORT });
});

// Mock consent endpoints
app.get('/api/v1/consent', (req, res) => {
    res.json({ 
        success: true,
        data: [
            {
                id: '1',
                purpose: 'Marketing Communications',
                status: 'granted',
                grantedAt: '2025-01-01T00:00:00Z',
                description: 'Consent for marketing emails and promotional content'
            },
            {
                id: '2', 
                purpose: 'Analytics and Performance',
                status: 'granted',
                grantedAt: '2025-01-01T00:00:00Z',
                description: 'Consent for website analytics and performance tracking'
            }
        ]
    });
});

app.post('/api/v1/consent', (req, res) => {
    res.json({ 
        success: true,
        message: 'Consent created successfully',
        data: { id: Date.now(), ...req.body }
    });
});

app.put('/api/v1/consent/:id', (req, res) => {
    res.json({ 
        success: true,
        message: 'Consent updated successfully',
        data: { id: req.params.id, ...req.body }
    });
});

app.delete('/api/v1/consent/:id', (req, res) => {
    res.json({ 
        success: true,
        message: 'Consent deleted successfully'
    });
});

app.listen(PORT, () => {
    console.log(`✓ Consent Service (Mock) running on port ${PORT}`);
});
