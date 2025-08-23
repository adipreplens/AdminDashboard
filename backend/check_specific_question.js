#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔍 Checking the remaining question with "general" subject...');
      
      // Find the specific question
      const question = await Question.findOne({ subject: 'general' });
      if (question) {
        const qObj = question.toObject();
        console.log('\n📋 Question Details:');
        console.log('ID:', qObj._id);
        console.log('Text:', qObj.text);
        console.log('Subject:', qObj.subject);
        console.log('Exam:', qObj.exam);
        console.log('Created At:', qObj.createdAt);
        
        // Try to update it directly
        console.log('\n🔄 Updating this specific question...');
        const updateResult = await Question.updateOne(
          { _id: qObj._id },
          { subject: 'civil-engineering' }
        );
        console.log('Update result:', updateResult);
        
        // Verify the update
        const updatedQuestion = await Question.findById(qObj._id);
        console.log('\n✅ After update:');
        console.log('Subject:', updatedQuestion.subject);
        
      } else {
        console.log('No questions with "general" subject found!');
      }
      
      // Final verification
      console.log('\n🔍 Final verification:');
      const remainingGeneralSubject = await Question.countDocuments({ subject: 'general' });
      const remainingGeneralExam = await Question.countDocuments({ exam: 'general' });
      
      console.log(`Questions with subject "general": ${remainingGeneralSubject}`);
      console.log(`Questions with exam "general": ${remainingGeneralExam}`);
      
      if (remainingGeneralSubject === 0 && remainingGeneralExam === 0) {
        console.log('\n🎉 All "general" values have been cleaned up!');
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