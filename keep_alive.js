const https = require('https');
const http = require('http');

const SERVER_URLS = [
  'https://admindashboard-x0hk.onrender.com',
  'https://admindashboard-x0hk.onrender.com/health'
];

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes (to be safe)
const MAX_RETRIES = 3;

function pingServer(url, retryCount = 0) {
  const isHttps = url.startsWith('https');
  const client = isHttps ? https : http;
  
  console.log(`🔄 Pinging ${url} at ${new Date().toLocaleTimeString()}`);
  
  const req = client.get(url, (res) => {
    console.log(`✅ ${url} responded with status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`📊 Server stats: ${JSON.stringify(response, null, 2)}`);
      } catch (e) {
        // Not JSON response, that's okay
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Error pinging ${url}: ${err.message}`);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying ${url} in 30 seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      setTimeout(() => pingServer(url, retryCount + 1), 30000);
    } else {
      console.log(`💀 Failed to ping ${url} after ${MAX_RETRIES} attempts`);
    }
  });

  req.setTimeout(10000, () => {
    console.log(`⏰ Timeout pinging ${url}`);
    req.destroy();
  });
}

function pingAllServers() {
  SERVER_URLS.forEach(url => {
    pingServer(url);
  });
}

// Ping immediately
pingAllServers();

// Then ping every 4 minutes
setInterval(pingAllServers, PING_INTERVAL);

console.log(`🚀 Keep-alive script started!`);
console.log(`📡 Pinging ${SERVER_URLS.length} endpoints every 4 minutes`);
console.log(`⏰ Next ping in 4 minutes...`);
console.log(`🔧 Server URLs: ${SERVER_URLS.join(', ')}`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive script stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive script stopped by system');
  process.exit(0);
}); 