const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3015;

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
    res.json({ status: 'healthy', service: 'DSAR Service (Mock)', port: PORT });
});

// Mock DSAR endpoints
app.get('/api/v1/dsar', (req, res) => {
    res.json({ 
        success: true,
        data: [
            {
                id: '1',
                requestType: 'access',
                status: 'completed',
                submittedAt: '2025-01-15T10:00:00Z',
                completedAt: '2025-01-16T15:30:00Z',
                description: 'Request for personal data access'
            },
            {
                id: '2',
                requestType: 'erasure',
                status: 'pending',
                submittedAt: '2025-01-20T14:00:00Z',
                description: 'Request for data deletion'
            }
        ]
    });
});

app.post('/api/v1/dsar', (req, res) => {
    res.json({ 
        success: true,
        message: 'DSAR request submitted successfully',
        data: { 
            id: Date.now().toString(),
            status: 'pending',
            submittedAt: new Date().toISOString(),
            ...req.body 
        }
    });
});

app.get('/api/v1/dsar/:id', (req, res) => {
    res.json({ 
        success: true,
        data: {
            id: req.params.id,
            requestType: 'access',
            status: 'completed',
            submittedAt: '2025-01-15T10:00:00Z',
            completedAt: '2025-01-16T15:30:00Z',
            description: 'Request for personal data access',
            response: 'Your data access request has been processed.'
        }
    });
});

app.listen(PORT, () => {
    console.log(`✓ DSAR Service (Mock) running on port ${PORT}`);
});
