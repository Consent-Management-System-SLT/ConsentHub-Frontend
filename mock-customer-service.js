const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3011;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'Customer Service (Mock)', port: PORT });
});

// Mock customer profile data
const mockCustomerProfile = {
    id: 'cust_001',
    email: 'ojitharajapaksha@gmail.com',
    firstName: 'Ojitha',
    lastName: 'Rajapaksha',
    phone: '+94771234567',
    dateOfBirth: '1990-05-15',
    address: {
        street: '123 Main Street',
        city: 'Colombo',
        state: 'Western',
        zipCode: '00100',
        country: 'Sri Lanka'
    },
    customerType: 'individual',
    status: 'active',
    registrationDate: '2024-01-15T10:00:00Z',
    lastLoginDate: '2025-01-20T14:30:00Z',
    preferences: {
        language: 'en',
        timezone: 'Asia/Colombo',
        currency: 'LKR'
    },
    subscriptions: [
        {
            id: 'sub_001',
            type: 'mobile',
            number: '+94771234567',
            plan: 'Unlimited Plus',
            status: 'active'
        },
        {
            id: 'sub_002',
            type: 'broadband',
            accountNumber: 'BB001234567',
            plan: 'Fiber 100Mbps',
            status: 'active'
        }
    ]
};

// Customer dashboard endpoints
app.get('/api/v1/customer/dashboard/profile', (req, res) => {
    console.log('GET /api/v1/customer/dashboard/profile - Fetching customer profile');
    res.json({ 
        success: true,
        data: mockCustomerProfile
    });
});

app.get('/api/v1/customer/dashboard/overview', (req, res) => {
    console.log('GET /api/v1/customer/dashboard/overview - Fetching dashboard overview');
    const overviewData = {
        customer: {
            id: 'customer_123',
            name: 'Ojitha Rajapaksha',
            email: 'ojitharajapaksha@gmail.com',
            accountStatus: 'active',
            joinDate: '2024-01-15',
            lastLogin: new Date().toISOString()
        },
        consentStats: {
            total: 12,
            granted: 8,
            revoked: 2,
            expired: 1,
            pending: 1
        },
        preferenceStats: {
            total: 6,
            enabled: 4,
            disabled: 2
        },
        dsarStats: {
            total: 3,
            pending: 1,
            completed: 2,
            inProgress: 0
        },
        recentActivity: [
            {
                id: '1',
                type: 'consent',
                action: 'granted',
                description: 'Marketing communications consent granted',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            },
            {
                id: '2',
                type: 'preference',
                action: 'updated',
                description: 'Email notification preferences updated',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
            },
            {
                id: '3',
                type: 'dsar',
                action: 'completed',
                description: 'Data subject access request completed',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
            }
        ],
        notifications: [
            {
                id: '1',
                type: 'info',
                message: 'Your consent preferences have been updated successfully',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                read: false
            },
            {
                id: '2',
                type: 'warning',
                message: 'Your marketing consent will expire in 30 days',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
                read: true
            }
        ]
    };
    
    res.json({ 
        success: true,
        data: overviewData
    });
});

app.put('/api/v1/customer/dashboard/profile', (req, res) => {
    console.log('PUT /api/v1/customer/dashboard/profile - Updating customer profile');
    const updatedProfile = { ...mockCustomerProfile, ...req.body };
    res.json({ 
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
    });
});

// Customer subscription endpoints
app.get('/api/v1/customer/dashboard/subscriptions', (req, res) => {
    console.log('GET /api/v1/customer/dashboard/subscriptions - Fetching subscriptions');
    res.json({ 
        success: true,
        data: mockCustomerProfile.subscriptions
    });
});

// Customer billing endpoints
app.get('/api/v1/customer/dashboard/billing', (req, res) => {
    console.log('GET /api/v1/customer/dashboard/billing - Fetching billing info');
    res.json({ 
        success: true,
        data: {
            currentBill: {
                amount: 2500.00,
                currency: 'LKR',
                dueDate: '2025-02-15',
                status: 'pending'
            },
            paymentHistory: [
                {
                    id: 'pay_001',
                    amount: 2350.00,
                    date: '2025-01-15',
                    status: 'paid',
                    method: 'credit_card'
                },
                {
                    id: 'pay_002',
                    amount: 2400.00,
                    date: '2024-12-15',
                    status: 'paid',
                    method: 'bank_transfer'
                }
            ]
        }
    });
});

// Customer usage endpoints
app.get('/api/v1/customer/dashboard/usage', (req, res) => {
    console.log('GET /api/v1/customer/dashboard/usage - Fetching usage data');
    res.json({ 
        success: true,
        data: {
            mobile: {
                data: { used: 15.5, limit: 50, unit: 'GB' },
                voice: { used: 120, limit: 'unlimited', unit: 'minutes' },
                sms: { used: 25, limit: 100, unit: 'messages' }
            },
            broadband: {
                data: { used: 180.2, limit: 'unlimited', unit: 'GB' },
                speed: '95 Mbps'
            }
        }
    });
});

