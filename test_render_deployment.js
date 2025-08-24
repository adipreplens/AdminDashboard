const https = require('https');

const RENDER_URL = 'https://admindashboard-x0hk.onrender.com';

console.log('🔍 Testing PrepLens Admin Dashboard Deployment on Render...\n');

// Test function with timeout
function testEndpoint(path, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);

    const req = https.get(`${RENDER_URL}${path}`, (res) => {
      clearTimeout(timer);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    req.setTimeout(timeout, () => {
      clearTimeout(timer);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTests() {
  const tests = [
    { name: 'Ping Test', path: '/ping' },
    { name: 'Health Check', path: '/health' },
    { name: 'Root Endpoint', path: '/' },
    { name: 'Auth Login', path: '/auth/login' }
  ];

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`   URL: ${RENDER_URL}${test.path}`);
    
    try {
      const result = await testEndpoint(test.path);
      
      if (result.statusCode === 200) {
        console.log(`   ✅ Status: ${result.statusCode} - SUCCESS`);
        if (test.path === '/health' && result.data.status) {
          console.log(`   📊 Status: ${result.data.status}`);
          console.log(`   🗄️ MongoDB: ${result.data.mongodb}`);
          console.log(`   ☁️ S3: ${result.data.s3}`);
        }
      } else {
        console.log(`   ⚠️ Status: ${result.statusCode} - Unexpected response`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      
      if (error.message.includes('timeout')) {
        console.log('   💡 This might indicate the server is starting up or has issues');
      }
    }
    
    console.log('');
  }

  console.log('📋 Summary:');
  console.log('   • If ping test fails: Server is down or not deployed');
  console.log('   • If health check fails: S3 or MongoDB issues');
  console.log('   • If all tests fail: Check Render deployment status');
  console.log('');
  console.log('🔗 Render Dashboard: https://dashboard.render.com');
  console.log('🔗 Check deployment logs for detailed error information');
}

runTests().catch(console.error); 