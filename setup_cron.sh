#!/bin/bash

# PrepLens Cron Job Setup Script
# This sets up automatic pinging of your backend

echo "🚀 PrepLens Cron Job Setup"
echo "=========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the absolute path of the ping script
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/ping_backend.sh"

echo -e "${BLUE}📋 Current setup:${NC}"
echo "Script path: $SCRIPT_PATH"
echo "Backend URL: https://admindashboard-x0hk.onrender.com"

# Test the script first
echo -e "\n${YELLOW}🧪 Testing ping script...${NC}"
if "$SCRIPT_PATH"; then
    echo -e "${GREEN}✅ Script works correctly${NC}"
else
    echo -e "${RED}❌ Script has issues${NC}"
    exit 1
fi

# Create cron job entry
CRON_JOB="*/10 * * * * $SCRIPT_PATH"

echo -e "\n${BLUE}📅 Cron job to be added:${NC}"
echo "$CRON_JOB"
echo ""
echo "This will ping your backend every 10 minutes"

# Ask for confirmation
read -p "Do you want to add this cron job? (y/n): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$SCRIPT_PATH"; then
        echo -e "${YELLOW}⚠️ Cron job already exists${NC}"
        echo "Current cron jobs:"
        crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$"
    else
        # Add the cron job
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo -e "${GREEN}✅ Cron job added successfully!${NC}"
    fi
    
    echo -e "\n${BLUE}📊 Current cron jobs:${NC}"
    crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$"
    
    echo -e "\n${GREEN}🎉 Setup complete!${NC}"
    echo "Your backend will be pinged every 10 minutes"
    echo "Logs will be saved to: ~/preplens_ping.log"
    
else
    echo -e "${YELLOW}❌ Setup cancelled${NC}"
    exit 0
fi

# Show how to monitor
echo -e "\n${BLUE}📈 To monitor your backend:${NC}"
echo "1. View logs: tail -f ~/preplens_ping.log"
echo "2. Check cron jobs: crontab -l"
echo "3. Remove cron job: crontab -e (then delete the line)"
echo "4. Test manually: $SCRIPT_PATH" 