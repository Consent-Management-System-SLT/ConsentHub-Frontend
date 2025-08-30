#!/usr/bin/env node

/**
 * Deployment Validation Script for ConsentHub
 * Validates that all required files and configurations are ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ConsentHub Deployment Validation\n');

// Check required files
const requiredFiles = [
  'comprehensive-backend.js',
  'config/database.js',
  'models/User.js',
  'models/Consent.js',
  'models/PrivacyNoticeNew.js',
  'models/DSARRequest.js',
  'models/AuditLog.js',
  'package.json',
  'render.yaml'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'express',
  'cors',
  'mongoose',
  'socket.io',
  'multer',
  'csv-parser',
  'fs-extra',
  'dotenv',
  'jsonwebtoken'
];

let allDepsExist = true;
for (const dep of requiredDeps) {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allDepsExist = false;
  }
}

// Check configuration
console.log('\n⚙️  Checking configuration...');
const backendContent = fs.readFileSync('comprehensive-backend.js', 'utf8');
const renderConfig = fs.readFileSync('render.yaml', 'utf8');

// Check port configuration
if (backendContent.includes('process.env.PORT || 10000')) {
  console.log('✅ PORT configured for production (10000)');
} else if (backendContent.includes('process.env.PORT || 3001')) {
  console.log('⚠️  PORT still set to 3001 - should be 10000 for Render');
} else {
  console.log('❌ PORT configuration not found');
}

// Check CORS configuration
if (backendContent.includes('consent-management-system-api.vercel.app')) {
  console.log('✅ CORS configured for Vercel frontend');
} else {
  console.log('❌ CORS not configured for production frontend');
}

// Check Socket.io CORS
if (backendContent.includes('consent-management-system-api.vercel.app') && 
    backendContent.includes('socketIo')) {
  console.log('✅ Socket.io CORS configured for production');
} else {
  console.log('⚠️  Socket.io CORS may need production URLs');
}

// Check render.yaml
if (renderConfig.includes('comprehensive-backend.js')) {
  console.log('✅ Render configured to use comprehensive-backend.js');
} else {
  console.log('❌ Render not configured correctly');
}

console.log('\n🎯 Deployment Status:');
if (allFilesExist && allDepsExist) {
  console.log('✅ Ready for deployment!');
  console.log('\n📋 Next steps:');
  console.log('1. Commit all changes to GitHub');
  console.log('2. Push to main branch or deployment branch');
  console.log('3. Redeploy on Render.com');
  console.log('4. Verify all endpoints are working');
} else {
  console.log('❌ Issues found - please fix before deployment');
}

console.log('\n🔗 Expected Endpoints After Deployment:');
console.log('- https://consenthub-backend.onrender.com/api/v1/health');
console.log('- https://consenthub-backend.onrender.com/api/v1/privacy-notices');
console.log('- https://consenthub-backend.onrender.com/api/v1/admin/dashboard/overview');
console.log('- https://consenthub-backend.onrender.com/api/guardians');
console.log('- https://consenthub-backend.onrender.com/api/v1/dsar/requests');
