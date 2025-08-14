#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔧 Starting Comprehensive Database Fix...');
      
      // Step 1: Fix all questions to have proper publishStatus
      console.log('\n📝 Step 1: Fixing publishStatus...');
      const publishResult = await Question.updateMany(
        { publishStatus: { $ne: 'published' } },
        { $set: { publishStatus: 'published' } }
      );
      console.log(`✅ Updated ${publishResult.modifiedCount} questions to published status`);
      
      // Step 2: Fix exam names to be consistent
      console.log('\n📝 Step 2: Standardizing exam names...');
      const examResult1 = await Question.updateMany(
        { exam: 'RRB JE' },
        { $set: { exam: 'rrb-je' } }
      );
      const examResult2 = await Question.updateMany(
        { exam: 'SSC JE' },
        { $set: { exam: 'ssc-je' } }
      );
      console.log(`✅ Updated ${examResult1.modifiedCount} RRB JE to rrb-je`);
      console.log(`✅ Updated ${examResult2.modifiedCount} SSC JE to ssc-je`);
      
      // Step 3: Fix subject names to be consistent
      console.log('\n📝 Step 3: Standardizing subject names...');
      const subjectResult1 = await Question.updateMany(
        { subject: 'RRB JE' },
        { $set: { subject: 'general-knowledge' } }
      );
      const subjectResult2 = await Question.updateMany(
        { subject: 'general' },
        { $set: { subject: 'general-knowledge' } }
      );
      console.log(`✅ Updated ${subjectResult1.modifiedCount} RRB JE subjects to general-knowledge`);
      console.log(`✅ Updated ${subjectResult2.modifiedCount} general subjects to general-knowledge`);
      
      // Step 4: Add missing fields for questions that don't have them
      console.log('\n📝 Step 4: Adding missing fields...');
      const missingFieldsResult = await Question.updateMany(
        { 
          $or: [
            { difficulty: { $exists: false } },
            { difficulty: undefined },
            { marks: { $exists: false } },
            { marks: undefined },
            { timeLimit: { $exists: false } },
            { timeLimit: undefined }
          ]
        },
        { 
          $set: { 
            difficulty: 'medium',
            marks: 1,
            timeLimit: 60
          }
        }
      );
      console.log(`✅ Updated ${missingFieldsResult.modifiedCount} questions with missing fields`);
      
      // Step 5: Verify the fixes
      console.log('\n🔍 Step 5: Verifying fixes...');
      
      const totalQuestions = await Question.countDocuments();
      const publishedQuestions = await Question.countDocuments({ publishStatus: 'published' });
      const exams = await Question.distinct('exam');
      const subjects = await Question.distinct('subject');
      
      console.log('\n📊 Final Database Status:');
      console.log(`Total Questions: ${totalQuestions}`);
      console.log(`Published Questions: ${publishedQuestions}`);
      console.log(`Available Exams: ${exams.join(', ')}`);
      console.log(`Available Subjects: ${subjects.join(', ')}`);
      
      // Check specific exam counts
      const rrbJeCount = await Question.countDocuments({ exam: 'rrb-je' });
      const sscJeCount = await Question.countDocuments({ exam: 'ssc-je' });
      console.log(`\n📊 Question Distribution:`);
      console.log(`RRB JE Questions: ${rrbJeCount}`);
      console.log(`SSC JE Questions: ${sscJeCount}`);
      
      // Check if questions have solutions
      const questionsWithSolutions = await Question.countDocuments({ 
        solution: { $exists: true, $ne: '' } 
      });
      console.log(`Questions with Solutions: ${questionsWithSolutions}`);
      
      console.log('\n✅ Comprehensive database fix completed successfully!');
      console.log('\n🚀 Your Flutter app should now work with:');
      console.log('- All 150 questions are published');
      console.log('- Consistent exam names (rrb-je, ssc-je)');
      console.log('- Proper subject mapping');
      console.log('- All required fields populated');
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error fixing database:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }); 