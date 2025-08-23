#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔍 Looking for Manually Uploaded Questions...');
      
      // Look for questions with different characteristics that might indicate manual upload
      const manualQuestions = await Question.find({
        $or: [
          // Questions with detailed solutions (common in manual uploads)
          { solution: { $exists: true, $ne: "" } },
          // Questions with specific tags that might indicate manual categorization
          { tags: { $exists: true, $ne: [] } },
          // Questions with different subjects (not just civil-engineering)
          { subject: { $ne: "civil-engineering" } },
          // Questions with math formulas
          { questionMath: { $exists: true, $ne: "" } },
          { solutionMath: { $exists: true, $ne: "" } },
          // Questions with images
          { imageUrl: { $exists: true, $ne: null } },
          // Questions with different exam types
          { exam: { $nin: ["rrb-je"] } }
        ]
      }).limit(10);
      
      console.log(`\n📊 Found ${manualQuestions.length} potential manual questions:`);
      
      manualQuestions.forEach((q, index) => {
        const qObj = q.toObject();
        console.log(`\n--- Manual Question ${index + 1} ---`);
        console.log('ID:', qObj._id);
        console.log('Text:', qObj.text?.substring(0, 150) + '...');
        console.log('Subject:', qObj.subject);
        console.log('Exam:', qObj.exam);
        console.log('Difficulty:', qObj.difficulty);
        console.log('Tags:', qObj.tags);
        console.log('Solution:', qObj.solution?.substring(0, 100) + '...');
        console.log('Question Math:', qObj.questionMath);
        console.log('Solution Math:', qObj.solutionMath);
        console.log('Image URL:', qObj.imageUrl);
        console.log('Created At:', qObj.createdAt);
        console.log('Publish Status:', qObj.publishStatus);
      });
      
      // Also check for questions with different creation patterns
      console.log('\n🔍 Questions with Different Creation Patterns:');
      const recentQuestions = await Question.find().sort({ createdAt: -1 }).limit(5);
      
      recentQuestions.forEach((q, index) => {
        const qObj = q.toObject();
        console.log(`\n--- Recent Question ${index + 1} ---`);
        console.log('Created:', qObj.createdAt);
        console.log('Text:', qObj.text?.substring(0, 100) + '...');
        console.log('Subject:', qObj.subject);
        console.log('Exam:', qObj.exam);
        console.log('Has Solution:', !!qObj.solution);
        console.log('Has Math:', !!(qObj.questionMath || qObj.solutionMath));
        console.log('Has Image:', !!qObj.imageUrl);
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