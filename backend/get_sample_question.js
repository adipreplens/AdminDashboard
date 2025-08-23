#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔍 Sample Question Details:');
      const sampleQuestion = await Question.findOne();
      if(sampleQuestion) {
        const questionObj = sampleQuestion.toObject();
        
        console.log('\n📋 Question Structure:');
        console.log('ID:', questionObj._id);
        console.log('Text:', questionObj.text);
        console.log('Options:', questionObj.options);
        console.log('Answer:', questionObj.answer);
        console.log('Subject:', questionObj.subject);
        console.log('Exam:', questionObj.exam);
        console.log('Difficulty:', questionObj.difficulty);
        console.log('Marks:', questionObj.marks);
        console.log('Time Limit:', questionObj.timeLimit);
        console.log('Blooms:', questionObj.blooms);
        console.log('Tags:', questionObj.tags);
        console.log('Solution:', questionObj.solution);
        console.log('Publish Status:', questionObj.publishStatus);
        console.log('Created At:', questionObj.createdAt);
        console.log('Updated At:', questionObj.updatedAt);
        console.log('Category:', questionObj.category);
        console.log('Topic:', questionObj.topic);
        console.log('Question Math:', questionObj.questionMath);
        console.log('Solution Math:', questionObj.solutionMath);
        
        // Show all available fields
        console.log('\n📊 All Available Fields:');
        console.log(Object.keys(questionObj));
        
        // Show a few more questions for variety
        console.log('\n🔍 More Sample Questions:');
        const moreQuestions = await Question.find().limit(3);
        moreQuestions.forEach((q, index) => {
          const qObj = q.toObject();
          console.log(`\n--- Question ${index + 1} ---`);
          console.log('Text:', qObj.text?.substring(0, 100) + '...');
          console.log('Subject:', qObj.subject);
          console.log('Exam:', qObj.exam);
          console.log('Difficulty:', qObj.difficulty);
          console.log('Tags:', qObj.tags);
        });
      } else {
        console.log('No questions found in database');
      }
      
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