const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Adjust if your server runs on a different port

async function testUserRegistration() {
  try {
    console.log('🧪 Testing User Registration Endpoints...\n');

    // Test 1: Basic user registration
    console.log('1️⃣ Testing basic user registration...');
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+91-9876543210',
      exam: 'rrb-je',
      language: 'english',
      referralCode: null
    };

    const response = await axios.post(`${BASE_URL}/api/users/register`, userData);
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    const { token, data: { user } } = response.data;
    console.log(`User ID: ${user.id}`);
    console.log(`Token: ${token.substring(0, 20)}...\n`);

    // Test 2: Get user profile
    console.log('2️⃣ Testing get user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/users/profile/${user.id}`);
    console.log('✅ Profile fetched successfully!');
    console.log('Profile:', JSON.stringify(profileResponse.data, null, 2));

    // Test 3: Complete onboarding
    console.log('3️⃣ Testing onboarding completion...');
    const onboardingData = {
      userId: user.id,
      exam: 'rrb-je',
      preparationDays: 120,
      currentLevel: 'intermediate',
      preferredSubjects: ['mathematics', 'reasoning', 'general-knowledge'],
      studyTimePerDay: 3,
      weakAreas: ['electrical-engineering'],
      strongAreas: ['mathematics'],
      targetScore: 85,
      dailyQuestions: 40,
      weeklyTests: 4
    };

    const onboardingResponse = await axios.post(`${BASE_URL}/api/users/onboarding`, onboardingData);
    console.log('✅ Onboarding completed successfully!');
    console.log('Onboarding:', JSON.stringify(onboardingResponse.data, null, 2));

    // Test 4: Get updated profile
    console.log('4️⃣ Testing get updated profile...');
    const updatedProfileResponse = await axios.get(`${BASE_URL}/api/users/profile/${user.id}`);
    console.log('✅ Updated profile fetched successfully!');
    console.log('Updated Profile:', JSON.stringify(updatedProfileResponse.data, null, 2));

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Test duplicate registration
async function testDuplicateRegistration() {
  try {
    console.log('\n🧪 Testing duplicate registration...');
    
    const userData = {
      name: 'Duplicate User',
      email: 'test@example.com', // Same email as before
      password: 'password123',
      phone: '+91-9876543210',
      exam: 'rrb-je',
      language: 'english',
      referralCode: null
    };

    const response = await axios.post(`${BASE_URL}/api/users/register`, userData);
    console.log('❌ This should have failed!');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Duplicate registration correctly rejected!');
      console.log('Error:', error.response.data.error);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

// Test validation
async function testValidation() {
  try {
    console.log('\n🧪 Testing validation...');
    
    const invalidData = {
      name: '', // Missing name
      email: 'invalid-email', // Invalid email
      password: '123', // Too short password
      exam: 'invalid-exam', // Invalid exam
      language: 'spanish' // Invalid language
    };

    const response = await axios.post(`${BASE_URL}/api/users/register`, invalidData);
    console.log('❌ This should have failed!');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation correctly rejected invalid data!');
      console.log('Error:', error.response.data.error);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

// Run all tests
async function runAllTests() {
  await testUserRegistration();
  await testDuplicateRegistration();
  await testValidation();
}

// Check if axios is available
try {
  require.resolve('axios');
  runAllTests();
} catch (error) {
  console.log('📦 Installing axios first...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios installed successfully!');
    runAllTests();
  } catch (installError) {
    console.error('❌ Failed to install axios:', installError.message);
    console.log('Please run: npm install axios');
  }
} 