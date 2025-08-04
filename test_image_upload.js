const fs = require('fs');
const path = require('path');

// Create a simple test image (1x1 pixel PNG)
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

// Write test image to file
const testImagePath = 'test_image.png';
fs.writeFileSync(testImagePath, testImageData);

console.log('🧪 Testing image upload functionality...');
console.log('📋 Steps:');
console.log('   1. Created test image file');
console.log('   2. Will upload to backend');
console.log('   3. Check response');

// Test the upload endpoint
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testImageUpload() {
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));

    console.log('🔄 Uploading test image...');
    
    const response = await fetch('https://admindashboard-x0hk.onrender.com/upload-image', {
      method: 'POST',
      body: form
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Upload successful!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      
      // Test if the image URL is accessible
      console.log('🔍 Testing image URL accessibility...');
      const imageResponse = await fetch(data.imageUrl);
      if (imageResponse.ok) {
        console.log('✅ Image URL is accessible!');
      } else {
        console.log('❌ Image URL not accessible');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Cleaned up test file');
    }
  }
}

testImageUpload(); 