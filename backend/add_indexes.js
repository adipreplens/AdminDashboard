#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      console.log('\n🔧 Adding Database Indexes for Better Performance...');
      
      // Add indexes to Questions collection
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n📝 Adding indexes to Questions collection...');
      
      // Create indexes for frequently queried fields
      await Question.collection.createIndex({ exam: 1 });
      console.log('✅ Added index on exam field');
      
      await Question.collection.createIndex({ subject: 1 });
      console.log('✅ Added index on subject field');
      
      await Question.collection.createIndex({ publishStatus: 1 });
      console.log('✅ Added index on publishStatus field');
      
      await Question.collection.createIndex({ difficulty: 1 });
      console.log('✅ Added index on difficulty field');
      
      await Question.collection.createIndex({ tags: 1 });
      console.log('✅ Added index on tags field');
      
      // Compound indexes for common queries
      await Question.collection.createIndex({ exam: 1, subject: 1 });
      console.log('✅ Added compound index on exam + subject');
      
      await Question.collection.createIndex({ exam: 1, subject: 1, publishStatus: 1 });
      console.log('✅ Added compound index on exam + subject + publishStatus');
      
      // Add indexes to other collections
      console.log('\n👥 Adding indexes to Users collection...');
      const AppUser = mongoose.model('AppUser', new mongoose.Schema({}));
      await AppUser.collection.createIndex({ email: 1 }, { unique: true });
      console.log('✅ Added unique index on email field');
      
      console.log('\n📊 Adding indexes to TestSessions collection...');
      const TestSession = mongoose.model('TestSession', new mongoose.Schema({}));
      await TestSession.collection.createIndex({ userId: 1 });
      console.log('✅ Added index on userId field');
      
      await TestSession.collection.createIndex({ exam: 1, subject: 1 });
      console.log('✅ Added index on exam + subject');
      
      await TestSession.collection.createIndex({ status: 1 });
      console.log('✅ Added index on status field');
      
      console.log('\n✅ All indexes added successfully!');
      console.log('\n🚀 This should improve query performance and reduce alerts');
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error adding indexes:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }); 