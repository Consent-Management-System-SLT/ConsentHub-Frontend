#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting ConsentHub Backend Services ===${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if netstat -tuln | grep -q ":$port "; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Killing existing process on port $port...${NC}"
    
    # For Windows (PowerShell)
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        powershell -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }"
    else
        # For Linux/macOS
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
    
    sleep 2
}

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local script_file=$3
    
    echo -e "${BLUE}Starting $service_name on port $port...${NC}"
    
    # Check if port is in use and kill existing process
    if check_port $port; then
        kill_port $port
    fi
    
    # Start the service in background
    cd backend
    node "$script_file" > "../logs/${service_name}.log" 2>&1 &
    local pid=$!
    
    echo -e "${GREEN}✓ $service_name started (PID: $pid)${NC}"
    echo $pid > "../logs/${service_name}.pid"
    
    cd ..
    sleep 1
}

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${YELLOW}Stopping any existing services...${NC}"

# Stop existing services
kill_port 3008  # Auth Service
kill_port 3011  # Customer Service  
kill_port 3012  # Consent Service
kill_port 3013  # Preference Service
kill_port 3014  # Privacy Notice Service
kill_port 3015  # DSAR Service

echo -e "${BLUE}Starting all services...${NC}"

# Start Auth Service (already exists)
echo -e "${BLUE}Starting Simple Auth Service on port 3008...${NC}"
cd backend
node simple-auth-server.js > ../logs/auth-service.log 2>&1 &
auth_pid=$!
echo -e "${GREEN}✓ Auth Service started (PID: $auth_pid)${NC}"
echo $auth_pid > ../logs/auth-service.pid
cd ..

# Start Customer Service (already exists) 
if [ -f "backend/simple-server.js" ]; then
    echo -e "${BLUE}Starting Customer Service on port 3011...${NC}"
    cd backend
    node simple-server.js > ../logs/customer-service.log 2>&1 &
    customer_pid=$!
    echo -e "${GREEN}✓ Customer Service started (PID: $customer_pid)${NC}"
    echo $customer_pid > ../logs/customer-service.pid
    cd ..
fi

# Start new microservices
start_service "Consent Service" 3012 "consent-service.js"
start_service "Preference Service" 3013 "preference-service.js"
start_service "Privacy Notice Service" 3014 "privacy-notice-service.js"
start_service "DSAR Service" 3015 "dsar-service.js"

echo -e "${GREEN}=== All Services Started Successfully! ===${NC}"
echo
echo -e "${BLUE}Service Endpoints:${NC}"
echo -e "  • Auth Service:           ${GREEN}http://localhost:3008${NC}"
echo -e "  • Customer Service:       ${GREEN}http://localhost:3011${NC}"
echo -e "  • Consent Service:        ${GREEN}http://localhost:3012${NC}"
echo -e "  • Preference Service:     ${GREEN}http://localhost:3013${NC}"
echo -e "  • Privacy Notice Service: ${GREEN}http://localhost:3014${NC}"
echo -e "  • DSAR Service:           ${GREEN}http://localhost:3015${NC}"
echo
echo -e "${YELLOW}Logs are available in the 'logs' directory${NC}"
echo -e "${YELLOW}Use 'stop-services.sh' to stop all services${NC}"
echo
echo -e "${BLUE}Frontend:${NC}"
echo -e "  • Customer Dashboard:     ${GREEN}http://localhost:5174${NC}"
