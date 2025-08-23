const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const DSARRequest = require('./models/DSARRequest');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

async function fixDSARWithRealUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Get actual users using the API format (which works)
    const https = require('http');
    const users = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/users',
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.users);
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
    
    console.log(`\nFound ${users.length} actual users in database:`);
    users.slice(0, 10).forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Delete all existing DSAR requests
    const deleteResult = await DSARRequest.deleteMany({});
    console.log(`\nDeleted ${deleteResult.deletedCount} existing DSAR requests`);
    
    // Create realistic DSAR requests using actual users
    const realDSARRequests = [
      // Admin User - Data Access Request
      {
        userId: users.find(u => u.email === 'admin@sltmobitel.lk')?.id,
        requesterId: users.find(u => u.email === 'admin@sltmobitel.lk')?.id,
        requesterName: 'Admin User',
        requesterEmail: 'admin@sltmobitel.lk',
        requestType: 'data_access',
        subject: 'Administrative Data Access Request',
        description: 'I need to access all personal data stored in the system for audit purposes, including user management logs, system configurations, and administrative access records.',
        status: 'pending',
        priority: 'high',
        legalBasis: 'legal_obligation',
        dataCategories: ['all_data'],
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      // CSR User - Data Rectification Request
      {
        userId: users.find(u => u.email === 'csr@sltmobitel.lk')?.id,
        requesterId: users.find(u => u.email === 'csr@sltmobitel.lk')?.id,
        requesterName: 'CSR User',
        requesterEmail: 'csr@sltmobitel.lk',
        requestType: 'data_rectification',
        subject: 'Update Department Information',
        description: 'My department information in the system shows "Customer Service" but it should be updated to "Customer Experience Team" as per the recent organizational restructuring.',
        status: 'in_progress',
        priority: 'medium',
        legalBasis: 'contract',
        dataCategories: ['personal_data'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000) // 27 days from now
      },
      // Updated TestUser - Data Erasure Request
      {
        userId: users.find(u => u.email === 'customer@sltmobitel.lk')?.id,
        requesterId: users.find(u => u.email === 'customer@sltmobitel.lk')?.id,
        requesterName: 'Updated TestUser',
        requesterEmail: 'customer@sltmobitel.lk',
        requestType: 'data_erasure',
        subject: 'Account Closure and Data Deletion',
        description: 'I am permanently relocating overseas and will no longer use SLT-Mobitel services. Please delete all my personal data including billing history, call records, and account information.',
        status: 'in_progress',
        priority: 'high',
        legalBasis: 'consent',
        dataCategories: ['all_data'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) // 25 days from now
      },
      // Ojitha Rajapaksha - Data Portability Request
      {
        userId: users.find(u => u.email === 'ojitharajapaksha@gmail.com')?.id,
        requesterId: users.find(u => u.email === 'ojitharajapaksha@gmail.com')?.id,
        requesterName: 'Ojitha Rajapaksha',
        requesterEmail: 'ojitharajapaksha@gmail.com',
        requestType: 'data_portability',
        subject: 'Data Export for Provider Migration',
        description: 'I am switching to another telecom provider and need to export all my data including call logs, billing history, service usage patterns, and preferences in CSV format for the past 12 months.',
        status: 'completed',
        priority: 'medium',
        legalBasis: 'contract',
        dataCategories: ['billing_information', 'usage_data', 'communication_data', 'preferences'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // completed yesterday
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      // Chamal Pradeep - Restrict Processing
      {
        userId: users.find(u => u.email === 'chamal@gmail.com')?.id,
        requesterId: users.find(u => u.email === 'chamal@gmail.com')?.id,
        requesterName: 'Chamal Pradeep',
        requesterEmail: 'chamal@gmail.com',
        requestType: 'restrict_processing',
        subject: 'Billing Data Processing Restriction',
        description: 'I dispute the accuracy of my billing records for the past 2 months. There are charges for international calls that I did not make. Please restrict processing of my billing data until this is resolved.',
        status: 'pending',
        priority: 'high',
        legalBasis: 'legitimate_interests',
        dataCategories: ['billing_information'],
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      // Oshadhi Silva - Object to Processing
      {
        userId: users.find(u => u.email === 'oshadhi@gmail.com')?.id,
        requesterId: users.find(u => u.email === 'oshadhi@gmail.com')?.id,
        requesterName: 'Oshadhi Silva',
        requesterEmail: 'oshadhi@gmail.com',
        requestType: 'object_processing',
        subject: 'Marketing Communications Opt-out',
        description: 'I no longer wish to receive any marketing communications including SMS promotions, email campaigns, telemarketing calls, or promotional offers. Please remove me from all marketing lists.',
        status: 'completed',
        priority: 'low',
        legalBasis: 'legitimate_interests',
        dataCategories: ['marketing_data', 'preferences'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // completed 2 days ago
        dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      // Saman Kumara - Data Access Request
      {
        userId: users.find(u => u.email === 'samankumara@gmail.com')?.id,
        requesterId: users.find(u => u.email === 'samankumara@gmail.com')?.id,
        requesterName: 'Saman Kumara',
        requesterEmail: 'samankumara@gmail.com',
        requestType: 'data_access',
        subject: 'Personal Data Access Request',
        description: 'I need to access all personal data you have collected about me including my mobile service account details, call records, billing information, location data, and any third-party data sharing records.',
        status: 'in_progress',
        priority: 'medium',
        legalBasis: 'contract',
        dataCategories: ['personal_data', 'billing_information', 'usage_data', 'location_data'],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000) // 26 days from now
      },
      // Rosi Perera - Data Rectification
      {
        userId: users.find(u => u.email === 'rosi@gmail.com')?.id,
        requesterId: users.find(u => u.email === 'rosi@gmail.com')?.id,
        requesterName: 'Rosi Perera',
        requesterEmail: 'rosi@gmail.com',
        requestType: 'data_rectification',
        subject: 'Contact Information Update',
        description: 'My contact phone number in your system is outdated. I have changed my number and need to update it along with my emergency contact details.',
        status: 'completed',
        priority: 'medium',
        legalBasis: 'contract',
        dataCategories: ['contact_information'],
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // completed 3 days ago
        dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      // Omindu Premathilake - Data Portability
      {
        userId: users.find(u => u.email === 'aaomindu@gmail.com')?.id,
        requesterId: users.find(u => u.email === 'aaomindu@gmail.com')?.id,
        requesterName: 'Omindu Premathilake',
        requesterEmail: 'aaomindu@gmail.com',
        requestType: 'data_portability',
        subject: 'Business Account Data Export',
        description: 'I am migrating my business telecom services to a new provider and need to export all my corporate account data, including call logs, billing history, and service usage patterns for the past 2 years.',
        status: 'in_progress',
        priority: 'high',
        legalBasis: 'contract',
        dataCategories: ['billing_information', 'usage_data', 'communication_data'],
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000) // 24 days from now
      },
      // Vishmika Abeysiri - Data Erasure
      {
        userId: users.find(u => u.email === 'vishmika2adr@gmail.com')?.id,
        requesterId: users.find(u => u.email === 'vishmika2adr@gmail.com')?.id,
        requesterName: 'Vishmika Abeysiri',
        requesterEmail: 'vishmika2adr@gmail.com',
        requestType: 'data_erasure',
        subject: 'Complete Data Deletion Request',
        description: 'I want to exercise my right to erasure under GDPR. I am closing my account and moving abroad. Please delete all my personal data from your systems including call history, location data, and preferences.',
        status: 'completed',
        priority: 'high',
        legalBasis: 'consent',
        dataCategories: ['all_data'],
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // completed 4 days ago
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ].filter(req => req.userId); // Only include requests where we found the user
    
    // Insert the new DSAR requests
    const insertResult = await DSARRequest.insertMany(realDSARRequests);
    console.log(`\nCreated ${insertResult.length} new DSAR requests with actual users:`);
    
    insertResult.forEach(request => {
      console.log(`- ${request.requestType.toUpperCase()} for ${request.requesterName} (${request.requesterEmail}) - Status: ${request.status.toUpperCase()}`);
    });
    
    // Show summary by status
    const statusCounts = await DSARRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n=== DSAR STATUS SUMMARY ===');
    statusCounts.forEach(status => {
      console.log(`${status._id.toUpperCase()}: ${status.count}`);
    });
    
    console.log('\n✅ Successfully updated DSAR requests with real users from the database!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDSARWithRealUsers();
