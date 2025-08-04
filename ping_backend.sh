#!/bin/bash

# PrepLens Backend Ping Script for Cron Job
# This keeps your Render backend online 24/7

BACKEND_URL="https://admindashboard-x0hk.onrender.com"
LOG_FILE="$HOME/preplens_ping.log"

# Colors for logging
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to ping backend
ping_backend() {
    log "🔄 Pinging backend..."
    
    # Try to ping the backend
    response=$(curl -s --max-time 30 "$BACKEND_URL/health" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        log "${GREEN}✅ Backend is alive${NC}"
        log "📊 Response: $response"
        return 0
    else
        log "${RED}❌ Backend not responding${NC}"
        log "💡 This is normal if backend is starting up..."
        return 1
    fi
}

# Main execution
log "🚀 Starting backend ping..."

# Ping the backend
if ping_backend; then
    log "${GREEN}✅ Ping successful${NC}"
    exit 0
else
    log "${YELLOW}⚠️ Ping failed - backend might be starting${NC}"
    exit 1
fi 