const S3Service = require('./backend/s3Service');

async function testS3Service() {
  console.log('🧪 Testing S3Service directly...');
  
  try {
    const s3Service = new S3Service();
    
    // Test health check
    console.log('🔍 Testing S3 health check...');
    const health = await s3Service.healthCheck();
    console.log('Health check result:', health);
    
    // Test fallback to local storage
    console.log('📁 Testing local storage fallback...');
    
    // Create a mock file object
    const mockFile = {
      buffer: Buffer.from('test image data'),
      mimetype: 'image/png',
      originalname: 'test.png'
    };
    
    const filename = `test-${Date.now()}.png`;
    
    console.log('🔄 Testing upload...');
    const result = await s3Service.uploadFile(mockFile, filename);
    console.log('Upload result:', result);
    
  } catch (error) {
    console.error('❌ S3Service test failed:', error);
  }
}

testS3Service(); 