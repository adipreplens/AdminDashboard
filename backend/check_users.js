#!/usr/bin/env node
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const AppUser = mongoose.model('AppUser', new mongoose.Schema({}));
      
      console.log('\n🔍 Checking Users in Database...');
      
      const users = await AppUser.find({}, 'email name createdAt');
      const totalUsers = users.length;
      
      console.log(`\n📊 Total Users: ${totalUsers}`);
      
      if (totalUsers === 0) {
        console.log('\n⚠️  No users found in database');
        console.log('💡 You need to register a user first');
        console.log('\n🚀 To test login, you can:');
        console.log('1. Use the registration API to create a user');
        console.log('2. Then use those credentials to login');
        console.log('\n📱 Registration API:');
        console.log('POST /api/v1/users/register');
        console.log('Body: { "email": "test@example.com", "password": "password123", "name": "Test User" }');
      } else {
        console.log('\n👥 Existing Users:');
        users.forEach((user, index) => {
          console.log(`${index + 1}. Email: ${user.email}`);
          console.log(`   Name: ${user.name || 'Not set'}`);
          console.log(`   Created: ${user.createdAt}`);
          console.log('');
        });
        
        console.log('💡 To see full user details (including hashed passwords), check the database directly');
        console.log('🔐 Passwords are hashed with bcrypt for security');
      }
      
      // Check if there are any test users we can use
      console.log('\n🧪 Testing Login Credentials:');
      console.log('============================');
      console.log('If you have users, you can test login with:');
      console.log('POST /api/v1/users/login');
      console.log('Body: { "email": "user@example.com", "password": "their_password" }');
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error checking users:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }); 