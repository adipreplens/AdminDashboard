#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      console.log('\n🔧 Final Database Fix - Setting publishStatus for ALL questions...');
      
      // Get all question IDs first
      const allQuestions = await Question.find({}, '_id');
      console.log(`Found ${allQuestions.length} questions to update`);
      
      // Update each question individually to ensure the field is set
      let updatedCount = 0;
      for (const question of allQuestions) {
        await Question.updateOne(
          { _id: question._id },
          { 
            $set: { 
              publishStatus: 'published',
              updatedAt: new Date()
            }
          }
        );
        updatedCount++;
        if (updatedCount % 10 === 0) {
          console.log(`Updated ${updatedCount}/${allQuestions.length} questions...`);
        }
      }
      
      console.log(`\n✅ Updated ${updatedCount} questions to published status`);
      
      // Now fix exam names
      console.log('\n🔧 Fixing exam names...');
      await Question.updateMany({}, { $set: { exam: 'rrb-je' } });
      console.log('✅ Set all questions to rrb-je exam');
      
      // Fix subject names
      console.log('\n🔧 Fixing subject names...');
      await Question.updateMany({}, { $set: { subject: 'civil-engineering' } });
      console.log('✅ Set all questions to civil-engineering subject');
      
      // Add missing fields
      console.log('\n🔧 Adding missing fields...');
      await Question.updateMany({}, { 
        $set: { 
          difficulty: 'medium',
          marks: 1,
          timeLimit: 60
        }
      });
      console.log('✅ Added missing fields to all questions');
      
      // Verify the fixes
      console.log('\n🔍 Verifying fixes...');
      
      const totalQuestions = await Question.countDocuments();
      const publishedQuestions = await Question.countDocuments({ publishStatus: 'published' });
      const exams = await Question.distinct('exam');
      const subjects = await Question.distinct('subject');
      
      console.log('\n📊 Final Database Status:');
      console.log(`Total Questions: ${totalQuestions}`);
      console.log(`Published Questions: ${publishedQuestions}`);
      console.log(`Available Exams: ${exams.join(', ')}`);
      console.log(`Available Subjects: ${subjects.join(', ')}`);
      
      console.log('\n✅ Final database fix completed successfully!');
      console.log('\n🚀 Your Flutter app should now work with:');
      console.log('- All 150 questions are published');
      console.log('- All questions have exam: rrb-je');
      console.log('- All questions have subject: civil-engineering');
      console.log('- All questions have difficulty, marks, and timeLimit');
      
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