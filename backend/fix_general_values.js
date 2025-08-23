#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔍 Finding questions with "general" values...');
      
      // Find all questions with "general" subject
      const generalSubjectQuestions = await Question.find({ subject: 'general' });
      console.log(`Found ${generalSubjectQuestions.length} questions with subject "general"`);
      
      // Update each question individually
      let updatedCount = 0;
      for (const question of generalSubjectQuestions) {
        await Question.findByIdAndUpdate(question._id, { subject: 'civil-engineering' });
        updatedCount++;
        console.log(`Updated question ${updatedCount}: ${question._id}`);
      }
      
      // Find all questions with "general" exam
      const generalExamQuestions = await Question.find({ exam: 'general' });
      console.log(`Found ${generalExamQuestions.length} questions with exam "general"`);
      
      // Update each question individually
      for (const question of generalExamQuestions) {
        await Question.findByIdAndUpdate(question._id, { exam: 'rrb-je' });
        updatedCount++;
        console.log(`Updated question ${updatedCount}: ${question._id}`);
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