# 🚀 Deployment Guide for Render & Netlify

## ✅ **Code Successfully Pushed to GitHub**

Your code has been pushed to: `https://github.com/adipreplens/AdminDashboard`

## 🔧 **Environment Variables Setup**

### **For Render (Backend)**

1. Go to your Render dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add these variables:

```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=preplens-assets-prod
MONGODB_URI=your_mongodb_connection_string_here
NODE_ENV=production
PORT=5001
```

### **For Netlify (Frontend)**

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add:

```
NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
```

## 🎯 **Deployment Steps**

### **Render (Backend) Deployment**

1. **Connect Repository**
   - Go to Render dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `adipreplens/AdminDashboard`

2. **Configure Service**
   - **Name**: `preplens-admin-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables**
   - Add all the AWS and MongoDB variables listed above

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://preplens-admin-backend.onrender.com`)

### **Netlify (Frontend) Deployment**

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub repository: `adipreplens/AdminDashboard`

2. **Configure Build**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` with your Render backend URL

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete

## 🔗 **Update Frontend API URL**

After getting your Render backend URL, update the frontend:

1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Update `NEXT_PUBLIC_API_URL` to your Render URL

## 🖼️ **Image Upload Features**

Once deployed, you'll have:

✅ **Question Images** - Upload images for questions  
✅ **Option Images** - Upload images for each option (A, B, C, D)  
✅ **Solution Images** - Upload images in solution area  
✅ **Direct Paste** - Paste images with Ctrl+V  
✅ **Drag & Drop** - Drag images from computer  
✅ **S3 Storage** - All images stored in AWS S3 bucket  

## 📊 **Health Check URLs**

- **Backend Health**: `https://your-backend-url.onrender.com/health`
- **Frontend**: `https://your-site-name.netlify.app`

## 🔍 **Troubleshooting**

### **If Backend Fails to Deploy:**
1. Check environment variables are set correctly
2. Verify MongoDB connection string
3. Check AWS credentials are valid

### **If Frontend Fails to Deploy:**
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check build logs for errors
3. Ensure all dependencies are installed

### **If Image Uploads Don't Work:**
1. Verify AWS credentials in Render environment
2. Check S3 bucket permissions
3. Test backend health endpoint

## 🎉 **Success Indicators**

✅ Backend health check returns: `{"status":"OK","s3":"configured"}`  
✅ Frontend loads without errors  
✅ Image uploads work in question forms  
✅ Images are stored in S3 bucket  
✅ Questions can be created with images  

## 📞 **Support**

If you encounter issues:
1. Check Render deployment logs
2. Check Netlify build logs
3. Verify environment variables
4. Test backend health endpoint

**Your PrepLens Admin Dashboard will be fully functional with image uploads once deployed!** 🚀 