const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3013;

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
    res.json({ status: 'healthy', service: 'Preference Service (Mock)', port: PORT });
});

// Mock preference endpoints
app.get('/api/v1/preference', (req, res) => {
    res.json({ 
        success: true,
        data: [
            {
                id: '1',
                type: 'communication',
                preferences: {
                    email: true,
                    sms: false,
                    phone: true,
                    push: true
                }
            },
            {
                id: '2',
                type: 'topics',
                preferences: {
                    marketing: true,
                    promotions: false,
                    serviceUpdates: true,
                    billing: true
                }
            }
        ]
    });
});

app.post('/api/v1/preference', (req, res) => {
    res.json({ 
        success: true,
        message: 'Preference created successfully',
        data: { id: Date.now(), ...req.body }
    });
});

app.put('/api/v1/preference/:id', (req, res) => {
    res.json({ 
        success: true,
        message: 'Preference updated successfully',
        data: { id: req.params.id, ...req.body }
    });
});

app.listen(PORT, () => {
    console.log(`✓ Preference Service (Mock) running on port ${PORT}`);
});
