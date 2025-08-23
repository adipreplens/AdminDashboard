// Database Schemas for Test Management
const mongoose = require('mongoose');

// Test Result Schema
const testResultSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true
  },
  testType: {
    type: String,
    enum: ['practice', 'mock', 'quiz', 'assessment'],
    required: true
  },
  examType: {
    type: String,
    enum: ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je', 'upsc', 'bank-po', 'cat'],
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    subject: String,
    difficulty: String
  }],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  timeTaken: {
    type: Number,
    default: 0 // in seconds
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Test Session Schema
const testSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true
  },
  examType: {
    type: String,
    enum: ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je', 'upsc', 'bank-po', 'cat'],
    required: true
  },
  testType: {
    type: String,
    enum: ['practice', 'mock', 'quiz', 'assessment'],
    required: true
  },
  questionCount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    text: String,
    options: [String],
    subject: String,
    difficulty: String
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  totalTime: {
    type: Number,
    default: 0 // in seconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Test Answer Schema
const testAnswerSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  answeredAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// User Progress Schema
const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true,
    unique: true
  },
  examType: {
    type: String,
    enum: ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je', 'upsc', 'bank-po', 'cat'],
    required: true
  },
  totalTests: {
    type: Number,
    default: 0
  },
  passedTests: {
    type: Number,
    default: 0
  },
  failedTests: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalTime: {
    type: Number,
    default: 0 // in seconds
  },
  averageScore: {
    type: Number,
    default: 0
  },
  averageTime: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  lastTestDate: {
    type: Date
  },
  accuracy: {
    type: Number,
    default: 0
  },
  subjectProgress: [{
    subject: String,
    totalQuestions: Number,
    correctAnswers: Number,
    accuracy: Number,
    averageTime: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// User Preferences Schema
const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  notifications: {
    type: Boolean,
    default: true
  },
  dailyReminder: {
    type: String,
    default: '09:00' // HH:MM format
  },
  soundEnabled: {
    type: Boolean,
    default: true
  },
  vibrationEnabled: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['english', 'hindi'],
    default: 'english'
  },
  studyGoals: {
    dailyQuestions: {
      type: Number,
      default: 20
    },
    dailyTime: {
      type: Number,
      default: 120 // in minutes
    },
    weeklyTests: {
      type: Number,
      default: 3
    }
  },
  privacy: {
    shareProgress: {
      type: Boolean,
      default: false
    },
    showLeaderboard: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
testResultSchema.index({ userId: 1, examType: 1, completedAt: -1 });
testResultSchema.index({ testId: 1 }, { unique: true });

testSessionSchema.index({ sessionId: 1 }, { unique: true });
testSessionSchema.index({ userId: 1, status: 1 });

testAnswerSchema.index({ sessionId: 1, questionId: 1 });
testAnswerSchema.index({ userId: 1, answeredAt: -1 });

userProgressSchema.index({ userId: 1, examType: 1 }, { unique: true });

userPreferencesSchema.index({ userId: 1 }, { unique: true });

// Pre-save middleware to update timestamps
testResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

testSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create models
const TestResult = mongoose.model('TestResult', testResultSchema);
const TestSession = mongoose.model('TestSession', testSessionSchema);
const TestAnswer = mongoose.model('TestAnswer', testAnswerSchema);
const UserProgress = mongoose.model('UserProgress', userProgressSchema);
const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = {
  TestResult,
  TestSession,
  TestAnswer,
  UserProgress,
  UserPreferences
}; 