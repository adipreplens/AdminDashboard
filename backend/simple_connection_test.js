#!/usr/bin/env node

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      console.log('\n🔍 Testing Database Performance...');
      
      const Question = mongoose.model('Question', new mongoose.Schema({}));
      
      // Test 1: Simple count query
      console.log('\n📊 Test 1: Simple Count Query');
      const startTime1 = Date.now();
      const totalCount = await Question.countDocuments();
      const time1 = Date.now() - startTime1;
      console.log(`Total Questions: ${totalCount} (${time1}ms)`);
      
      // Test 2: Filtered query with index
      console.log('\n📊 Test 2: Filtered Query (with index)');
      const startTime2 = Date.now();
      const rrbCount = await Question.countDocuments({ exam: 'rrb-je' });
      const time2 = Date.now() - startTime2;
      console.log(`RRB JE Questions: ${rrbCount} (${time2}ms)`);
      
      // Test 3: Complex query
      console.log('\n📊 Test 3: Complex Query (multiple filters)');
      const startTime3 = Date.now();
      const complexCount = await Question.countDocuments({ 
        exam: 'rrb-je', 
        subject: 'civil-engineering',
        publishStatus: 'published'
      });
      const time3 = Date.now() - startTime3;
      console.log(`Complex Filter Result: ${complexCount} (${time3}ms)`);
      
      // Performance analysis
      console.log('\n📈 Performance Analysis:');
      console.log('========================');
      
      if (time1 < 100 && time2 < 100 && time3 < 100) {
        console.log('✅ Excellent performance! All queries under 100ms');
      } else if (time1 < 500 && time2 < 500 && time3 < 500) {
        console.log('⚠️  Good performance! All queries under 500ms');
      } else {
        console.log('🚨 Some queries are slow - indexes are working but could be optimized');
      }
      
      // Connection info
      console.log('\n🔗 Connection Information:');
      console.log('==========================');
      console.log('Database:', mongoose.connection.name);
      console.log('Host:', mongoose.connection.host);
      console.log('Port:', mongoose.connection.port);
      console.log('Ready State:', mongoose.connection.readyState);
      
      console.log('\n✅ Performance test completed!');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error during performance test:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }); 