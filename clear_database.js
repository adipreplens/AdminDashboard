#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🗑️ Database Clear Tool');
console.log('=======================\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Get command line argument
    const option = process.argv[2] || 'questions';
    
    try {
      switch (option) {
        case 'questions':
          // Clear only questions
          const Question = mongoose.model('Question', new mongoose.Schema({}));
          const result = await Question.deleteMany({});
          console.log(`✅ Cleared ${result.deletedCount} questions from database`);
          break;
          
        case 'users':
          // Clear only users
          const User = mongoose.model('User', new mongoose.Schema({}));
          const userResult = await User.deleteMany({});
          console.log(`✅ Cleared ${userResult.deletedCount} users from database`);
          break;
          
        case 'all':
          // Clear everything
          const collections = await mongoose.connection.db.listCollections().toArray();
          for (let collection of collections) {
            await mongoose.connection.db.dropCollection(collection.name);
          }
          console.log('✅ Database completely cleared');
          break;
          
        default:
          console.log('❌ Invalid option. Use: questions, users, or all');
          console.log('Example: node clear_database.js questions');
          process.exit(1);
      }
      
      console.log('\n✅ Database clear completed successfully!');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }); 