const fs = require('fs');
const path = require('path');

console.log('🧪 Comprehensive Image Upload Test');
console.log('=====================================\n');

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('1️⃣ Testing Backend Health...');
  try {
    const response = await fetch('http://localhost:5001/health');
    const data = await response.json();
    
    if (data.status === 'OK' && data.s3 === 'configured') {
      console.log('✅ Backend is healthy and S3 is configured');
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not responding');
    return false;
  }
}

// Test 2: Image Upload API
async function testImageUpload() {
  console.log('\n2️⃣ Testing Image Upload API...');
  try {
    const testImagePath = path.join(__dirname, 'backend', 'uploads', 'test-image.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found');
      return false;
    }

    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));

    const response = await fetch('http://localhost:5001/upload-image', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Image uploaded successfully to S3');
      console.log(`📎 Image URL: ${data.imageUrl}`);
      return true;
    } else {
      console.log('❌ Image upload failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Image upload test failed:', error.message);
    return false;
  }
}

// Test 3: Frontend Accessibility
async function testFrontendAccess() {
  console.log('\n3️⃣ Testing Frontend Access...');
  try {
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      console.log('✅ Frontend is accessible');
      return true;
    } else {
      console.log('❌ Frontend is not responding');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend test failed:', error.message);
    return false;
  }
}

// Test 4: S3 Bucket Access
async function testS3Bucket() {
  console.log('\n4️⃣ Testing S3 Bucket Access...');
  try {
    const response = await fetch('https://preplens-assets-prod.s3.amazonaws.com/');
    
    if (response.status === 200 || response.status === 403) {
      console.log('✅ S3 bucket is accessible');
      return true;
    } else {
      console.log('❌ S3 bucket access failed');
      return false;
    }
  } catch (error) {
    console.log('❌ S3 bucket test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive image upload tests...\n');
  
  const results = {
    backendHealth: await testBackendHealth(),
    imageUpload: await testImageUpload(),
    frontendAccess: await testFrontendAccess(),
    s3Bucket: await testS3Bucket()
  };

  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Backend Health: ${results.backendHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Image Upload: ${results.imageUpload ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Access: ${results.frontendAccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`S3 Bucket: ${results.s3Bucket ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Image upload functionality is working perfectly');
    console.log('✅ You can now use image uploads in your PrepLens Admin Dashboard');
    console.log('\n🌐 Access your application at: http://localhost:3000');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
  }

  return allPassed;
}

// Run the tests
runAllTests().catch(console.error); 