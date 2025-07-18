#!/bin/bash

# ConsentHub Full Stack Start Script

echo "🚀 Starting ConsentHub Full Stack Application..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install

# Install individual service dependencies
echo -e "${YELLOW}Installing service dependencies...${NC}"
npm run install:all

cd ..

echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"

# Start the application
echo -e "${BLUE}🚀 Starting application...${NC}"

# Create a function to handle cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down ConsentHub...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend services
echo -e "${YELLOW}Starting backend services...${NC}"
cd backend
npm run start:all &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start frontend
echo -e "${YELLOW}Starting frontend...${NC}"
cd ..
npm run dev &
FRONTEND_PID=$!

# Display startup information
echo -e "\n${GREEN}🎉 ConsentHub is starting up!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}Backend API Gateway: http://localhost:3000${NC}"
echo -e "${GREEN}Swagger Documentation: http://localhost:3000/docs${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
