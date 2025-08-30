#!/usr/bin/env node

/**
 * Smart Backend Starter for ConsentHub
 * Automatically finds and starts the correct backend file
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 ConsentHub Smart Backend Starter');
console.log('📁 Working directory:', process.cwd());

// Possible backend file locations
const backendPaths = [
  './comprehensive-backend.js',
  './src/comprehensive-backend.js', 
  './backend/comprehensive-backend.js',
  './backend/render-server.js',
  '../comprehensive-backend.js'
];

let backendFile = null;

// Find the correct backend file
for (const filepath of backendPaths) {
  if (fs.existsSync(filepath)) {
    backendFile = filepath;
    console.log(`✅ Found backend at: ${filepath}`);
    break;
  }
}

if (!backendFile) {
  console.log('❌ No backend file found! Checked:');
  backendPaths.forEach(p => console.log(`   - ${p}`));
  
  // List current directory for debugging
  console.log('\n📂 Current directory contents:');
  try {
    const files = fs.readdirSync('.');
    files.forEach(file => {
      const stats = fs.statSync(file);
      const type = stats.isDirectory() ? '📁' : '📄';
      console.log(`   ${type} ${file}`);
    });
  } catch (error) {
    console.log('Error listing directory:', error.message);
  }
  
  process.exit(1);
}

// Start the backend
console.log(`🔥 Starting backend: ${backendFile}`);
const backend = spawn('node', [backendFile], {
  stdio: 'inherit',
  env: process.env
});

backend.on('close', (code) => {
  console.log(`Backend exited with code ${code}`);
  process.exit(code);
});

backend.on('error', (error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