// Customer support tickets
app.get('/api/v1/customer/dashboard/tickets', (req, res) => {
    console.log('GET /api/v1/customer/dashboard/tickets - Fetching support tickets');
    res.json({ 
        success: true,
        data: [
            {
                id: 'tick_001',
                subject: 'Internet connection issue',
                status: 'in_progress',
                priority: 'high',
                createdDate: '2025-01-18T10:00:00Z',
                lastUpdate: '2025-01-19T14:30:00Z'
            },
            {
                id: 'tick_002',
                subject: 'Bill inquiry',
                status: 'closed',
                priority: 'medium',
                createdDate: '2025-01-10T15:00:00Z',
                lastUpdate: '2025-01-12T16:45:00Z'
            }
        ]
    });
});

// Generic customer endpoints
app.get('/api/v1/customer', (req, res) => {
    console.log('GET /api/v1/customer - Fetching all customers');
    res.json({ 
        success: true,
        data: [mockCustomerProfile]
    });
});

app.get('/api/v1/customer/:id', (req, res) => {
    console.log(`GET /api/v1/customer/${req.params.id} - Fetching customer by ID`);
    res.json({ 
        success: true,
        data: mockCustomerProfile
    });
});

app.post('/api/v1/customer', (req, res) => {
    console.log('POST /api/v1/customer - Creating new customer');
    res.json({ 
        success: true,
        message: 'Customer created successfully',
        data: { 
            id: 'cust_' + Date.now(),
            ...req.body,
            registrationDate: new Date().toISOString(),
            status: 'active'
        }
    });
});

app.put('/api/v1/customer/:id', (req, res) => {
    console.log(`PUT /api/v1/customer/${req.params.id} - Updating customer`);
    res.json({ 
        success: true,
        message: 'Customer updated successfully',
        data: { ...mockCustomerProfile, ...req.body }
    });
});

app.delete('/api/v1/customer/:id', (req, res) => {
    console.log(`DELETE /api/v1/customer/${req.params.id} - Deleting customer`);
    res.json({ 
        success: true,
        message: 'Customer deleted successfully'
    });
});

// Consent endpoints (proxied to customer service for simplicity)
app.get('/api/v1/consent', (req, res) => {
    console.log('GET /api/v1/consent - Fetching consents via customer service');
    const mockConsents = [
        {
            id: 'cons_001',
            purpose: 'marketing',
            status: 'granted',
            grantedAt: '2025-01-15T10:00:00Z',
            expiresAt: '2026-01-15T10:00:00Z',
            description: 'Marketing communications consent'
        },
        {
            id: 'cons_002',
            purpose: 'analytics',
            status: 'granted',
            grantedAt: '2025-01-10T14:30:00Z',
            expiresAt: '2026-01-10T14:30:00Z',
            description: 'Analytics and performance tracking consent'
        },
        {
            id: 'cons_003',
            purpose: 'personalization',
            status: 'revoked',
            grantedAt: '2025-01-05T09:15:00Z',
            revokedAt: '2025-01-18T16:45:00Z',
            description: 'Personalization and recommendations consent'
        }
    ];
    
    res.json({ 
        success: true,
        data: mockConsents
    });
});

app.post('/api/v1/consent', (req, res) => {
    console.log('POST /api/v1/consent - Creating consent');
    res.json({ 
        success: true,
        message: 'Consent granted successfully',
        data: { 
            id: 'cons_' + Date.now(),
            status: 'granted',
            grantedAt: new Date().toISOString(),
            ...req.body 
        }
    });
});

// Preference endpoints (proxied to customer service for simplicity)  
app.get('/api/v1/preference', (req, res) => {
    console.log('GET /api/v1/preference - Fetching preferences via customer service');
    const mockPreferences = {
        email: { enabled: true, frequency: 'daily' },
        sms: { enabled: false, frequency: 'never' },
        phone: { enabled: true, frequency: 'weekly' },
        push: { enabled: true, frequency: 'immediate' },
        topics: {
            marketing: true,
            product_updates: true,
            billing: true,
            security: true,
            surveys: false
        }
    };
    
    res.json({ 
        success: true,
        data: mockPreferences
    });
});

app.post('/api/v1/preference', (req, res) => {
    console.log('POST /api/v1/preference - Creating/updating preferences');
    res.json({ 
        success: true,
        message: 'Preferences updated successfully',
        data: { 
            ...req.body,
            updatedAt: new Date().toISOString()
        }
    });
});

app.listen(PORT, () => {
    console.log(`✓ Customer Service (Mock) running on port ${PORT}`);
    console.log(`✓ Customer Dashboard API: http://localhost:${PORT}/api/v1/customer/dashboard/profile`);
});
