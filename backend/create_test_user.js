#!/usr/bin/env node
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQspJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const AppUser = mongoose.model('AppUser', new mongoose.Schema({}));
      
      console.log('\n🔍 Creating Test User...');
      
      // Check if test user already exists
      const existingUser = await AppUser.findOne({ email: 'test@preplens.com' });
      
      if (existingUser) {
        console.log('⚠️  Test user already exists');
        console.log('Email: test@preplens.com');
        console.log('Password: test123');
        console.log('\n🚀 You can use these credentials to login!');
      } else {
        // Create a new test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const testUser = new AppUser({
          email: 'test@preplens.com',
          password: hashedPassword,
          name: 'Test User',
          phone: '+91-9876543210',
          exam: 'rrb-je',
          isPremium: false,
          referralCode: 'TEST001',
          referredBy: null,
          commission: 0,
          totalEarnings: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await testUser.save();
        console.log('✅ Test user created successfully!');
        console.log('\n🔐 Login Credentials:');
        console.log('Email: test@preplens.com');
        console.log('Password: test123');
        console.log('\n🚀 You can now test login with these credentials!');
      }
      
      // Show all users for reference
      console.log('\n📊 All Users in Database:');
      const allUsers = await AppUser.find({}, 'email name createdAt');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email || 'No email'}`);
        console.log(`   Name: ${user.name || 'No name'}`);
        console.log(`   Created: ${user.createdAt || 'No date'}`);
        console.log('');
      });
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error creating test user:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }); 