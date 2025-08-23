#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔍 Checking for "general" values...');
      
      // Check questions with "general" subject
      const generalSubjectQuestions = await Question.find({ subject: 'general' });
      console.log(`\n📊 Questions with subject "general": ${generalSubjectQuestions.length}`);
      
      if (generalSubjectQuestions.length > 0) {
        console.log('\n--- Sample Questions with "general" subject ---');
        generalSubjectQuestions.slice(0, 3).forEach((q, index) => {
          const qObj = q.toObject();
          console.log(`\nQuestion ${index + 1}:`);
          console.log('Text:', qObj.text?.substring(0, 100) + '...');
          console.log('Subject:', qObj.subject);
          console.log('Exam:', qObj.exam);
          console.log('Created At:', qObj.createdAt);
        });
      }
      
      // Check questions with "general" exam
      const generalExamQuestions = await Question.find({ exam: 'general' });
      console.log(`\n📊 Questions with exam "general": ${generalExamQuestions.length}`);
      
      if (generalExamQuestions.length > 0) {
        console.log('\n--- Sample Questions with "general" exam ---');
        generalExamQuestions.slice(0, 3).forEach((q, index) => {
          const qObj = q.toObject();
          console.log(`\nQuestion ${index + 1}:`);
          console.log('Text:', qObj.text?.substring(0, 100) + '...');
          console.log('Subject:', qObj.subject);
          console.log('Exam:', qObj.exam);
          console.log('Created At:', qObj.createdAt);
        });
      }
      
      // Check recent questions to see the pattern
      console.log('\n🔍 Recent Questions Analysis:');
      const recentQuestions = await Question.find().sort({ createdAt: -1 }).limit(10);
      
      recentQuestions.forEach((q, index) => {
        const qObj = q.toObject();
        console.log(`\n--- Recent Question ${index + 1} ---`);
        console.log('Subject:', qObj.subject);
        console.log('Exam:', qObj.exam);
        console.log('Created:', qObj.createdAt);
        console.log('Text Preview:', qObj.text?.substring(0, 80) + '...');
      });
      
      process.exit(0);
    } catch(err) {
      console.error('Error:', err);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 