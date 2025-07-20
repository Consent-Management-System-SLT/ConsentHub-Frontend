const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3016;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'Event Service (Mock)', port: PORT });
});

// Mock Event endpoints
app.get('/api/v1/events', (req, res) => {
    res.json({ 
        success: true,
        data: [
            {
                id: '1',
                type: 'consent_granted',
                timestamp: '2025-01-20T12:00:00Z',
                userId: 'user123',
                details: { consentType: 'marketing', granted: true }
            },
            {
                id: '2',
                type: 'consent_withdrawn',
                timestamp: '2025-01-20T13:30:00Z',
                userId: 'user456',
                details: { consentType: 'analytics', granted: false }
            },
            {
                id: '3',
                type: 'preference_updated',
                timestamp: '2025-01-20T14:45:00Z',
                userId: 'user789',
                details: { preference: 'email_notifications', value: false }
            }
        ]
    });
});

app.post('/api/v1/events', (req, res) => {
    res.json({ 
        success: true,
        message: 'Event recorded successfully',
        data: { 
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...req.body 
        }
    });
});

app.get('/api/v1/events/:id', (req, res) => {
    res.json({ 
        success: true,
        data: {
            id: req.params.id,
            type: 'consent_granted',
            timestamp: '2025-01-20T12:00:00Z',
            userId: 'user123',
            details: { consentType: 'marketing', granted: true }
        }
    });
});

app.listen(PORT, () => {
    console.log(`✓ Event Service (Mock) running on port ${PORT}`);
});
