# 🗑️ Database Clear Guide

## 🎯 **Different Ways to Clear Your Database**

### **Option 1: Clear All Questions (Recommended)**
This keeps the database structure but removes all question data.

```bash
# Method 1: Using the API endpoint
curl -X DELETE http://localhost:5001/questions/clear-all

# Method 2: Using MongoDB directly
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    const Question = mongoose.model('Question', new mongoose.Schema({}));
    await Question.deleteMany({});
    console.log('✅ All questions cleared from database');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
"
```

### **Option 2: Clear Everything (Database Reset)**
This removes all data including users, questions, etc.

```bash
# Method 1: Using MongoDB directly
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (let collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
    }
    console.log('✅ Database completely cleared');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
"
```

### **Option 3: Clear Specific Data**
Clear only specific types of data.

```bash
# Clear only questions
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    const Question = mongoose.model('Question', new mongoose.Schema({}));
    await Question.deleteMany({});
    console.log('✅ Questions cleared');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
"

# Clear only users
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    const User = mongoose.model('User', new mongoose.Schema({}));
    await User.deleteMany({});
    console.log('✅ Users cleared');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
"
```

### **Option 4: Clear Local Uploads**
Clear uploaded files from local storage.

```bash
# Clear local uploads
cd backend
rm -rf uploads/*
echo "✅ Local uploads cleared"
```

### **Option 5: Clear S3 Files**
Clear files from S3 bucket (BE CAREFUL!).

```bash
# Clear S3 files (DANGEROUS - will delete all files)
cd backend
node -e "
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

async function clearS3() {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME
    };
    
    const objects = await s3.listObjectsV2(params).promise();
    
    if (objects.Contents.length > 0) {
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
          Objects: objects.Contents.map(obj => ({ Key: obj.Key }))
        }
      };
      
      await s3.deleteObjects(deleteParams).promise();
      console.log('✅ S3 files cleared');
    } else {
      console.log('ℹ️ S3 bucket is already empty');
    }
  } catch (error) {
    console.error('❌ Error clearing S3:', error);
  }
  process.exit(0);
}

clearS3();
"
```

## 🚨 **WARNING: Be Careful!**

- **Option 1** is safe - only clears questions
- **Option 2** is dangerous - clears everything
- **Option 5** is very dangerous - deletes all S3 files

## 🎯 **Recommended Approach**

For most cases, use **Option 1** to clear only questions:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin')
  .then(async () => {
    const Question = mongoose.model('Question', new mongoose.Schema({}));
    const result = await Question.deleteMany({});
    console.log('✅ Cleared', result.deletedCount, 'questions from database');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
"
```

## ✅ **After Clearing**

1. **Restart your servers** if needed
2. **Check the application** at http://localhost:3000
3. **Verify the database is empty**

**Choose the option that best fits your needs!** 🗑️ 