#!/usr/bin/env node

const mongoose = require('mongoose');

// Test connection with optimized settings
const connectWithOptimization = async () => {
  try {
    console.log('🔧 Testing Optimized MongoDB Connection...');
    
    const connection = await mongoose.connect('mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin', {
      // Connection pool settings
      maxPoolSize: 10,           // Limit max connections
      minPoolSize: 1,            // Keep at least 1 connection
      maxIdleTimeMS: 30000,      // Close idle connections after 30 seconds
      serverSelectionTimeoutMS: 5000,  // Timeout for server selection
      socketTimeoutMS: 45000,    // Socket timeout
      bufferMaxEntries: 0,       // Disable mongoose buffering
      bufferCommands: false      // Disable mongoose buffering
    });
    
    console.log('✅ Connected with optimized settings');
    
    // Test a simple query
    const Question = mongoose.model('Question', new mongoose.Schema({}));
    const startTime = Date.now();
    const count = await Question.countDocuments({ exam: 'rrb-je' });
    const queryTime = Date.now() - startTime;
    
    console.log(`\n📊 Performance Test:`);
    console.log(`RRB JE Questions: ${count}`);
    console.log(`Query Time: ${queryTime}ms`);
    
    if (queryTime < 100) {
      console.log('✅ Query performance is excellent!');
    } else if (queryTime < 500) {
      console.log('⚠️  Query performance is acceptable');
    } else {
      console.log('🚨 Query performance is slow - check indexes');
    }
    
    // Check connection pool status
    const poolStatus = connection.connection.db.admin().command({ serverStatus: 1 });
    console.log('\n🔍 Connection Pool Status:');
    console.log('Active Connections:', connection.connection.db.serverConfig.s.pool.size);
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
};

// Run the test
connectWithOptimization(); 