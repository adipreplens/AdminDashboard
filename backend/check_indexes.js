#!/usr/bin/env node
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      console.log('\n🔍 Checking Database Indexes...');
      
      // Check Questions collection indexes
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      const questionIndexes = await Question.collection.getIndexes();
      
      console.log('\n📝 QUESTIONS Collection Indexes:');
      console.log(`Total Indexes: ${Object.keys(questionIndexes).length}`);
      Object.keys(questionIndexes).forEach(indexName => {
        const index = questionIndexes[indexName];
        console.log(`- ${indexName}: ${JSON.stringify(index.key)}`);
      });
      
      // Check Users collection indexes
      const AppUser = mongoose.model('AppUser', new mongoose.Schema({}));
      const userIndexes = await AppUser.collection.getIndexes();
      
      console.log('\n👥 USERS Collection Indexes:');
      console.log(`Total Indexes: ${Object.keys(userIndexes).length}`);
      Object.keys(userIndexes).forEach(indexName => {
        const index = userIndexes[indexName];
        console.log(`- ${indexName}: ${JSON.stringify(index.key)}`);
      });
      
      // Check TestSessions collection indexes
      const TestSession = mongoose.model('TestSession', new mongoose.Schema({}));
      const sessionIndexes = await TestSession.collection.getIndexes();
      
      console.log('\n📊 TEST SESSIONS Collection Indexes:');
      console.log(`Total Indexes: ${Object.keys(sessionIndexes).length}`);
      Object.keys(sessionIndexes).forEach(indexName => {
        const index = sessionIndexes[indexName];
        console.log(`- ${indexName}: ${JSON.stringify(index.key)}`);
      });
      
      // Check total indexes across all collections
      const totalIndexes = Object.keys(questionIndexes).length + 
                          Object.keys(userIndexes).length + 
                          Object.keys(sessionIndexes).length;
      
      console.log('\n📊 INDEX SUMMARY:');
      console.log('==================');
      console.log(`Total Indexes: ${totalIndexes}`);
      console.log(`Questions: ${Object.keys(questionIndexes).length}`);
      console.log(`Users: ${Object.keys(userIndexes).length}`);
      console.log(`TestSessions: ${Object.keys(sessionIndexes).length}`);
      
      // MongoDB Atlas Free Tier Limits
      console.log('\n📋 MONGODB ATLAS FREE TIER LIMITS:');
      console.log('====================================');
      console.log('Storage: 512 MB');
      console.log('Indexes: No specific limit');
      console.log('Connections: 500');
      
      if (totalIndexes > 20) {
        console.log('\n⚠️  WARNING: You have many indexes');
        console.log('💡 Consider removing unused indexes');
      } else if (totalIndexes > 15) {
        console.log('\n⚠️  Moderate number of indexes');
        console.log('✅ Still within reasonable limits');
      } else {
        console.log('\n✅ Good number of indexes');
        console.log('🚀 Performance should be optimal');
      }
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error checking indexes:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }); 