#!/bin/bash

# Setup AWS Environment Variables for Local Development
echo "Setting up AWS environment variables for local development..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=preplens-assets-prod

# MongoDB Configuration (if needed)
MONGODB_URI=mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin

# Node Environment
NODE_ENV=development
PORT=5001
EOF
    echo "✅ .env file created successfully!"
else
    echo "⚠️ .env file already exists. Please check if AWS credentials are set correctly."
fi

echo ""
echo "🔧 Environment setup complete!"
echo "📝 To start the server with these environment variables, run:"
echo "   npm start"
echo ""
echo "🔍 To verify the setup, check the health endpoint:"
echo "   curl http://localhost:5001/health" 