#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔍 Looking for Truly Manual Questions...');
      
      // Look for questions with unique characteristics that indicate manual upload
      const uniqueQuestions = await Question.find({
        $or: [
          // Questions with different subjects (not civil-engineering)
          { subject: { $nin: ["civil-engineering", "general"] } },
          // Questions with math formulas
          { questionMath: { $exists: true, $ne: "" } },
          { solutionMath: { $exists: true, $ne: "" } },
          // Questions with images
          { imageUrl: { $exists: true, $ne: null } },
          // Questions with different exam types
          { exam: { $nin: ["rrb-je", "SSC JE 2022", "ssc-je"] } },
          // Questions with very detailed solutions (manual characteristic)
          { solution: { $regex: /.{200,}/ } },
          // Questions with unique tags
          { tags: { $elemMatch: { $nin: ["level 0", "level 1", "Building Materials", "SSC JE 2022", "building-materials"] } } }
        ]
      }).limit(10);
      
      console.log(`\n📊 Found ${uniqueQuestions.length} unique questions:`);
      
      uniqueQuestions.forEach((q, index) => {
        const qObj = q.toObject();
        console.log(`\n--- Unique Question ${index + 1} ---`);
        console.log('ID:', qObj._id);
        console.log('Text:', qObj.text?.substring(0, 150) + '...');
        console.log('Subject:', qObj.subject);
        console.log('Exam:', qObj.exam);
        console.log('Difficulty:', qObj.difficulty);
        console.log('Tags:', qObj.tags);
        console.log('Solution Length:', qObj.solution?.length || 0);
        console.log('Question Math:', qObj.questionMath);
        console.log('Solution Math:', qObj.solutionMath);
        console.log('Image URL:', qObj.imageUrl);
        console.log('Created At:', qObj.createdAt);
        console.log('Publish Status:', qObj.publishStatus);
      });
      
      // Check for questions with different subjects
      console.log('\n🔍 Questions by Subject:');
      const subjects = await Question.distinct('subject');
      console.log('Available subjects:', subjects);
      
      // Check for questions with different exams
      console.log('\n🔍 Questions by Exam:');
      const exams = await Question.distinct('exam');
      console.log('Available exams:', exams);
      
      // Look for questions with math formulas
      console.log('\n🔍 Questions with Math Formulas:');
      const mathQuestions = await Question.find({
        $or: [
          { questionMath: { $exists: true, $ne: "" } },
          { solutionMath: { $exists: true, $ne: "" } }
        ]
      });
      console.log(`Found ${mathQuestions.length} questions with math formulas`);
      
      // Look for questions with images
      console.log('\n🔍 Questions with Images:');
      const imageQuestions = await Question.find({
        imageUrl: { $exists: true, $ne: null }
      });
      console.log(`Found ${imageQuestions.length} questions with images`);
      
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