# Environment Variables Setup

## Required Environment Variables for Backend Deployment

### 1. MongoDB Connection String
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/preplensadmin
```

**How to get MongoDB URI:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster or use existing
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` with your values

### 2. JWT Secret
```
JWT_SECRET=your-super-secret-jwt-key-here
```
Generate a random string for JWT token signing.

### 3. Node Environment
```
NODE_ENV=production
```

### 4. Port (optional)
```
PORT=5000
```

## Deployment Steps

### Render (Backend)
1. Go to your Render dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add these variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = production

### Netlify (Frontend)
1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL 