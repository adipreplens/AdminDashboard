const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const XLSX = require('xlsx');
const S3Service = require('./s3Service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://preplensdashboard.netlify.app',
    'https://preplensadmin.netlify.app',
    'https://preplensadmin.vercel.app',
    'https://preplensadmin.pages.dev'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
  subject: { type: String, required: true },
  exam: { type: String, required: true },
  difficulty: { type: String, required: true },
  tags: [{ type: String }],
  marks: { type: Number, required: true },
  timeLimit: { type: Number, required: true },
  blooms: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Question = mongoose.model('Question', questionSchema);
const User = mongoose.model('User', userSchema);

// File upload configuration with cleanup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Add timestamp to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Cleanup old files function
const cleanupOldFiles = () => {
  const uploadDir = 'uploads/';
  if (fs.existsSync(uploadDir)) {
    fs.readdir(uploadDir, (err, files) => {
      if (err) return;
      
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours
      
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          
          // Delete files older than 24 hours
          if (now - stats.mtime.getTime() > oneDay) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error deleting old file:', err);
            });
          }
        });
      });
    });
  }
};

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PrepLens Admin API is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    s3: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not configured'
  });
});

// Statistics endpoint
app.get('/statistics', async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalExams = await Question.distinct('exam').then(exams => exams.length);
    const recentUploads = await Question.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalQuestions,
      totalUsers,
      totalExams,
      recentUploads
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all questions
app.get('/questions', async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, exam, difficulty, blooms, search } = req.query;
    
    let query = {};
    
    if (subject) query.subject = subject;
    if (exam) query.exam = exam;
    if (difficulty) query.difficulty = difficulty;
    if (blooms) query.blooms = blooms;
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create single question
app.post('/questions', async (req, res) => {
  try {
    const questionData = req.body;
    
    // Validate required fields
    const requiredFields = ['text', 'options', 'answer', 'subject', 'exam', 'difficulty', 'marks', 'timeLimit', 'blooms'];
    for (const field of requiredFields) {
      if (!questionData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const question = new Question(questionData);
    await question.save();

    res.status(201).json({ 
      message: 'Question created successfully',
      question 
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Delete question
app.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Delete associated image if exists
    if (question.imageUrl) {
      try {
        // Try to delete from S3 first
        const filename = question.imageUrl.split('/').pop();
        await S3Service.deleteFile(filename);
      } catch (error) {
        // Fallback to local file deletion
        const imagePath = path.join(__dirname, '..', question.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    await Question.findByIdAndDelete(id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Bulk upload endpoint
app.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    const fileName = req.file.originalname.toLowerCase();

    // Handle different file types
    if (fileName.endsWith('.csv')) {
      // Process CSV file
      let headers = [];
      let isFirstRow = true;
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          if (isFirstRow) {
            // Get headers from first row
            headers = Object.keys(data);
            isFirstRow = false;
          }
          
          try {
            const questionData = parseQuestionData(data, headers);
            results.push(questionData);
          } catch (error) {
            errors.push({ row: data, error: error.message });
          }
        })
        .on('end', async () => {
          await saveQuestions(results, errors, req.file.path, res);
        })
        .on('error', (error) => {
          console.error('Error processing CSV:', error);
          res.status(500).json({ error: 'Failed to process CSV file' });
        });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Process Excel file
      try {
        const workbook = XLSX.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          
          for (const row of data) {
            try {
              const questionData = parseQuestionData(row, headers);
              results.push(questionData);
            } catch (error) {
              errors.push({ row: row, error: error.message });
            }
          }
        }

        await saveQuestions(results, errors, req.file.path, res);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to process Excel file' });
      }
    } else {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Unsupported file format. Please upload CSV or Excel files.' });
    }

  } catch (error) {
    console.error('Error in bulk upload:', error);
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Helper function to save questions
async function saveQuestions(results, errors, filePath, res) {
  try {
    if (results.length > 0) {
      await Question.insertMany(results);
    }

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: 'Bulk upload completed',
      uploaded: results.length,
      successCount: results.length,
      errorCount: errors.length,
      errors: errors
    });
  } catch (error) {
    console.error('Error saving questions:', error);
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Failed to save questions' });
  }
}

// Smart data parser that adapts to different formats
function parseQuestionData(row, headers) {
  try {
    // Map common column names to our standard format
    const columnMapping = {
      // Question text variations
      'text': ['text', 'question', 'question_text', 'questiontext', 'question text', 'questiontext'],
      'question': ['text', 'question', 'question_text', 'questiontext', 'question text', 'questiontext'],
      'question_text': ['text', 'question', 'question_text', 'questiontext', 'question text', 'questiontext'],
      
      // Options variations - including individual option columns
      'options': ['options', 'option', 'choices', 'choice', 'option_a', 'option_b', 'option_c', 'option_d', 'optiona', 'optionb', 'optionc', 'optiond'],
      'choices': ['options', 'option', 'choices', 'choice', 'option_a', 'option_b', 'option_c', 'option_d', 'optiona', 'optionb', 'optionc', 'optiond'],
      'optiona': ['optiona', 'option_a', 'option a', 'a', 'choicea'],
      'optionb': ['optionb', 'option_b', 'option b', 'b', 'choiceb'],
      'optionc': ['optionc', 'option_c', 'option c', 'c', 'choicec'],
      'optiond': ['optiond', 'option_d', 'option d', 'd', 'choiced'],
      
      // Answer variations
      'answer': ['answer', 'correct_answer', 'correctanswer', 'correct answer', 'solution', 'key'],
      'correct_answer': ['answer', 'correct_answer', 'correctanswer', 'correct answer', 'solution', 'key'],
      
      // Subject variations
      'subject': ['subject', 'topic', 'category', 'subject_name', 'subjectname'],
      'topic': ['subject', 'topic', 'category', 'subject_name', 'subjectname'],
      
      // Exam variations
      'exam': ['exam', 'exam_type', 'examtype', 'exam type', 'test', 'test_type'],
      'exam_type': ['exam', 'exam_type', 'examtype', 'exam type', 'test', 'test_type'],
      
      // Difficulty variations
      'difficulty': ['difficulty', 'level', 'complexity', 'difficulty_level', 'difficultylevel'],
      'level': ['difficulty', 'level', 'complexity', 'difficulty_level', 'difficultylevel'],
      
      // Tags variations
      'tags': ['tags', 'tag', 'keywords', 'keyword', 'topics', 'topic'],
      'tag': ['tags', 'tag', 'keywords', 'keyword', 'topics', 'topic'],
      
      // Marks variations
      'marks': ['marks', 'mark', 'points', 'point', 'score', 'weight'],
      'points': ['marks', 'mark', 'points', 'point', 'score', 'weight'],
      
      // Time limit variations
      'timeLimit': ['timelimit', 'time_limit', 'time limit', 'duration', 'time', 'timeallowed'],
      'time_limit': ['timelimit', 'time_limit', 'time limit', 'duration', 'time', 'timeallowed'],
      
      // Bloom's taxonomy variations
      'blooms': ['blooms', 'bloom', 'bloomstaxonomy', 'bloom\'s', 'taxonomy', 'cognitive_level'],
      'bloom': ['blooms', 'bloom', 'bloomstaxonomy', 'bloom\'s', 'taxonomy', 'cognitive_level']
    };

    // Find the actual column names in the uploaded file
    const foundColumns = {};
    headers.forEach(header => {
      const headerLower = header.toLowerCase().trim();
      for (const [standardName, variations] of Object.entries(columnMapping)) {
        if (variations.some(variation => headerLower.includes(variation))) {
          foundColumns[standardName] = header;
          break;
        }
      }
    });

    // Extract data using found column names
    const questionData = {
      text: row[foundColumns.text] || row[foundColumns.question] || 'Question text not found',
      options: parseOptionsFromIndividualColumns(row, headers) || parseOptions(row[foundColumns.options] || row[foundColumns.choices]),
      answer: parseAnswerFromOptions(row[foundColumns.answer] || row[foundColumns.correct_answer], row, headers),
      subject: row[foundColumns.subject] || row[foundColumns.topic] || 'general',
      exam: row[foundColumns.exam] || row[foundColumns.exam_type] || 'general',
      difficulty: row[foundColumns.difficulty] || row[foundColumns.level] || 'medium',
      tags: parseTags(row[foundColumns.tags] || row[foundColumns.tag] || ''),
      marks: parseInt(row[foundColumns.marks] || row[foundColumns.points]) || 1,
      timeLimit: parseInt(row[foundColumns.timeLimit] || row[foundColumns.time_limit]) || 60,
      blooms: row[foundColumns.blooms] || row[foundColumns.bloom] || 'remember'
    };

    return questionData;
  } catch (error) {
    throw new Error(`Error parsing row: ${error.message}`);
  }
}

// Helper function to parse options from individual option columns (optionA, optionB, etc.)
function parseOptionsFromIndividualColumns(row, headers) {
  const optionColumns = [];
  
  // Look for individual option columns
  headers.forEach(header => {
    const headerLower = header.toLowerCase().trim();
    if (headerLower.includes('option') || headerLower.includes('choice')) {
      optionColumns.push(header);
    }
  });
  
  if (optionColumns.length > 0) {
    // Sort columns to maintain order (optionA, optionB, optionC, optionD)
    optionColumns.sort();
    
    const options = [];
    optionColumns.forEach(column => {
      if (row[column] && row[column].toString().trim()) {
        options.push(row[column].toString().trim());
      }
    });
    
    return options;
  }
  
  return null; // No individual option columns found
}

// Helper function to parse answer when it references option letters/names
function parseAnswerFromOptions(answerText, row, headers) {
  if (!answerText) return 'Answer not found';
  
  const answerStr = answerText.toString().toLowerCase().trim();
  
  // If answer is already the actual text, return it
  if (answerStr.length > 10) {
    return answerText.toString().trim();
  }
  
  // If answer references option letters (A, B, C, D)
  if (answerStr.includes('option') || answerStr.includes('choice')) {
    const optionColumns = [];
    headers.forEach(header => {
      const headerLower = header.toLowerCase().trim();
      if (headerLower.includes('option') || headerLower.includes('choice')) {
        optionColumns.push(header);
      }
    });
    
    if (optionColumns.length > 0) {
      optionColumns.sort();
      
      // Extract the option letter/number from answer
      let optionIndex = -1;
      if (answerStr.includes('a') || answerStr.includes('1')) optionIndex = 0;
      else if (answerStr.includes('b') || answerStr.includes('2')) optionIndex = 1;
      else if (answerStr.includes('c') || answerStr.includes('3')) optionIndex = 2;
      else if (answerStr.includes('d') || answerStr.includes('4')) optionIndex = 3;
      
      if (optionIndex >= 0 && optionIndex < optionColumns.length) {
        return row[optionColumns[optionIndex]] || answerText.toString().trim();
      }
    }
  }
  
  return answerText.toString().trim();
}

// Helper function to parse options from different formats
function parseOptions(optionsData) {
  if (!optionsData) return [];
  
  // If it's already an array
  if (Array.isArray(optionsData)) {
    return optionsData.map(opt => opt.toString().trim());
  }
  
  // If it's a string, try different parsing methods
  const optionsStr = optionsData.toString();
  
  // Try JSON array format: ["A","B","C","D"]
  try {
    const jsonOptions = JSON.parse(optionsStr);
    if (Array.isArray(jsonOptions)) {
      return jsonOptions.map(opt => opt.toString().trim());
    }
  } catch (e) {
    // Not JSON, continue with other formats
  }
  
  // Try comma-separated format: "A,B,C,D"
  if (optionsStr.includes(',')) {
    return optionsStr.split(',').map(opt => opt.trim().replace(/['"]/g, ''));
  }
  
  // Try semicolon-separated format: "A;B;C;D"
  if (optionsStr.includes(';')) {
    return optionsStr.split(';').map(opt => opt.trim().replace(/['"]/g, ''));
  }
  
  // Try pipe-separated format: "A|B|C|D"
  if (optionsStr.includes('|')) {
    return optionsStr.split('|').map(opt => opt.trim().replace(/['"]/g, ''));
  }
  
  // If none of the above, treat as single option
  return [optionsStr.trim()];
}

// Helper function to parse tags from different formats
function parseTags(tagsData) {
  if (!tagsData) return [];
  
  const tagsStr = tagsData.toString();
  
  // Try comma-separated format: "tag1,tag2,tag3"
  if (tagsStr.includes(',')) {
    return tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
  
  // Try semicolon-separated format: "tag1;tag2;tag3"
  if (tagsStr.includes(';')) {
    return tagsStr.split(';').map(tag => tag.trim()).filter(tag => tag);
  }
  
  // Try pipe-separated format: "tag1|tag2|tag3"
  if (tagsStr.includes('|')) {
    return tagsStr.split('|').map(tag => tag.trim()).filter(tag => tag);
  }
  
  // If none of the above, treat as single tag
  return tagsStr.trim() ? [tagsStr.trim()] : [];
}

// Image upload endpoint
app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    let imageUrl;

    // Try to upload to S3 if configured
    if (process.env.AWS_ACCESS_KEY_ID) {
      try {
        const s3Url = await S3Service.uploadFile(req.file.path, req.file.filename);
        imageUrl = s3Url;
        // Clean up local file after S3 upload
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('S3 upload failed, falling back to local storage:', error);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      // Fallback to local storage
      imageUrl = `/uploads/${req.file.filename}`;
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete image endpoint
app.delete('/upload-image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Try to delete from S3 first
    if (process.env.AWS_ACCESS_KEY_ID) {
      try {
        await S3Service.deleteFile(filename);
        res.json({ message: 'Image deleted successfully from S3' });
        return;
      } catch (error) {
        console.error('S3 deletion failed, trying local file:', error);
      }
    }

    // Fallback to local file deletion
    const imagePath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.json({ message: 'Image deleted successfully from local storage' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Authentication endpoints (hardcoded for demo)
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded credentials for demo
  const validCredentials = [
    { email: 'admin@preplens.com', password: 'admin123' },
    { email: 'admin', password: 'admin' },
    { email: 'test@test.com', password: 'test' },
    { email: 'user', password: 'user' }
  ];

  const isValid = validCredentials.some(
    cred => cred.email === email && cred.password === password
  );

  if (isValid) {
    res.json({
      message: 'Login successful',
      token: 'demo-token-' + Date.now(),
      user: { email, role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { email, role: 'admin' }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Serve uploaded files (fallback for local files)
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`PrepLens Admin Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`S3: ${process.env.AWS_ACCESS_KEY_ID ? 'Configured' : 'Not configured'}`);
}); 