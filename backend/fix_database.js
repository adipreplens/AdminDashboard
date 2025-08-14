#!/usr/bin/env node

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Fix 1: Publish all draft questions
      console.log('\n🔧 Fixing Question Publish Status...');
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      const updateResult = await Question.updateMany(
        { publishStatus: 'draft' },
        { 
          $set: { 
            publishStatus: 'published',
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Published ${updateResult.modifiedCount} questions`);
      
      // Fix 2: Standardize exam names
      console.log('\n🔧 Standardizing Exam Names...');
      
      await Question.updateMany(
        { exam: 'RRB JE' },
        { $set: { exam: 'rrb-je' } }
      );
      
      await Question.updateMany(
        { exam: 'SSC JE' },
        { $set: { exam: 'ssc-je' } }
      );
      
      console.log('✅ Standardized exam names');
      
      // Fix 3: Standardize subject names
      console.log('\n🔧 Standardizing Subject Names...');
      
      await Question.updateMany(
        { subject: 'RRB JE' },
        { $set: { subject: 'general-knowledge' } }
      );
      
      await Question.updateMany(
        { subject: 'general' },
        { $set: { subject: 'general-knowledge' } }
      );
      
      console.log('✅ Standardized subject names');
      
      // Fix 4: Add missing subjects for RRB JE
      console.log('\n🔧 Adding Missing Subjects for RRB JE...');
      
      // Update civil engineering questions to have proper subject
      await Question.updateMany(
        { 
          subject: 'civil-engineering',
          exam: 'rrb-je'
        },
        { $set: { subject: 'civil-engineering' } }
      );
      
      console.log('✅ Added missing subjects');
      
      // Verify the fixes
      console.log('\n🔍 Verifying Fixes...');
      
      const totalQuestions = await Question.countDocuments();
      const publishedQuestions = await Question.countDocuments({ publishStatus: 'published' });
      const exams = await Question.distinct('exam');
      const subjects = await Question.distinct('subject');
      
      console.log(`\n📊 Final Status:`);
      console.log(`Total Questions: ${totalQuestions}`);
      console.log(`Published Questions: ${publishedQuestions}`);
      console.log(`Available Exams: ${exams.join(', ')}`);
      console.log(`Available Subjects: ${subjects.join(', ')}`);
      
      console.log('\n✅ Database fixes completed successfully!');
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