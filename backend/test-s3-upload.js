require('dotenv').config();
const S3Service = require('./s3Service');
const fs = require('fs');
const path = require('path');

async function testS3Upload() {
  console.log('🧪 Testing S3 upload functionality...');
  
  try {
    // Create a test file
    const testContent = 'This is a test file for S3 upload verification';
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, testFileName);
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Create a mock file object similar to multer
    const mockFile = {
      buffer: fs.readFileSync(testFilePath),
      mimetype: 'text/plain',
      originalname: testFileName
    };
    
    // Test S3 upload
    const s3Service = new S3Service();
    console.log('📤 Attempting to upload test file to S3...');
    
    const uploadResult = await s3Service.uploadFile(mockFile, testFileName);
    console.log('✅ Upload successful!');
    console.log('📎 File URL:', uploadResult);
    
    // Test S3 health check
    console.log('🔍 Testing S3 health check...');
    const healthCheck = await s3Service.healthCheck();
    console.log('🏥 Health check result:', healthCheck);
    
    // Clean up local test file
    fs.unlinkSync(testFilePath);
    
    console.log('✅ S3 test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ S3 test failed:', error.message);
    return false;
  }
}

// Run the test
testS3Upload().then(success => {
  if (success) {
    console.log('🎉 All S3 functionality is working correctly!');
  } else {
    console.log('⚠️ S3 functionality needs attention.');
  }
  process.exit(success ? 0 : 1);
}); 