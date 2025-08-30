#!/usr/bin/env node

/**
 * Deployment Debug Script
 * Check file structure and environment for deployment troubleshooting
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ConsentHub Deployment Debug\n');

// Check current working directory
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);
console.log('📁 Process argv:', process.argv);

// Check if comprehensive-backend.js exists in various locations
const possiblePaths = [
  './comprehensive-backend.js',
  './src/comprehensive-backend.js',
  '../comprehensive-backend.js',
  './backend/comprehensive-backend.js',
  './backend/render-server.js'
];

console.log('\n🔍 Checking file locations:');
for (const filePath of possiblePaths) {
  try {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Found: ${filePath} -> ${fullPath}`);
    } else {
      console.log(`❌ Not found: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${filePath}:`, error.message);
  }
}

// List root directory contents
console.log('\n📂 Root directory contents:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stats = fs.statSync(file);
    const type = stats.isDirectory() ? '📁' : '📄';
    console.log(`${type} ${file}`);
  });
} catch (error) {
  console.log('❌ Error reading directory:', error.message);
}

// Check for backend-related files
console.log('\n🔍 Looking for backend files:');
const backendFiles = ['comprehensive-backend.js', 'render-server.js', 'package.json', 'Procfile'];
for (const file of backendFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
}

// Check environment variables
console.log('\n🌍 Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('RENDER:', process.env.RENDER);
console.log('RENDER_SERVICE_NAME:', process.env.RENDER_SERVICE_NAME);

console.log('\n✅ Debug complete!');
