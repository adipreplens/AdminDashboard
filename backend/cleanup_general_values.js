#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔍 Finding questions with "general" values...');
      
      // Find questions with "general" subject
      const generalSubjectQuestions = await Question.find({ subject: 'general' });
      console.log(`Found ${generalSubjectQuestions.length} questions with subject "general"`);
      
      // Find questions with "general" exam
      const generalExamQuestions = await Question.find({ exam: 'general' });
      console.log(`Found ${generalExamQuestions.length} questions with exam "general"`);
      
      // Update questions with "general" subject to "civil-engineering"
      if (generalSubjectQuestions.length > 0) {
        console.log('\n🔄 Updating questions with "general" subject...');
        const updateResult = await Question.updateMany(
          { subject: 'general' },
          { subject: 'civil-engineering' }
        );
        console.log(`Updated ${updateResult.modifiedCount} questions`);
      }
      
      // Update questions with "general" exam to "rrb-je"
      if (generalExamQuestions.length > 0) {
        console.log('\n🔄 Updating questions with "general" exam...');
        const updateResult = await Question.updateMany(
          { exam: 'general' },
          { exam: 'rrb-je' }
        );
        console.log(`Updated ${updateResult.modifiedCount} questions`);
      }
      
      // Verify the changes
      console.log('\n✅ Verification:');
      const remainingGeneralSubject = await Question.countDocuments({ subject: 'general' });
      const remainingGeneralExam = await Question.countDocuments({ exam: 'general' });
      
      console.log(`Questions with subject "general": ${remainingGeneralSubject}`);
      console.log(`Questions with exam "general": ${remainingGeneralExam}`);
      
      if (remainingGeneralSubject === 0 && remainingGeneralExam === 0) {
        console.log('\n🎉 All "general" values have been cleaned up!');
      } else {
        console.log('\n⚠️ Some "general" values still remain.');
      }
      
      // Show sample of updated questions
      console.log('\n📋 Sample of updated questions:');
      const sampleQuestions = await Question.find().limit(3);
      sampleQuestions.forEach((q, index) => {
        const qObj = q.toObject();
        console.log(`\nQuestion ${index + 1}:`);
        console.log('Subject:', qObj.subject);
        console.log('Exam:', qObj.exam);
        console.log('Text:', qObj.text?.substring(0, 80) + '...');
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