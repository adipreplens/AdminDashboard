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
const userRoutes = require('./user_apis');
const { TopicBasedQuestionService } = require('./topic_based_questions');
require('dotenv').config();

// Initialize S3Service early
const s3Service = new S3Service();
const topicService = new TopicBasedQuestionService();

const app = express();
const PORT = process.env.PORT || 5001;

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in production, just log
  if (process.env.NODE_ENV === 'production') {
    console.error('Continuing in production despite uncaught exception');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
  if (process.env.NODE_ENV === 'production') {
    console.error('Continuing in production despite unhandled rejection');
  } else {
    process.exit(1);
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Allow CORS for static image files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Or specify your frontend domains for more security
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// User routes
app.use('/users', userRoutes);

// MongoDB Connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shreyashchaudhary81:hfOYtcA7zywQsxJP@preplensadmin.mmrvf6s.mongodb.net/Preplensadmin?retryWrites=true&w=majority&appName=Preplensadmin';

const connectWithRetry = () => {
  console.log('🔄 Attempting MongoDB connection...');
  console.log('📡 Connection URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
  
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 2,  // Minimum number of connections in the pool
    maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
    connectTimeoutMS: 10000, // Give up initial connection after 10s
  })
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('🔄 Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Handle MongoDB disconnection
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Continuing in production despite MongoDB error');
  }
});

mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB connected successfully');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully');
});

mongoose.connection.on('close', () => {
  console.log('🔒 MongoDB connection closed');
});

// Models
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
  subject: { type: String, required: true },
  exam: { type: String, required: true },
  difficulty: { type: String, required: true },
  level: { type: String, enum: ['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4'], default: 'Level 1' },
  tags: [{ type: String }],
  marks: { type: Number, required: true },
  timeLimit: { type: Number, required: true },
  blooms: { type: String, required: true },
  imageUrl: { type: String },
  solutionImageUrl: { type: String },
  optionImages: { type: Map, of: String },
  publishStatus: { type: String, enum: ['draft', 'published'], default: 'draft' },
  category: { type: String },
  topic: { type: String },
  solution: { type: String },
  // Math formula fields
  questionMath: { type: String },
  solutionMath: { type: String },
  // PrepLens specific fields
  moduleType: { 
    type: String, 
    enum: ['practice', 'section_test', 'mock_test', 'test_series', 'live_test', 'pyq'],
    default: 'practice'
  },
  testSeriesId: { type: String }, // For grouping questions in test series
  testSeriesName: { type: String },
  testNumber: { type: Number }, // Test number in series
  isPremium: { type: Boolean, default: false }, // PrepLens+ content
  language: { type: String, enum: ['english', 'hindi'], default: 'english' },
  explanation: { type: String }, // Detailed step-by-step explanation
  hints: [{ type: String }], // Multiple hints for the question
  relatedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
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

// Module Schema for Exam Paper / Module Creator
const moduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  exam: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  level: { type: String, enum: ['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4'], default: 'Level 1' },
  tags: [{ type: String }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  totalMarks: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 }, // in minutes
  publishStatus: { type: String, enum: ['draft', 'published'], default: 'draft' },
  category: { type: String },
  topic: { type: String },
  moduleType: { 
    type: String, 
    enum: ['practice', 'section_test', 'mock_test', 'test_series', 'live_test', 'pyq'],
    default: 'practice'
  },
  isPremium: { type: Boolean, default: false },
  language: { type: String, enum: ['english', 'hindi'], default: 'english' },
  instructions: { type: String }, // Instructions for students
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Module = mongoose.model('Module', moduleSchema);

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
    // Check file type - allow images for image upload and CSV/Excel for bulk upload
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.toLowerCase().endsWith('.csv') ||
        file.originalname.toLowerCase().endsWith('.xlsx') ||
        file.originalname.toLowerCase().endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only image, CSV, and Excel files are allowed!'), false);
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
    const { page = 1, limit = 100, subject, exam, difficulty, blooms, search } = req.query;
    
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

