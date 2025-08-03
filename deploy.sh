#!/bin/bash

echo "🚀 Deploying PrepLens Admin Backend..."

# Check if we're in the right directory
if [ ! -f "backend/index.js" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Preparing backend for deployment..."

# Navigate to backend directory
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

echo "✅ Backend is ready for deployment!"
echo ""
echo "🔧 Next steps:"
echo "1. Push your changes to your Git repository"
echo "2. Render will automatically deploy the updates"
echo "3. Add these environment variables in Render dashboard:"
echo "   - RENDER_SLEEP_TIMEOUT=300"
echo "   - HEALTH_CHECK_PATH=/health"
echo "   - MIN_INSTANCES=1"
echo "   - MAX_INSTANCES=1"
echo ""
echo "4. Run the keep-alive script:"
echo "   node keep_alive.js"
echo ""
echo "🎉 Your server will stay awake with the new health check endpoint!" 