#!/bin/bash

echo "🚀 PrepLens Backend Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📋 Checking dependencies..."

if ! command_exists git; then
    echo -e "${RED}❌ Git not found. Please install Git first.${NC}"
    exit 1
fi

if ! command_exists curl; then
    echo -e "${RED}❌ Curl not found. Please install Curl first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}"

# Function to test backend health
test_backend() {
    echo "🔍 Testing backend health..."
    local response=$(curl -s --max-time 10 "https://admindashboard-x0hk.onrender.com/health")
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        echo "📊 Response: $response"
        return 0
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        return 1
    fi
}

# Function to deploy to Render
deploy_to_render() {
    echo "🚀 Deploying to Render..."
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    git commit -m "🔄 Auto-deploy $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push to trigger Render deployment
    if git push; then
        echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
        echo "⏳ Waiting for Render deployment (2 minutes)..."
        sleep 120
        
        # Test the deployment
        if test_backend; then
            echo -e "${GREEN}✅ Deployment successful!${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️ Deployment may still be in progress${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        return 1
    fi
}

# Function to start keep-alive
start_keep_alive() {
    echo "🔄 Starting keep-alive script..."
    
    if command_exists node; then
        node keep_alive.js &
        local pid=$!
        echo -e "${GREEN}✅ Keep-alive started (PID: $pid)${NC}"
        echo "💡 This will keep your backend online 24/7"
        echo "🛑 To stop: kill $pid"
    else
        echo -e "${RED}❌ Node.js not found. Cannot start keep-alive.${NC}"
        echo "💡 Install Node.js to enable automatic keep-alive"
    fi
}

# Main menu
echo ""
echo "Choose an option:"
echo "1) Deploy to Render"
echo "2) Test backend health"
echo "3) Start keep-alive script"
echo "4) Deploy + Start keep-alive"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_to_render
        ;;
    2)
        test_backend
        ;;
    3)
        start_keep_alive
        ;;
    4)
        deploy_to_render
        if [ $? -eq 0 ]; then
            start_keep_alive
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "�� Script completed!" 