// Get all questions without pagination (for admin dashboard)
app.get('/questions/all', async (req, res) => {
  try {
    const { subject, exam, difficulty, blooms, search, moduleType, isPremium, language } = req.query;
    
    let query = {};
    
    if (subject) query.subject = subject;
    if (exam) query.exam = exam;
    if (difficulty) query.difficulty = difficulty;
    if (blooms) query.blooms = blooms;
    if (moduleType) query.moduleType = moduleType;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';
    if (language) query.language = language;
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 });

    res.json({
      questions,
      total: questions.length
    });
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get PrepLens exam types
app.get('/exams', async (req, res) => {
  try {
    const exams = [
      'RRB JE',
      'RRB ALP', 
      'RRB Technician',
      'RRB NTPC',
      'SSC CGL',
      'SSC CHSL',
      'SSC JE'
    ];
    
    res.json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get PrepLens levels
app.get('/levels', async (req, res) => {
  try {
    const levels = [
      'Level 0',
      'Level 1', 
      'Level 2',
      'Level 3',
      'Level 4'
    ];
    
    res.json({ levels });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

// Get PrepLens subjects
app.get('/subjects', async (req, res) => {
  try {
    const subjects = [
      'Quantitative Aptitude',
      'Reasoning',
      'English',
      'General Knowledge',
      'General Science',
      'Computer Knowledge',
      'Current Affairs'
    ];
    
    res.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get PrepLens topics by subject
app.get('/topics/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    
    const topicMap = {
      'Quantitative Aptitude': [
        'Number System', 'Percentage', 'Profit & Loss', 'Time & Work',
        'Time & Distance', 'Simple Interest', 'Compound Interest',
        'Ratio & Proportion', 'Average', 'Partnership', 'Pipes & Cisterns',
        'Boats & Streams', 'Trains', 'Mensuration', 'Geometry',
        'Algebra', 'Trigonometry', 'Data Interpretation'
      ],
      'Reasoning': [
        'Verbal Reasoning', 'Non-Verbal Reasoning', 'Logical Reasoning',
        'Analytical Reasoning', 'Blood Relations', 'Direction Sense',
        'Coding-Decoding', 'Series', 'Analogy', 'Classification',
        'Syllogism', 'Statement & Arguments', 'Statement & Assumptions',
        'Statement & Conclusions', 'Course of Action', 'Cause & Effect'
      ],
      'English': [
        'Grammar', 'Vocabulary', 'Reading Comprehension', 'Verbal Ability',
        'Synonyms & Antonyms', 'Idioms & Phrases', 'One Word Substitution',
        'Sentence Correction', 'Fill in the Blanks', 'Cloze Test',
        'Para Jumbles', 'Sentence Completion', 'Error Detection'
      ],
      'General Knowledge': [
        'History', 'Geography', 'Polity', 'Economics', 'Science',
        'Sports', 'Awards & Honours', 'Books & Authors', 'Important Days',
        'National & International Organizations', 'Indian Constitution'
      ],
      'General Science': [
        'Physics', 'Chemistry', 'Biology', 'Computer Science',
        'Environmental Science', 'Scientific Instruments', 'Discoveries & Inventions'
      ],
      'Computer Knowledge': [
        'Computer Fundamentals', 'Operating System', 'MS Office',
        'Internet & Email', 'Computer Networks', 'Database Management',
        'Programming Languages', 'Computer Security'
      ],
      'Current Affairs': [
        'National News', 'International News', 'Sports News',
        'Business & Economy', 'Science & Technology', 'Environment',
        'Awards & Honours', 'Appointments & Resignations'
      ]
    };
    
    const topics = topicMap[subject] || [];
    res.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Get questions by module type (for PrepLens app)
app.get('/questions/module/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;
    const { exam, subject, difficulty, isPremium } = req.query;
    
    let query = { moduleType };
    
    if (exam) query.exam = exam;
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';
    
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      questions,
      total: questions.length,
      moduleType
    });
  } catch (error) {
    console.error('Error fetching questions by module:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get test series questions
app.get('/test-series/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { testNumber } = req.query;
    
    let query = { 
      moduleType: 'test_series',
      testSeriesId: seriesId
    };
    
    if (testNumber) query.testNumber = parseInt(testNumber);
    
    const questions = await Question.find(query)
      .sort({ testNumber: 1, createdAt: -1 });

    res.json({
      questions,
      total: questions.length,
      seriesId
    });
  } catch (error) {
    console.error('Error fetching test series:', error);
    res.status(500).json({ error: 'Failed to fetch test series' });
  }
});

// Create single question
app.post('/questions', async (req, res) => {
  try {
    const questionData = req.body;
    
    // Validate required fields
    const requiredFields = ['text', 'options', 'answer', 'subject', 'exam', 'difficulty', 'level', 'marks', 'timeLimit', 'blooms'];
    for (const field of requiredFields) {
      if (!questionData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Set default values for optional fields
    const question = new Question({
      ...questionData,
      publishStatus: questionData.publishStatus || 'draft',
      category: questionData.category || '',
      topic: questionData.topic || '',
      solution: questionData.solution || ''
    });
    
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

// Update question
app.put('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    const requiredFields = ['text', 'options', 'answer', 'subject', 'exam', 'difficulty', 'level', 'marks', 'timeLimit', 'blooms'];
    for (const field of requiredFields) {
      if (!updateData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ 
      message: 'Question updated successfully',
      question: updatedQuestion 
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Publish/Unpublish question
app.patch('/questions/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { publishStatus } = req.body;
    
    if (!publishStatus || !['published', 'draft'].includes(publishStatus)) {
      return res.status(400).json({ error: 'Invalid publish status. Must be "published" or "draft"' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { 
        publishStatus,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ 
      message: `Question ${publishStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      question: updatedQuestion 
    });
  } catch (error) {
    console.error('Error updating publish status:', error);
    res.status(500).json({ error: 'Failed to update publish status' });
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

    console.log('Processing file:', req.file.originalname);
    console.log('File mimetype:', req.file.mimetype);
    console.log('File size:', req.file.size);
    
    const results = [];
    const errors = [];
    const fileName = req.file.originalname.toLowerCase();

    // Handle different file types
    if (fileName.endsWith('.csv')) {
      console.log('Processing CSV file');
      // Process CSV file
      let headers = [];
      let isFirstRow = true;
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          if (isFirstRow) {
            // Get headers from first row
            headers = Object.keys(data);
            console.log('CSV headers:', headers);
            isFirstRow = false;
          }
          
          try {
            const questionData = parseQuestionData(data, headers);
            results.push(questionData);
          } catch (error) {
            console.error('Error parsing CSV row:', error);
            errors.push({ row: data, error: error.message });
          }
        })
        .on('end', async () => {
          console.log('CSV processing complete. Results:', results.length, 'Errors:', errors.length);
          await saveQuestions(results, errors, req.file.path, res);
        })
        .on('error', (error) => {
          console.error('Error processing CSV:', error);
          // Clean up uploaded file
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          res.status(500).json({ error: 'Failed to process CSV file: ' + error.message });
        });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      console.log('Processing Excel file');
      // Process Excel file
      try {
        const workbook = XLSX.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Excel data rows:', data.length);
        
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          console.log('Excel headers:', headers);
          
          for (const row of data) {
            try {
              const questionData = parseQuestionData(row, headers);
              results.push(questionData);
            } catch (error) {
              console.error('Error parsing Excel row:', error);
              errors.push({ row: row, error: error.message });
            }
          }
        }

        console.log('Excel processing complete. Results:', results.length, 'Errors:', errors.length);
        await saveQuestions(results, errors, req.file.path, res);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to process Excel file: ' + error.message });
      }
    } else {
      console.log('Unsupported file format:', fileName);
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
    res.status(500).json({ error: 'Failed to process upload: ' + error.message });
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

// Ultra-flexible data parser that accepts ANY format
function parseQuestionData(row, headers) {
  try {
    console.log('Parsing row with headers:', headers);
    console.log('Row data:', row);
    
    // Ultra-flexible column mapping - accepts ANY column name
    const columnMapping = {
      // Question text - ANY column that might contain the question
      'text': [
        'text', 'question', 'question_text', 'questiontext', 'question text', 'questiontext',
        'q', 'qt', 'questiontext', 'question_text', 'questiontext', 'question text',
        'problem', 'problem_text', 'problemtext', 'problem text',
        'content', 'description', 'desc', 'details', 'info', 'information',
        'statement', 'prompt', 'query', 'inquiry', 'ask', 'questionnaire',
        'mcq', 'multiple choice', 'multiplechoice', 'multiple_choice',
        'title', 'heading', 'header', 'name', 'label', 'caption'
      ],
      
      // Options - ANY column that might contain options
      'options': [
        'options', 'option', 'choices', 'choice', 'option_a', 'option_b', 'option_c', 'option_d',
        'optiona', 'optionb', 'optionc', 'optiond', 'a', 'b', 'c', 'd',
        'choice_a', 'choice_b', 'choice_c', 'choice_d', 'choicea', 'choiceb', 'choicec', 'choiced',
        'opt_a', 'opt_b', 'opt_c', 'opt_d', 'opta', 'optb', 'optc', 'optd',
        'alternative', 'alternatives', 'possibility', 'possibilities',
        'selection', 'selections', 'pick', 'picks', 'choose', 'chooses',
        'answer_a', 'answer_b', 'answer_c', 'answer_d', 'answera', 'answerb', 'answerc', 'answerd'
      ],
      
      // Answer - ANY column that might contain the correct answer
      'answer': [
        'answer', 'correct_answer', 'correctanswer', 'correct answer', 'solution', 'key',
        'correct', 'right', 'right_answer', 'rightanswer', 'right answer',
        'key_answer', 'keyanswer', 'key answer', 'solution_answer', 'solutionanswer',
        'correct_option', 'correctoption', 'correct option', 'right_option', 'rightoption',
        'correct_choice', 'correctchoice', 'correct choice', 'right_choice', 'rightchoice',
        'correct_a', 'correct_b', 'correct_c', 'correct_d', 'correcta', 'correctb', 'correctc', 'correctd',
        'right_a', 'right_b', 'right_c', 'right_d', 'righta', 'rightb', 'rightc', 'rightd',
        'key_a', 'key_b', 'key_c', 'key_d', 'keya', 'keyb', 'keyc', 'keyd',
        'solution_a', 'solution_b', 'solution_c', 'solution_d', 'solutiona', 'solutionb', 'solutionc', 'solutiond'
      ],
      
      // Subject - ANY column that might contain subject/topic
      'subject': [
        'subject', 'topic', 'category', 'subject_name', 'subjectname',
        'sub', 'subj', 'top', 'cat', 'categ', 'category_name', 'categoryname',
        'field', 'area', 'domain', 'discipline', 'branch', 'stream',
        'course', 'module', 'unit', 'section', 'chapter', 'lesson',
        'subject_area', 'subjectarea', 'topic_area', 'topicarea',
        'subject_category', 'subjectcategory', 'topic_category', 'topiccategory'
      ],
      
      // Category - ANY column that might contain category
      'category': [
        'category', 'cat', 'categ', 'category_name', 'categoryname',
        'group', 'grouping', 'classification', 'classify', 'type',
        'category_type', 'categorytype', 'category_group', 'categorygroup',
        'main_category', 'maincategory', 'primary_category', 'primarycategory',
        'category_level', 'categorylevel', 'category_hierarchy', 'categoryhierarchy'
      ],
      
      // Topic - ANY column that might contain topic/subtopic
      'topic': [
        'topic', 'subtopic', 'topic_name', 'topicname', 'subtopic_name',
        'subtopicname', 'topic_detail', 'topicdetail', 'topic_specific',
        'topicspecific', 'topic_area', 'topicarea', 'topic_category',
        'topiccategory', 'topic_level', 'topiclevel', 'topic_hierarchy',
        'topichierarchy', 'topic_group', 'topicgroup', 'topic_type',
        'topictype', 'topic_class', 'topicclass', 'topic_subject',
        'topicsubject', 'topic_field', 'topicfield', 'topic_domain',
        'topicdomain', 'topic_branch', 'topicbranch', 'topic_stream',
        'topicstream', 'topic_course', 'topiccourse', 'topic_module',
        'topicmodule', 'topic_unit', 'topicunit', 'topic_section',
        'topicsection', 'topic_chapter', 'topicchapter', 'topic_lesson',
        'topiclesson'
      ],
      
      // Exam - ANY column that might contain exam type
      'exam': [
        'exam', 'exam_type', 'examtype', 'exam type', 'test', 'test_type',
        'examination', 'examination_type', 'examinationtype', 'examination type',
        'test_type', 'testtype', 'test type', 'assessment', 'assessment_type',
        'quiz', 'quiz_type', 'quiztype', 'quiz type', 'paper', 'paper_type',
        'exam_name', 'examname', 'test_name', 'testname', 'assessment_name',
        'exam_category', 'examcategory', 'test_category', 'testcategory',
        'exam_level', 'examlevel', 'test_level', 'testlevel',
        'exam_board', 'examboard', 'test_board', 'testboard'
      ],
      
      // Difficulty - ANY column that might contain difficulty level
      'difficulty': [
        'difficulty', 'level', 'complexity', 'difficulty_level', 'difficultylevel',
        'diff', 'lev', 'comp', 'complex', 'hard', 'hardness', 'hard_level',
        'easy', 'easiness', 'easy_level', 'medium', 'medium_level',
        'simple', 'simplicity', 'simple_level', 'tough', 'toughness',
        'challenging', 'challenge', 'challenge_level', 'advanced', 'advanced_level',
        'basic', 'basic_level', 'intermediate', 'intermediate_level',
        'beginner', 'beginner_level', 'expert', 'expert_level'
      ],
      
      // Tags - ANY column that might contain tags/keywords
      'tags': [
        'tags', 'tag', 'keywords', 'keyword', 'topics', 'topic',
        'keyword', 'keywords', 'key_word', 'key_words', 'key_word', 'key_words',
        'label', 'labels', 'labeling', 'categorization', 'categorize',
        'classification', 'classify', 'group', 'grouping', 'cluster',
        'theme', 'themes', 'thematic', 'concept', 'concepts', 'conceptual',
        'category', 'categories', 'categ', 'categorization', 'categorize',
        'type', 'types', 'typing', 'classification', 'classify',
        'genre', 'genres', 'style', 'styles', 'format', 'formats'
      ],
      
      // Marks - ANY column that might contain marks/points
      'marks': [
        'marks', 'mark', 'points', 'point', 'score', 'weight',
        'marking', 'pointing', 'scoring', 'weighting', 'value', 'values',
        'grade', 'grades', 'grading', 'rating', 'ratings', 'rating',
        'credit', 'credits', 'credit_value', 'creditvalue', 'credit value',
        'weightage', 'weight_age', 'weightage_value', 'weightagevalue',
        'allocation', 'allocations', 'allocation_value', 'allocationvalue',
        'distribution', 'distributions', 'distribution_value', 'distributionvalue'
      ],
      
      // Time limit - ANY column that might contain time duration
      'timeLimit': [
        'timelimit', 'time_limit', 'time limit', 'duration', 'time', 'timeallowed',
        'time_allowed', 'timeallowed', 'time allowed', 'time_permitted',
        'time_permit', 'timepermit', 'time permit', 'time_given',
        'timegiven', 'time given', 'time_allocated', 'timeallocated',
        'time_allocated', 'timeallocated', 'time allocated', 'time_assigned',
        'timeassigned', 'time assigned', 'time_provided', 'timeprovided',
        'time_provide', 'timeprovide', 'time provide', 'time_set',
        'timeset', 'time set', 'time_frame', 'timeframe', 'time frame',
        'time_period', 'timeperiod', 'time period', 'time_span',
        'timespan', 'time span', 'time_range', 'timerange', 'time range'
      ],
      
      // Bloom's taxonomy - ANY column that might contain cognitive level
      'blooms': [
        'blooms', 'bloom', 'bloomstaxonomy', 'bloom\'s', 'taxonomy', 'cognitive_level',
        'bloom_taxonomy', 'bloomtaxonomy', 'bloom taxonomy', 'cognitive',
        'cognitive_level', 'cognitivelevel', 'cognitive level', 'thinking',
        'thinking_level', 'thinkinglevel', 'thinking level', 'mental',
        'mental_level', 'mentallevel', 'mental level', 'intellectual',
        'intellectual_level', 'intellectuallevel', 'intellectual level',
        'learning', 'learning_level', 'learninglevel', 'learning level',
        'understanding', 'understanding_level', 'understandinglevel',
        'comprehension', 'comprehension_level', 'comprehensionlevel',
        'application', 'application_level', 'applicationlevel',
        'analysis', 'analysis_level', 'analysislevel',
        'synthesis', 'synthesis_level', 'synthesislevel',
        'evaluation', 'evaluation_level', 'evaluationlevel',
        'creation', 'creation_level', 'creationlevel'
      ],
      
      // Question Math - ANY column that might contain question math formulas
      'questionMath': [
        'question_math', 'questionmath', 'q_math', 'qmath', 'question_formula',
        'questionformula', 'q_formula', 'qformula', 'question_equation',
        'questionequation', 'q_equation', 'qequation', 'question_latex',
        'questionlatex', 'q_latex', 'qlatex', 'math', 'formula', 'equation',
        'latex', 'mathematics', 'mathematical', 'math_formula', 'mathformula',
        'math_equation', 'mathequation', 'math_latex', 'mathlatex'
      ],
      
      // Solution Math - ANY column that might contain solution math formulas
      'solutionMath': [
        'solution_math', 'solutionmath', 's_math', 'smath', 'solution_formula',
        'solutionformula', 's_formula', 'sformula', 'solution_equation',
        'solutionequation', 's_equation', 'sequation', 'solution_latex',
        'solutionlatex', 's_latex', 'slatex', 'answer_math', 'answermath',
        'a_math', 'amath', 'answer_formula', 'answerformula', 'a_formula',
        'aformula', 'answer_equation', 'answerequation', 'a_equation',
        'aequation', 'answer_latex', 'answerlatex', 'a_latex', 'alatex'
      ],
      
      // Solution/Explanation - ANY column that might contain detailed solution
      'solution': [
        'solution', 'explanation', 'explain', 'reasoning', 'rationale', 'justification',
        'detailed answer', 'detailed_answer', 'detailedanswer', 'detail', 'details',
        'answer explanation', 'answer_explanation', 'answerexplanation',
        'elaborate', 'elaboration', 'description', 'working', 'workings',
        'step by step', 'step_by_step', 'stepbystep', 'steps', 'method',
        'approach', 'process', 'procedure', 'breakdown', 'analysis',
        'solution_text', 'solutiontext', 'explanation_text', 'explanationtext',
        'solve', 'solving', 'answer_detail', 'answerdetail', 'full_answer',
        'fullanswer', 'complete_answer', 'completeanswer', 'detailed_solution',
        'detailedsolution', 'solution_detail', 'solutiondetail'
      ]
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

    // Ultra-flexible data extraction - tries multiple approaches
    const questionData = {
      text: extractText(row, headers, foundColumns),
      options: extractOptions(row, headers, foundColumns),
      answer: extractAnswer(row, headers, foundColumns),
      subject: extractSubject(row, headers, foundColumns),
      exam: extractExam(row, headers, foundColumns),
      difficulty: extractDifficulty(row, headers, foundColumns),
      tags: extractTags(row, headers, foundColumns),
      marks: extractMarks(row, headers, foundColumns),
      timeLimit: extractTimeLimit(row, headers, foundColumns),
      blooms: extractBlooms(row, headers, foundColumns),
      publishStatus: 'draft', // Default to draft for bulk uploads
      category: extractCategory(row, headers, foundColumns),
      topic: extractTopic(row, headers, foundColumns),
      solution: extractSolution(row, headers, foundColumns),
      questionMath: extractQuestionMath(row, headers, foundColumns),
      solutionMath: extractSolutionMath(row, headers, foundColumns)
    };

    return questionData;
  } catch (error) {
    console.error('Error parsing question data:', error);
    throw new Error(`Error parsing row: ${error.message}`);
  }
}

// Helper extraction functions for ultra-flexible parsing
function extractText(row, headers, foundColumns) {
  // Try found column first
  if (foundColumns.text && row[foundColumns.text]) {
    return row[foundColumns.text].toString().trim();
  }
  
  // Try any column that might contain question text
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('question') || headerLower.includes('text') || 
        headerLower.includes('problem') || headerLower.includes('content') ||
        headerLower.includes('q') || headerLower.includes('desc')) {
      if (row[header] && row[header].toString().trim().length > 10) {
        return row[header].toString().trim();
      }
    }
  }
  
  // Try first non-empty column that looks like text
  for (const header of headers) {
    if (row[header] && row[header].toString().trim().length > 10) {
      return row[header].toString().trim();
    }
  }
  
  return 'Question text not found';
}

function extractOptions(row, headers, foundColumns) {
  // Try individual option columns first
  const individualOptions = parseOptionsFromIndividualColumns(row, headers);
  if (individualOptions && individualOptions.length > 0) {
    return individualOptions;
  }
  
  // Try found options column
  if (foundColumns.options && row[foundColumns.options]) {
    return parseOptions(row[foundColumns.options]);
  }
  
  // Try any column that might contain options
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('option') || headerLower.includes('choice') ||
        headerLower.includes('a') || headerLower.includes('b') ||
        headerLower.includes('c') || headerLower.includes('d')) {
      if (row[header]) {
        const options = parseOptions(row[header]);
        if (options.length > 0) {
          return options;
        }
      }
    }
  }
  
  return ['Option A', 'Option B', 'Option C', 'Option D'];
}

function extractAnswer(row, headers, foundColumns) {
  // Try found answer column first
  if (foundColumns.answer && row[foundColumns.answer]) {
    return parseAnswerFromOptions(row[foundColumns.answer], row, headers);
  }
  
  // Try any column that might contain answer
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('answer') || headerLower.includes('correct') ||
        headerLower.includes('solution') || headerLower.includes('key')) {
      if (row[header]) {
        return parseAnswerFromOptions(row[header], row, headers);
      }
    }
  }
  
  return 'Answer not found';
}

function extractSubject(row, headers, foundColumns) {
  if (foundColumns.subject && row[foundColumns.subject]) {
    return row[foundColumns.subject].toString().trim();
  }
  
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('subject') || headerLower.includes('topic') ||
        headerLower.includes('category') || headerLower.includes('field')) {
      if (row[header]) {
        return row[header].toString().trim();
      }
    }
  }
  
  return 'general';
}

function extractExam(row, headers, foundColumns) {
  if (foundColumns.exam && row[foundColumns.exam]) {
    return row[foundColumns.exam].toString().trim();
  }
  
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('exam') || headerLower.includes('test') ||
        headerLower.includes('assessment') || headerLower.includes('quiz')) {
      if (row[header]) {
        return row[header].toString().trim();
      }
    }
  }
  
  return 'general';
}

function extractDifficulty(row, headers, foundColumns) {
  if (foundColumns.difficulty && row[foundColumns.difficulty]) {
    return row[foundColumns.difficulty].toString().trim();
  }
  
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('difficulty') || headerLower.includes('level') ||
        headerLower.includes('complexity')) {
      if (row[header]) {
        return row[header].toString().trim();
      }
    }
  }
  
  return 'medium';
}

function extractTags(row, headers, foundColumns) {
  if (foundColumns.tags && row[foundColumns.tags]) {
    return parseTags(row[foundColumns.tags]);
  }
  
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('tag') || headerLower.includes('keyword')) {
      if (row[header]) {
        return parseTags(row[header]);
      }
    }
  }
  
  return [];
}

function extractMarks(row, headers, foundColumns) {
  if (foundColumns.marks && row[foundColumns.marks]) {
    const marks = parseInt(row[foundColumns.marks]);
    return isNaN(marks) ? 1 : marks;
  }
  
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('mark') || headerLower.includes('point') ||
        headerLower.includes('score')) {
      if (row[header]) {
        const marks = parseInt(row[header]);
        if (!isNaN(marks)) {
          return marks;
        }
      }
    }
  }
  
  return 1;
}

function extractTimeLimit(row, headers, foundColumns) {
  if (foundColumns.timeLimit && row[foundColumns.timeLimit]) {
    const time = parseInt(row[foundColumns.timeLimit]);
    return isNaN(time) ? 60 : time;
  }
  
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('time') || headerLower.includes('duration')) {
      if (row[header]) {
        const time = parseInt(row[header]);
        if (!isNaN(time)) {
          return time;
        }
      }
    }
  }
  
  return 60;
}

function extractBlooms(row, headers, foundColumns) {
  if (foundColumns.blooms && row[foundColumns.blooms]) {
    return row[foundColumns.blooms].toString().trim();
  }
  
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('bloom') || headerLower.includes('cognitive') ||
        headerLower.includes('taxonomy')) {
      if (row[header]) {
        return row[header].toString().trim();
      }
    }
  }
  
  return 'remember';
}

function extractCategory(row, headers, foundColumns) {
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('category') || headerLower.includes('cat')) {
      if (row[header]) {
        return row[header].toString().trim();
      }
    }
  }
  
  return '';
}

function extractTopic(row, headers, foundColumns) {
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('topic') || headerLower.includes('subtopic')) {
      if (row[header]) {
        return row[header].toString().trim();
      }
    }
  }
  
  return '';
}

function extractSolution(row, headers, foundColumns) {
  // First try to use the foundColumns mapping
  if (foundColumns.solution && row[foundColumns.solution]) {
    return row[foundColumns.solution].toString().trim();
  }
  
  // Then try to find solution-related columns manually
  for (const header of headers) {
    const headerLower = header.toLowerCase().trim();
    if (headerLower.includes('solution') || headerLower.includes('explanation') ||
        headerLower.includes('explain') || headerLower.includes('reasoning') ||
        headerLower.includes('detailed answer') || headerLower.includes('detailed_answer') ||
        headerLower.includes('detailedanswer') || headerLower.includes('detail') ||
        headerLower.includes('answer explanation') || headerLower.includes('answer_explanation') ||
        headerLower.includes('answerexplanation') || headerLower.includes('elaborate') ||
        headerLower.includes('description') || headerLower.includes('rationale') ||
        headerLower.includes('justification') || headerLower.includes('working') ||
        headerLower.includes('step by step') || headerLower.includes('step_by_step') ||
        headerLower.includes('stepbystep') || headerLower.includes('steps')) {
      if (row[header] && row[header].toString().trim()) {
        return row[header].toString().trim();
      }
    }
  }
  
  return '';
}

// Helper function to extract question math formula
function extractQuestionMath(row, headers, foundColumns) {
  try {
    // Look for columns that might contain question math formulas
    for (const header of headers) {
      const headerLower = header.toLowerCase().trim();
      if (headerLower.includes('math') || headerLower.includes('formula') || 
          headerLower.includes('latex') || headerLower.includes('equation') ||
          headerLower.includes('question_math') || headerLower.includes('questionmath') ||
          headerLower.includes('q_math') || headerLower.includes('qmath')) {
        if (row[header] && row[header].toString().trim()) {
          return row[header].toString().trim();
        }
      }
    }
    
    return ''; // No question math found
  } catch (error) {
    console.error('Error extracting question math:', error);
    return '';
  }
}

// Helper function to extract solution math formula
function extractSolutionMath(row, headers, foundColumns) {
  try {
    // Look for columns that might contain solution math formulas
    for (const header of headers) {
      const headerLower = header.toLowerCase().trim();
      if (headerLower.includes('solution_math') || headerLower.includes('solutionmath') ||
          headerLower.includes('answer_math') || headerLower.includes('answermath') ||
          headerLower.includes('s_math') || headerLower.includes('smath') ||
          headerLower.includes('solution_formula') || headerLower.includes('solutionformula') ||
          headerLower.includes('answer_formula') || headerLower.includes('answerformula')) {
        if (row[header] && row[header].toString().trim()) {
          return row[header].toString().trim();
        }
      }
    }
    
    return ''; // No solution math found
  } catch (error) {
    console.error('Error extracting solution math:', error);
    return '';
  }
}

// Helper function to parse options from individual option columns (optionA, optionB, etc.)
function parseOptionsFromIndividualColumns(row, headers) {
  try {
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
  } catch (error) {
    console.error('Error parsing individual options:', error);
    return null;
  }
}

// Helper function to parse answer when it references option letters/names
function parseAnswerFromOptions(answerText, row, headers) {
  try {
    if (!answerText) return 'Answer not found';
    
    const answerStr = answerText.toString().toLowerCase().trim();
    
    // First, try to match the answer with the actual options
    const options = extractOptions(row, headers, {});
    if (options && options.length > 0) {
      // Check if the answer matches one of the options exactly
      const exactMatch = options.find(option => 
        option.toLowerCase().trim() === answerStr ||
        option.toLowerCase().trim().includes(answerStr) ||
        answerStr.includes(option.toLowerCase().trim())
      );
      if (exactMatch) {
        return exactMatch;
      }
      
      // Check if answer is a single letter (A, B, C, D) or number (1, 2, 3, 4)
      if (answerStr.length === 1) {
        if (answerStr >= 'a' && answerStr <= 'd') {
          const index = answerStr.charCodeAt(0) - 97; // 'a' = 97
          if (index < options.length) {
            return options[index];
          }
        } else if (answerStr >= '1' && answerStr <= '4') {
          const index = parseInt(answerStr) - 1;
          if (index < options.length) {
            return options[index];
          }
        }
      }
    }
    
    // If answer references option letters (A, B, C, D) or numbers
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
    
    // If answer is very long (likely a detailed explanation), 
    // check if this should be moved to solution field instead
    if (answerStr.length > 50) {
      console.warn(`⚠️ Answer seems too long (${answerStr.length} chars), might belong in solution field:`, answerStr.substring(0, 100) + '...');
      // Still return it as answer, but log the warning
    }
    
    return answerText.toString().trim();
  } catch (error) {
    console.error('Error parsing answer from options:', error);
    return answerText ? answerText.toString().trim() : 'Answer not found';
  }
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

    try {
      // Use the new S3Service with fallback
      imageUrl = await s3Service.uploadFile(req.file, req.file.filename);
      
      // Clean up local file if it was created
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      res.status(500).json({ error: 'Failed to upload image' });
      return;
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
    
    // Use the new S3Service with fallback
    const deleted = await s3Service.deleteFile(filename);
    
    if (deleted) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      // Try local file deletion as fallback
      const imagePath = path.join(__dirname, 'uploads', filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        res.json({ message: 'Image deleted successfully from local storage' });
      } else {
        res.status(404).json({ error: 'Image not found' });
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Health check endpoint for Render
app.get('/health', async (req, res) => {
  try {
    const s3Health = await s3Service.healthCheck();
    
    res.status(200).json({ 
      status: 'OK',
      message: 'PrepLens Admin API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      s3: s3Health.status === 'healthy' ? 'configured' : 'not configured',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
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

// Public API endpoint for website (www.preplens.in)
app.get('/api/public/questions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      subject, 
      exam, 
      difficulty, 
      moduleType,
      isPremium,
      language,
      search 
    } = req.query;
    
    let query = { publishStatus: 'published' }; // Only published questions
    
    // Add filters
    if (subject) query.subject = subject;
    if (exam) query.exam = exam;
    if (difficulty) query.difficulty = difficulty;
    if (moduleType) query.moduleType = moduleType;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';
    if (language) query.language = language;
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .select('text options answer subject exam difficulty moduleType isPremium language topic solution questionMath solutionMath imageUrl solutionImageUrl optionImages')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalQuestions: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch questions' 
    });
  }
});

// Public API endpoint for question details
app.get('/api/public/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .select('text options answer subject exam difficulty moduleType isPremium language topic solution questionMath solutionMath imageUrl solutionImageUrl optionImages explanation hints relatedQuestions');

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        error: 'Question not found' 
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch question details' 
    });
  }
});

// Public API endpoint for available filters
app.get('/api/public/filters', async (req, res) => {
  try {
    const subjects = await Question.distinct('subject');
    const exams = await Question.distinct('exam');
    const difficulties = await Question.distinct('difficulty');
    const moduleTypes = await Question.distinct('moduleType');
    const languages = await Question.distinct('language');

    res.json({
      success: true,
      data: {
        subjects: subjects.filter(s => s),
        exams: exams.filter(e => e),
        difficulties: difficulties.filter(d => d),
        moduleTypes: moduleTypes.filter(m => m),
        languages: languages.filter(l => l)
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch filters' 
    });
  }
});

// Public API endpoint for statistics
app.get('/api/public/statistics', async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments({ publishStatus: 'published' });
    const totalExams = await Question.distinct('exam').then(exams => exams.filter(e => e).length);
    const totalSubjects = await Question.distinct('subject').then(subjects => subjects.filter(s => s).length);

    res.json({
      success: true,
      data: {
        totalQuestions,
        totalExams,
        totalSubjects
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// ===== MODULE CREATOR API ENDPOINTS =====

// Get all modules
app.get('/modules', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, exam, subject, difficulty, publishStatus } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (exam) query.exam = exam;
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (publishStatus) query.publishStatus = publishStatus;

    const modules = await Module.find(query)
      .populate('questions', 'text subject exam difficulty marks timeLimit')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Module.countDocuments(query);

    res.json({
      modules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get single module by ID
app.get('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const module = await Module.findById(id)
      .populate('questions', 'text options answer subject exam difficulty marks timeLimit blooms tags solution imageUrl');

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ module });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Create new module
app.post('/modules', async (req, res) => {
  try {
    const moduleData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'exam', 'subject', 'difficulty', 'questions'];
    for (const field of requiredFields) {
      if (!moduleData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Calculate total marks and time
    const questions = await Question.find({ _id: { $in: moduleData.questions } });
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const totalTime = questions.reduce((sum, q) => sum + (q.timeLimit || 60), 0);

    // Create module
    const module = new Module({
      ...moduleData,
      totalMarks,
      totalTime: Math.ceil(totalTime / 60), // Convert to minutes
      publishStatus: moduleData.publishStatus || 'draft',
      tags: moduleData.tags || []
    });
    
    await module.save();

    // Populate questions for response
    await module.populate('questions', 'text subject exam difficulty marks timeLimit');

    res.status(201).json({ 
      message: 'Module created successfully',
      module 
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Update module
app.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'exam', 'subject', 'difficulty', 'questions'];
    for (const field of requiredFields) {
      if (!updateData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Calculate total marks and time
    const questions = await Question.find({ _id: { $in: updateData.questions } });
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const totalTime = questions.reduce((sum, q) => sum + (q.timeLimit || 60), 0);

    // Update module
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        totalMarks,
        totalTime: Math.ceil(totalTime / 60), // Convert to minutes
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Populate questions for response
    await updatedModule.populate('questions', 'text subject exam difficulty marks timeLimit');

    res.json({ 
      message: 'Module updated successfully',
      module: updatedModule 
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Publish/Unpublish module
app.patch('/modules/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { publishStatus } = req.body;
    
    if (!publishStatus || !['published', 'draft'].includes(publishStatus)) {
      return res.status(400).json({ error: 'Invalid publish status. Must be "published" or "draft"' });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      id,
      { 
        publishStatus,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ 
      message: `Module ${publishStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      module: updatedModule 
    });
  } catch (error) {
    console.error('Error updating module publish status:', error);
    res.status(500).json({ error: 'Failed to update publish status' });
  }
});

// Delete module
app.delete('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.findById(id);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await Module.findByIdAndDelete(id);

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

// Get distinct tags for module creation
app.get('/tags', async (req, res) => {
  try {
    const tags = await Question.distinct('tags');
    const flattenedTags = tags.flat().filter(tag => tag && tag.trim());
    const uniqueTags = [...new Set(flattenedTags)].sort();
    
    res.json({ tags: uniqueTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
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

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`PrepLens Admin Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`S3: ${process.env.AWS_ACCESS_KEY_ID ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Server error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  if (process.env.NODE_ENV === 'production') {
    console.log('Attempting to restart server in 5 seconds...');
    setTimeout(() => {
      server.close();
      process.exit(1); // Let PM2 or Render restart the process
    }, 5000);
  }
});

// Keep alive for Render
setInterval(() => {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Keep-alive ping');
  }
}, 300000); // Every 5 minutes 

// Topic-based Question Routes
app.get('/topics/exams', (req, res) => {
  try {
    const examsWithTopics = topicService.getAllExamsWithTopics();
    res.json({
      success: true,
      data: examsWithTopics
    });
  } catch (error) {
    console.error('Get exams with topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get exams with topics'
    });
  }
});

app.get('/topics/:examId/subjects', (req, res) => {
  try {
    const { examId } = req.params;
    const subjects = topicService.getSubjectsForExam(examId);
    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subjects'
    });
  }
});

app.get('/topics/:examId/subjects/:subjectId/topics', (req, res) => {
  try {
    const { examId, subjectId } = req.params;
    const topics = topicService.getTopicsForSubject(examId, subjectId);
    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get topics'
    });
  }
});

app.get('/topics/:examId/questions', async (req, res) => {
  try {
    const { examId } = req.params;
    const { subject, topic, difficulty, language, limit, skip } = req.query;
    
    const options = {
      difficulty,
      language,
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0
    };

    const result = await topicService.getQuestionsByTopic(examId, subject, topic, options);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get questions by topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get questions by topic'
    });
  }
});

app.post('/topics/:examId/questions/multiple', async (req, res) => {
  try {
    const { examId } = req.params;
    const { topics, difficulty, language, limit, skip } = req.body;
    
    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        error: 'Topics array is required'
      });
    }

    const options = {
      difficulty,
      language,
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0
    };

    const result = await topicService.getQuestionsByTopics(examId, topics, options);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get questions by topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get questions by topics'
    });
  }
});

app.get('/topics/:examId/count', async (req, res) => {
  try {
    const { examId } = req.params;
    const result = await topicService.getTopicQuestionCount(examId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get topic count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get topic count'
    });
  }
});