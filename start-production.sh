#!/bin/bash

# ConsentHub Production Deployment Script
echo "🚀 Starting ConsentHub Production Deployment..."

# Check if we're on Render (backend) or Vercel (frontend)
if [ "$RENDER" = "true" ]; then
    echo "📡 Deploying Backend to Render..."
    echo "Port: $PORT"
    echo "Node Environment: $NODE_ENV"
    node comprehensive-backend.js
else
    echo "🌐 Building Frontend for Vercel..."
    npm run build
fi
