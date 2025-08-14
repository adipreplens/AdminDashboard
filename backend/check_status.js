#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      const totalQuestions = await Question.countDocuments();
      const publishedQuestions = await Question.countDocuments({ publishStatus: 'published' });
      const draftQuestions = await Question.countDocuments({ publishStatus: 'draft' });
      
      console.log('\n📊 Question Status:');
      console.log('Total Questions:', totalQuestions);
      console.log('Published Questions:', publishedQuestions);
      console.log('Draft Questions:', draftQuestions);
      
      console.log('\n🔍 Sample Published Question:');
      const samplePublished = await Question.findOne({ publishStatus: 'published' });
      if(samplePublished) {
        console.log('ID:', samplePublished._id);
        console.log('Status:', samplePublished.publishStatus);
        console.log('Exam:', samplePublished.exam);
        console.log('Subject:', samplePublished.subject);
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