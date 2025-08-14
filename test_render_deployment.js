const https = require('https');

const RENDER_URL = 'https://admindashboard-x0hk.onrender.com';

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${RENDER_URL}${endpoint}`;
    console.log(`🔍 Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${endpoint}: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`📊 Response:`, json);
          } catch (e) {
            console.log(`📄 Response: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`❌ Error: ${data}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${endpoint}: ${err.message}`);
      resolve();
    });
  });
}

async function testDeployment() {
  console.log('🚀 Testing Render Deployment...\n');
  
  await testEndpoint('/health');
  console.log('');
  
  await testEndpoint('/questions');
  console.log('');
  
  await testEndpoint('/modules');
  console.log('');
  
  console.log('✅ Deployment test completed!');
}

testDeployment(); 