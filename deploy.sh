#!/bin/bash

echo "🚀 Starting PrepLens Admin Dashboard Deployment..."

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: backend/package.json not found. Please run this script from the project root."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

echo "✅ Backend dependencies installed successfully"

# Go back to root
cd ..

# Check if frontend exists and install dependencies
if [ -f "frontend/package.json" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Frontend dependency installation failed"
        exit 1
    fi
    
    echo "✅ Frontend dependencies installed successfully"
    cd ..
fi

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

echo "🎉 Deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push your changes to GitHub"
echo "2. Deploy to Render using the render.yaml configuration"
echo "3. Set up environment variables in Render dashboard"
echo ""
echo "🔗 Render Dashboard: https://dashboard.render.com"
echo "🔗 Health Check: https://admindashboard-x0hk.onrender.com/health"
echo "🔗 Ping Test: https://admindashboard-x0hk.onrender.com/ping" 