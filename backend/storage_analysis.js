#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      const AppUser = mongoose.model('AppUser', new mongoose.Schema({}));
      const TestSession = mongoose.model('TestSession', new mongoose.Schema({}));
      const Module = mongoose.model('Module', new mongoose.Schema({}));
      
      console.log('\n📊 MongoDB Storage Analysis');
      console.log('==========================');
      
      // Analyze Questions Collection
      console.log('\n📝 QUESTIONS COLLECTION:');
      const totalQuestions = await Question.countDocuments();
      console.log(`Total Questions: ${totalQuestions}`);
      
      // Sample question size analysis
      const sampleQuestion = await Question.findOne();
      const questionSize = JSON.stringify(sampleQuestion).length;
      const totalQuestionSize = (questionSize * totalQuestions / 1024 / 1024).toFixed(2);
      console.log(`Average Question Size: ${(questionSize / 1024).toFixed(2)} KB`);
      console.log(`Total Questions Size: ${totalQuestionSize} MB`);
      
      // Check for large fields
      console.log('\n🔍 Large Fields Analysis:');
      const largeFields = [];
      if (sampleQuestion.solution && sampleQuestion.solution.length > 500) {
        largeFields.push(`solution: ${(sampleQuestion.solution.length / 1024).toFixed(2)} KB`);
      }
      if (sampleQuestion.explanation && sampleQuestion.explanation.length > 500) {
        largeFields.push(`explanation: ${(sampleQuestion.explanation.length / 1024).toFixed(2)} KB`);
      }
      if (sampleQuestion.hints && sampleQuestion.hints.length > 0) {
        largeFields.push(`hints: ${JSON.stringify(sampleQuestion.hints).length} bytes`);
      }
      if (largeFields.length > 0) {
        console.log('Large fields found:', largeFields.join(', '));
      } else {
        console.log('No unusually large fields found');
      }
      
      // Analyze other collections
      console.log('\n👥 USERS COLLECTION:');
      const totalUsers = await AppUser.countDocuments();
      console.log(`Total Users: ${totalUsers}`);
      
      console.log('\n📊 TEST SESSIONS:');
      const totalSessions = await TestSession.countDocuments();
      console.log(`Total Test Sessions: ${totalSessions}`);
      
      console.log('\n📚 MODULES:');
      const totalModules = await Module.countDocuments();
      console.log(`Total Modules: ${totalModules}`);
      
      // Storage optimization recommendations
      console.log('\n💡 STORAGE OPTIMIZATION RECOMMENDATIONS:');
      console.log('=====================================');
      
      if (totalQuestions > 100) {
        console.log('⚠️  You have many questions - consider archiving old ones');
      }
      
      if (questionSize > 5) { // > 5KB per question
        console.log('⚠️  Questions are large - consider optimizing text fields');
      }
      
      console.log('✅ Keep only essential fields in questions');
      console.log('✅ Archive old test sessions regularly');
      console.log('✅ Use text compression for long solutions');
      
      // Free tier limits
      console.log('\n📋 FREE TIER LIMITS:');
      console.log('==================');
      console.log('MongoDB Atlas Free Tier: 512MB storage');
      console.log('Current Usage: ~' + totalQuestionSize + ' MB (questions only)');
      
      if (parseFloat(totalQuestionSize) > 400) {
        console.log('🚨 WARNING: Approaching free tier limit!');
        console.log('💡 Consider upgrading or optimizing storage');
      } else {
        console.log('✅ Storage usage is within free tier limits');
      }
      
      console.log('\n✅ Storage analysis completed!');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error analyzing storage:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }); 