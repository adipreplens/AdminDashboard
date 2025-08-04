const https = require('https');
const http = require('http');

// Your Render backend URL
const BACKEND_URL = 'https://admindashboard-x0hk.onrender.com';

// Keep alive function with better error handling
function keepAlive() {
  console.log('🔄 Pinging backend to keep it alive...');
  
  const url = new URL(BACKEND_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: '/health',
    method: 'GET',
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
      'User-Agent': 'PrepLens-KeepAlive/1.0'
    }
  };

  const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`✅ Backend alive - Status: ${response.status}, MongoDB: ${response.mongodb}, S3: ${response.s3}`);
      } catch (e) {
        console.log(`✅ Backend alive - Status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Keep-alive failed:', error.message);
    console.log('💡 This is normal if backend is starting up...');
  });

  req.on('timeout', () => {
    console.error('⏰ Keep-alive timeout (30s) - backend might be starting');
    req.destroy();
  });

  // Set a shorter timeout for the request
  req.setTimeout(30000);
  req.end();
}

// Function to test if backend is responsive
function testBackend() {
  console.log('🔍 Testing if backend is responsive...');
  
  const url = new URL(BACKEND_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: '/health',
    method: 'GET',
    timeout: 10000, // 10 second timeout for quick test
    headers: {
      'User-Agent': 'PrepLens-HealthCheck/1.0'
    }
  };

  const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
    console.log(`✅ Backend responding - Status: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.log('❌ Backend not responding - might be sleeping');
  });

  req.on('timeout', () => {
    console.log('⏰ Backend test timeout');
    req.destroy();
  });

  req.setTimeout(10000);
  req.end();
}

// Initial test
testBackend();

// Ping every 13 minutes (to stay ahead of 15-minute sleep)
setInterval(keepAlive, 13 * 60 * 1000);

// Also test every 5 minutes to ensure responsiveness
setInterval(testBackend, 5 * 60 * 1000);

console.log('🚀 Keep-alive script started');
console.log(`📡 Pinging ${BACKEND_URL} every 13 minutes`);
console.log('🔍 Testing responsiveness every 5 minutes');
console.log('💡 This prevents Render from sleeping');
console.log('🛑 Press Ctrl+C to stop');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive script stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive script stopped by system');
  process.exit(0);
}); 