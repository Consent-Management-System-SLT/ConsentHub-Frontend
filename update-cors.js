const fs = require('fs');
const path = require('path');

// List of mock service files
const mockServices = [
    'mock-customer-service.js',
    'mock-consent-service.js',
    'mock-preference-service.js',
    'mock-privacy-notice-service.js',
    'mock-dsar-service.js',
    'mock-event-service.js'
];

const corsConfig = `cors({
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
})`;

mockServices.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace simple cors() with detailed config
        content = content.replace(/app\.use\(cors\(\)\);/, `app.use(${corsConfig});`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated CORS configuration in ${filename}`);
    }
});

console.log('All mock services updated with Vercel CORS support!');
