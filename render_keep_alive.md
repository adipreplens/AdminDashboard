# Render Keep-Alive Configuration Guide

## 🚀 Quick Setup Steps:

### 1. Add Environment Variables in Render Dashboard:
Go to your Render service → Environment tab → Add these variables:

```
RENDER_SLEEP_TIMEOUT=300
HEALTH_CHECK_PATH=/health
MIN_INSTANCES=1
MAX_INSTANCES=1
```

### 2. Deploy Your Updated Backend:
The backend now includes a `/health` endpoint that Render will automatically ping.

### 3. Run the Keep-Alive Script:
```bash
node keep_alive.js
```

## 📋 Detailed Environment Variables:

### Essential Variables:
```
RENDER_SLEEP_TIMEOUT=300          # 5 minutes (default is 15)
HEALTH_CHECK_PATH=/health         # Health check endpoint
MIN_INSTANCES=1                   # Always keep 1 instance running
MAX_INSTANCES=1                   # Don't scale up unnecessarily
```

### Optional Performance Variables:
```
NODE_ENV=production              # Production mode
NODE_OPTIONS=--max-old-space-size=512  # Memory limit
```

## 🔧 How to Add in Render Dashboard:

1. **Go to your Render service**
2. **Click "Environment" tab**
3. **Click "Add Environment Variable"**
4. **Add each variable above**
5. **Click "Save Changes"**
6. **Redeploy your service**

## 📊 Monitor Your Server:

### Check Health Endpoint:
```bash
curl https://admindashboard-x0hk.onrender.com/health
```

### Run Keep-Alive Script:
```bash
node keep_alive.js
```

## ✅ Benefits:
- ✅ **Faster response times** (no cold starts)
- ✅ **Reduced sleep time** (5 min vs 15 min)
- ✅ **Better user experience** 
- ✅ **More reliable image uploads**
- ✅ **Automatic health monitoring**

## 🚨 Troubleshooting:

### If server still sleeps:
1. Check if health endpoint is working
2. Verify environment variables are set
3. Ensure keep-alive script is running
4. Check Render logs for errors

### If keep-alive script fails:
1. Check internet connection
2. Verify server URL is correct
3. Look for firewall issues
4. Check if server is actually down

## 📈 Advanced Monitoring:

You can also use external services like:
- **UptimeRobot** (free)
- **Pingdom** (paid)
- **StatusCake** (free tier available)

These will ping your server from external locations and alert you if it goes down.

## 🔄 Keep-Alive Script Features:
- ✅ Pings multiple endpoints
- ✅ Automatic retry on failure
- ✅ Detailed logging
- ✅ Graceful shutdown
- ✅ Timeout handling
- ✅ Server stats monitoring 