#!/usr/bin/env node

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      // Fix 1: Set publishStatus for all questions that don't have it
      console.log('\n🔧 Fixing Question Publish Status...');
      
      const updateResult = await Question.updateMany(
        { 
          $or: [
            { publishStatus: { $exists: false } },
            { publishStatus: undefined },
            { publishStatus: 'draft' }
          ]
        },
        { 
          $set: { 
            publishStatus: 'published',
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} questions to published status`);
      
      // Fix 2: Standardize exam names
      console.log('\n🔧 Standardizing Exam Names...');
      
      const examUpdate1 = await Question.updateMany(
        { exam: 'RRB JE' },
        { $set: { exam: 'rrb-je' } }
      );
      console.log(`Updated ${examUpdate1.modifiedCount} RRB JE exam names`);
      
      const examUpdate2 = await Question.updateMany(
        { exam: 'SSC JE' },
        { $set: { exam: 'ssc-je' } }
      );
      console.log(`Updated ${examUpdate2.modifiedCount} SSC JE exam names`);
      
      // Fix 3: Standardize subject names
      console.log('\n🔧 Standardizing Subject Names...');
      
      const subjectUpdate1 = await Question.updateMany(
        { subject: 'RRB JE' },
        { $set: { subject: 'general-knowledge' } }
      );
      console.log(`Updated ${subjectUpdate1.modifiedCount} RRB JE subjects to general-knowledge`);
      
      const subjectUpdate2 = await Question.updateMany(
        { subject: 'general' },
        { $set: { subject: 'general-knowledge' } }
      );
      console.log(`Updated ${subjectUpdate2.modifiedCount} general subjects to general-knowledge`);
      
      // Fix 4: Add proper subject mapping for civil engineering
      console.log('\n🔧 Adding Civil Engineering Subject...');
      
      const civilUpdate = await Question.updateMany(
        { 
          subject: 'civil-engineering',
          exam: { $in: ['rrb-je', 'RRB JE'] }
        },
        { $set: { subject: 'civil-engineering' } }
      );
      console.log(`Updated ${civilUpdate.modifiedCount} civil engineering questions`);
      
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
      
      // Check specific exam counts
      console.log('\n📊 Question Distribution by Exam:');
      const rrbJeCount = await Question.countDocuments({ exam: 'rrb-je' });
      const sscJeCount = await Question.countDocuments({ exam: 'ssc-je' });
      console.log(`RRB JE Questions: ${rrbJeCount}`);
      console.log(`SSC JE Questions: ${sscJeCount}`);
      
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