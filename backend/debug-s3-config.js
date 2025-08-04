require('dotenv').config();
const AWS = require('aws-sdk');

console.log('🔍 Debugging AWS Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME || '❌ Not set');

// Configure AWS
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME;

console.log('\n🔧 AWS Configuration:');
if (!accessKeyId || !secretAccessKey || !bucketName) {
  console.log('❌ Missing required AWS credentials');
  console.log('   - accessKeyId:', accessKeyId ? '✅' : '❌');
  console.log('   - secretAccessKey:', secretAccessKey ? '✅' : '❌');
  console.log('   - bucketName:', bucketName ? '✅' : '❌');
} else {
  console.log('✅ All AWS credentials are present');
  
  // Configure AWS SDK
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
  });
  
  console.log('✅ AWS SDK configured');
  
  // Test S3 connection
  const s3 = new AWS.S3();
  console.log('\n🧪 Testing S3 connection...');
  
  s3.headBucket({ Bucket: bucketName }, (err, data) => {
    if (err) {
      console.log('❌ S3 connection failed:', err.message);
      console.log('   Error code:', err.code);
      console.log('   Status code:', err.statusCode);
    } else {
      console.log('✅ S3 connection successful!');
      console.log('   Bucket:', bucketName);
      console.log('   Region:', region);
    }
  });
} 