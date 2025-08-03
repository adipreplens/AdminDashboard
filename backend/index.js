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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  publishStatus: { type: String, enum: ['draft', 'published'], default: 'draft' },
  category: { type: String },
  topic: { type: String },
  solution: { type: String },
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
    const { subject, exam, difficulty, blooms, search } = req.query;
    
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
    const requiredFields = ['text', 'options', 'answer', 'subject', 'exam', 'difficulty', 'marks', 'timeLimit', 'blooms'];
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
      solution: extractSolution(row, headers, foundColumns)
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
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('solution') || headerLower.includes('explanation') ||
        headerLower.includes('explain') || headerLower.includes('reasoning')) {
      if (row[header]) {
        return row[header].toString().trim();
      }
    }
  }
  
  return '';
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

    // Try to upload to S3 if configured
    if (process.env.AWS_ACCESS_KEY_ID) {
      try {
        const s3Url = await S3Service.uploadFile(req.file.path, req.file.filename);
        imageUrl = s3Url;
        // Clean up local file after S3 upload
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('S3 upload failed, falling back to local storage:', error);
        const baseUrl = process.env.BASE_URL || 'https://admindashboard-x0hk.onrender.com';
        imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      }
    } else {
      // Fallback to local storage - return full URL
      const baseUrl = process.env.BASE_URL || 'https://admindashboard-x0hk.onrender.com';
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
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