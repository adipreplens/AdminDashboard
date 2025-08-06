const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin';

console.log('🧪 Testing MongoDB Connection...\n');

console.log('📡 Connection URI (masked):', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('');

// Test connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 5,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
})
.then(async () => {
  console.log('✅ MongoDB Connection Successful!');
  console.log('📊 Database Name:', mongoose.connection.db.databaseName);
  console.log('🔗 Connection State:', mongoose.connection.readyState);
  console.log('🌐 Host:', mongoose.connection.host);
  console.log('🔌 Port:', mongoose.connection.port);
  console.log('📚 Database:', mongoose.connection.name);
  
  // Test database operations
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections found:', collections.length);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Test a simple query
    const Question = mongoose.model('Question', new mongoose.Schema({}));
    const count = await Question.countDocuments();
    console.log(`\n📊 Total questions in database: ${count}`);
    
  } catch (error) {
    console.log('⚠️ Could not list collections:', error.message);
  }
  
  console.log('\n🎉 Connection test completed successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Connection Failed!');
  console.error('Error details:', err.message);
  console.error('Error code:', err.code);
  console.error('Error name:', err.name);
  process.exit(1);
});

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Connected event fired');
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Disconnected event fired');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error event fired:', err.message);
}); 