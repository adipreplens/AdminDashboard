const https = require('https');

const SERVER_URL = 'https://admindashboard-x0hk.onrender.com';

console.log('🧪 Testing server response...\n');

// Test 1: Basic server response
console.log('1️⃣ Testing basic server response...');
https.get(SERVER_URL, (res) => {
  console.log(`   ✅ Status: ${res.statusCode}`);
  console.log(`   📊 Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`   📄 Response length: ${data.length} characters`);
    console.log(`   📝 First 200 chars: ${data.substring(0, 200)}...\n`);
    
    // Test 2: Health endpoint
    console.log('2️⃣ Testing health endpoint...');
    https.get(`${SERVER_URL}/health`, (healthRes) => {
      console.log(`   ✅ Health Status: ${healthRes.statusCode}`);
      
      let healthData = '';
      healthRes.on('data', chunk => healthData += chunk);
      healthRes.on('end', () => {
        try {
          const health = JSON.parse(healthData);
          console.log(`   📊 Health Data: ${JSON.stringify(health, null, 2)}`);
          console.log('\n🎉 Server is working properly!');
        } catch (e) {
          console.log(`   ❌ Health endpoint not returning JSON: ${healthData}`);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Health endpoint error: ${err.message}`);
    });
  });
}).on('error', (err) => {
  console.log(`   ❌ Server error: ${err.message}`);
  console.log('\n💀 Server is not responding properly!');
}); 