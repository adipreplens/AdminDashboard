const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  exam: {
    type: String,
    enum: ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je'],
    required: true
  },
  language: {
    type: String,
    enum: ['english', 'hindi'],
    default: 'english'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: {
    type: Date
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upiId: {
    type: String,
    trim: true
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    emailUpdates: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalQuestionsAttempted: {
      type: Number,
      default: 0
    },
    totalCorrectAnswers: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
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

// Generate referral code
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = this._id.toString().slice(-8).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

const AppUser = mongoose.model('AppUser', userSchema);

// Test Session Schema
const testSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    enum: ['practice', 'section-test', 'mock-test', 'test-series', 'live-test'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced', 'expert']
  },
  testId: {
    type: String
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalTime: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiRecommendation: {
    type: Object
  },
  timeLimit: {
    type: Number
  }
});

const TestSession = mongoose.model('TestSession', testSessionSchema);

// User Progress Schema
const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalTime: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  lastAttempted: {
    type: Date
  }
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AppUser.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes
const router = express.Router();

// 1. User Registration
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, phone, exam, language, referralCode } = req.body;
    console.log('Extracted exam field:', exam);
    console.log('All extracted fields:', { name, email, phone, exam, language, referralCode });

    // Check if user already exists
    const existingUser = await AppUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Find referrer if referral code provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await AppUser.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Create user
    console.log('Creating user with data:', {
      name,
      email,
      phone,
      exam,
      language: language || 'english',
      referredBy
    });
    
    const user = new AppUser({
      name,
      email,
      password: hashedPassword,
      phone,
      exam,
      language: language || 'english',
      referredBy
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        exam: user.exam,
        language: user.language,
        isPremium: user.isPremium,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 2. User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await AppUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        exam: user.exam,
        language: user.language,
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry,
        referralCode: user.referralCode,
        totalEarnings: user.totalEarnings,
        totalReferrals: user.totalReferrals
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await AppUser.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// 4. Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, exam, language, upiId, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (exam) updateData.exam = exam;
    if (language) updateData.language = language;
    if (upiId) updateData.upiId = upiId;
    if (preferences) updateData.preferences = preferences;

    const user = await AppUser.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 5. Change Password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const user = await AppUser.findById(req.user._id);
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// 6. Purchase Premium
router.post('/purchase-premium', authenticateToken, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    // Set premium status (in real app, verify payment first)
    const premiumExpiry = new Date();
    premiumExpiry.setFullYear(premiumExpiry.getFullYear() + 1); // 1 year

    const user = await AppUser.findByIdAndUpdate(
      req.user._id,
      {
        isPremium: true,
        premiumExpiry
      },
      { new: true }
    ).select('-password');

    // If user was referred, give commission to referrer
    if (user.referredBy) {
      const referrer = await AppUser.findById(user.referredBy);
      if (referrer) {
        const commission = 299 * 0.1; // 10% of ₹299
        referrer.totalEarnings += commission;
        referrer.totalReferrals += 1;
        await referrer.save();
      }
    }

    res.json({
      message: 'Premium purchased successfully',
      user: {
        id: user._id,
        name: user.name,
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry
      }
    });
  } catch (error) {
    console.error('Premium purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase premium' });
  }
});

// 7. Get User Stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await AppUser.findById(req.user._id);
    const testSessions = await TestSession.find({ userId: req.user._id });
    const progress = await UserProgress.find({ userId: req.user._id });

    // Calculate additional stats
    const totalTests = testSessions.length;
    const completedTests = testSessions.filter(s => s.status === 'completed').length;
    const averageScore = testSessions.length > 0 
      ? testSessions.reduce((sum, session) => sum + session.score, 0) / testSessions.length 
      : 0;

    res.json({
      stats: {
        ...user.stats,
        totalTests,
        completedTests,
        averageScore: Math.round(averageScore * 100) / 100
      },
      progress
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 8. Start Test Session
router.post('/test-session/start', authenticateToken, async (req, res) => {
  try {
    const { testType, subject, level, testId } = req.body;

    // Check if user has access (premium check for certain test types)
    if (testType !== 'practice' && !req.user.isPremium) {
      return res.status(403).json({ 
        error: 'Premium access required',
        message: 'This test requires PrepLens+ subscription'
      });
    }

    // Get questions based on test type and parameters
    let questions = [];
    const Question = mongoose.model('Question');
    
    if (testType === 'practice') {
      questions = await Question.find({
        subject,
        difficulty: level,
        publishStatus: 'published'
      }).limit(25);
    } else {
      // For other test types, you might have predefined question sets
      questions = await Question.find({
        subject,
        publishStatus: 'published'
      }).limit(50);
    }

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available' });
    }

    // Create test session
    const testSession = new TestSession({
      userId: req.user._id,
      testType,
      subject,
      level,
      testId,
      questions: questions.map(q => ({ questionId: q._id })),
      totalQuestions: questions.length
    });

    await testSession.save();

    res.json({
      message: 'Test session started',
      sessionId: testSession._id,
      questions: questions.map(q => ({
        id: q._id,
        text: q.text,
        options: q.options,
        marks: q.marks,
        timeLimit: q.timeLimit
      }))
    });
  } catch (error) {
    console.error('Test session start error:', error);
    res.status(500).json({ error: 'Failed to start test session' });
  }
});

// 9. Submit Test Answer
router.post('/test-session/:sessionId/answer', authenticateToken, async (req, res) => {
  try {
    const { questionId, answer, timeSpent } = req.body;
    const { sessionId } = req.params;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: req.user._id,
      status: 'in-progress'
    });

    if (!testSession) {
      return res.status(404).json({ error: 'Test session not found' });
    }

    // Find the question
    const Question = mongoose.model('Question');
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update or add answer
    const questionIndex = testSession.questions.findIndex(q => 
      q.questionId.toString() === questionId
    );

    if (questionIndex !== -1) {
      testSession.questions[questionIndex].userAnswer = answer;
      testSession.questions[questionIndex].isCorrect = answer === question.answer;
      testSession.questions[questionIndex].timeSpent = timeSpent;
    }

    await testSession.save();

    res.json({
      message: 'Answer submitted successfully',
      isCorrect: answer === question.answer
    });
  } catch (error) {
    console.error('Answer submission error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// 10. Complete Test Session
router.post('/test-session/:sessionId/complete', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const testSession = await TestSession.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!testSession) {
      return res.status(404).json({ error: 'Test session not found' });
    }

    // Calculate results
    const correctAnswers = testSession.questions.filter(q => q.isCorrect).length;
    const totalTime = testSession.questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
    const accuracy = (correctAnswers / testSession.totalQuestions) * 100;
    const score = Math.round((correctAnswers / testSession.totalQuestions) * 100);

    // Update test session
    testSession.correctAnswers = correctAnswers;
    testSession.totalTime = totalTime;
    testSession.accuracy = accuracy;
    testSession.score = score;
    testSession.status = 'completed';
    testSession.completedAt = new Date();

    await testSession.save();

    // Update user stats
    const user = await AppUser.findById(req.user._id);
    user.stats.totalQuestionsAttempted += testSession.totalQuestions;
    user.stats.totalCorrectAnswers += correctAnswers;
    user.stats.totalTimeSpent += totalTime;
    user.stats.averageAccuracy = 
      (user.stats.totalCorrectAnswers / user.stats.totalQuestionsAttempted) * 100;
    await user.save();

    // Update progress for each subject/topic
    const Question = mongoose.model('Question');
    for (const questionData of testSession.questions) {
      const question = await Question.findById(questionData.questionId);
      if (question) {
        await UserProgress.findOneAndUpdate(
          {
            userId: req.user._id,
            subject: question.subject,
            topic: question.topic
          },
          {
            $inc: {
              questionsAttempted: 1,
              correctAnswers: questionData.isCorrect ? 1 : 0,
              totalTime: questionData.timeSpent || 0
            },
            $set: { lastAttempted: new Date() }
          },
          { upsert: true }
        );
      }
    }

    res.json({
      message: 'Test completed successfully',
      results: {
        totalQuestions: testSession.totalQuestions,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        score,
        totalTime,
        timePerQuestion: Math.round(totalTime / testSession.totalQuestions)
      }
    });
  } catch (error) {
    console.error('Test completion error:', error);
    res.status(500).json({ error: 'Failed to complete test' });
  }
});

// 11. Get Test History
router.get('/test-history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, testType } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (testType) filter.testType = testType;

    const testSessions = await TestSession.find(filter)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('questions.questionId', 'text subject topic');

    const total = await TestSession.countDocuments(filter);

    res.json({
      testSessions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Test history error:', error);
    res.status(500).json({ error: 'Failed to fetch test history' });
  }
});

// 12. Get Referral Stats
router.get('/referrals', authenticateToken, async (req, res) => {
  try {
    const referrals = await AppUser.find({ referredBy: req.user._id })
      .select('name email exam isPremium createdAt');

    const totalEarnings = req.user.totalEarnings;
    const totalReferrals = req.user.totalReferrals;

    res.json({
      referrals,
      totalEarnings,
      totalReferrals,
      referralCode: req.user.referralCode
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

// 13. Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await AppUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token (in real app, send email)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In real app, send email with reset link
    console.log('Reset token for', email, ':', resetToken);

    res.json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// 14. Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AppUser.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// 15. Delete Account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await AppUser.findByIdAndDelete(req.user._id);
    await TestSession.deleteMany({ userId: req.user._id });
    await UserProgress.deleteMany({ userId: req.user._id });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

const AIRecommendationSystem = require('./ai_recommendation_system');
const aiSystem = new AIRecommendationSystem();

// AI Recommendation Routes
router.get('/ai/next-test', authenticateToken, async (req, res) => {
  try {
    const { testType = 'practice' } = req.query;
    const userId = req.user._id; // Use req.user._id

    const recommendation = await aiSystem.getNextTestRecommendation(userId, testType);
    
    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('AI Next Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI recommendation'
    });
  }
});

router.get('/ai/study-plan', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // Use req.user._id
    
    const studyPlan = await aiSystem.getPersonalizedStudyPlan(userId);
    
    res.json({
      success: true,
      data: studyPlan
    });
  } catch (error) {
    console.error('AI Study Plan Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get study plan'
    });
  }
});

router.get('/ai/performance-analysis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // Use req.user._id
    
    const userHistory = await aiSystem.getUserTestHistory(userId);
    const analysis = aiSystem.analyzePerformance(userHistory);
    
    res.json({
      success: true,
      data: {
        analysis,
        history: {
          totalTests: userHistory.totalTests,
          averageScore: userHistory.averageScore
        }
      }
    });
  } catch (error) {
    console.error('AI Performance Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze performance'
    });
  }
});

// Smart test session with AI recommendation
router.post('/ai/smart-test-session/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // Use req.user._id
    const { testType = 'practice', subject, topic } = req.body;

    // Get AI recommendation
    const recommendation = await aiSystem.getNextTestRecommendation(userId, testType);
    
    if (!recommendation.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to generate AI recommendation'
      });
    }

    // Create test session with AI-recommended questions
    const testSession = new TestSession({
      userId,
      testType,
      subject: subject || recommendation.recommendation.subjectFocus,
      topic: topic || recommendation.recommendation.topicFocus,
      questions: recommendation.questions.map(q => q._id),
      totalQuestions: recommendation.questions.length,
      timeLimit: recommendation.recommendation.timeLimit,
      aiGenerated: true,
      aiRecommendation: recommendation.recommendation,
      startedAt: new Date()
    });

    await testSession.save();

    res.json({
      success: true,
      data: {
        sessionId: testSession._id,
        questions: recommendation.questions,
        recommendation: recommendation.recommendation,
        analysis: recommendation.analysis,
        timeLimit: testSession.timeLimit
      }
    });
  } catch (error) {
    console.error('AI Smart Test Session Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start smart test session'
    });
  }
});

const { OnboardingService } = require('./user_onboarding');
const onboardingService = new OnboardingService();

// Onboarding Routes
router.get('/onboarding/exams', async (req, res) => {
  try {
    const exams = onboardingService.getAvailableExams();
    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available exams'
    });
  }
});

router.post('/onboarding/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const onboardingData = req.body;

    const result = await onboardingService.saveOnboardingData(userId, onboardingData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Save onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save onboarding data'
    });
  }
});

router.get('/onboarding/data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await onboardingService.getOnboardingData(userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get onboarding data'
    });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await onboardingService.getDashboardData(userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

router.put('/onboarding/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const result = await onboardingService.updateOnboardingData(userId, updateData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update onboarding data'
    });
  }
});

  // User Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: email, password' 
        });
      }

      // Find user by email
      const User = mongoose.model('User');
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, exam: user.exam },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            exam: user.exam,
            language: user.language,
            onboardingCompleted: user.onboardingCompleted
          },
          token
        }
      });

    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to login: ' + error.message 
      });
    }
  });

  // New User Registration Routes
  router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      exam, 
      language, 
      referralCode 
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !exam) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, password, exam' 
      });
    }

    // Validate exam
    const validExams = ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je', 'upsc', 'bank-po', 'cat'];
    if (!validExams.includes(exam)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid exam. Must be one of: ${validExams.join(', ')}` 
      });
    }

    // Validate language
    const validLanguages = ['english', 'hindi'];
    if (language && !validLanguages.includes(language)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid language. Must be one of: ${validLanguages.join(', ')}` 
      });
    }

    // Check if user already exists
    const User = mongoose.model('User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      exam,
      language: language || 'english',
      referralCode,
      onboardingCompleted: false
    });

    await user.save();

    // Initialize onboarding with default values
    const { OnboardingService } = require('./user_onboarding');
    const onboardingService = new OnboardingService();
    
    const defaultOnboardingData = {
      exam,
      preparationDays: 90, // Default 3 months
      currentLevel: 'beginner',
      studyTimePerDay: 2,
      targetScore: 80,
      dailyQuestions: 30,
      weeklyTests: 3
    };

    const onboardingResult = await onboardingService.saveOnboardingData(user._id, defaultOnboardingData);

    if (!onboardingResult.success) {
      console.error('Onboarding initialization failed:', onboardingResult.error);
      // Don't fail the registration, just log the error
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, exam: user.exam },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          exam: user.exam,
          language: user.language,
          onboardingCompleted: user.onboardingCompleted
        },
        token,
        onboarding: onboardingResult.success ? onboardingResult.data : null
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register user: ' + error.message 
    });
  }
});

// Complete onboarding process
router.post('/onboarding/complete', async (req, res) => {
  try {
    const { 
      userId,
      preparationDays,
      currentLevel,
      preferredSubjects,
      studyTimePerDay,
      weakAreas,
      strongAreas,
      targetScore,
      dailyQuestions,
      weeklyTests
    } = req.body;

    // Validate required fields
    if (!userId || !preparationDays) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userId, preparationDays' 
      });
    }

    // Validate preparation days
    if (preparationDays < 1 || preparationDays > 365) {
      return res.status(400).json({ 
        success: false, 
        error: 'Preparation days must be between 1 and 365' 
      });
    }

    // Use the onboarding service to save detailed onboarding data
    const { OnboardingService } = require('./user_onboarding');
    const onboardingService = new OnboardingService();
    
    const onboardingData = {
      exam: req.body.exam, // This should come from the user's profile
      preparationDays,
      currentLevel: currentLevel || 'beginner',
      preferredSubjects: preferredSubjects || [],
      studyTimePerDay: studyTimePerDay || 2,
      weakAreas: weakAreas || [],
      strongAreas: strongAreas || [],
      targetScore: targetScore || 80,
      dailyQuestions: dailyQuestions || 30,
      weeklyTests: weeklyTests || 3
    };

    const result = await onboardingService.saveOnboardingData(userId, onboardingData);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }

    // Update user's onboarding status
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(userId, { 
      onboardingCompleted: true 
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete onboarding: ' + error.message 
    });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const User = mongoose.model('User');
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Get onboarding data if available
    const { OnboardingService } = require('./user_onboarding');
    const onboardingService = new OnboardingService();
    const onboardingData = await onboardingService.getOnboardingData(userId);

    res.json({
      success: true,
      data: {
        user,
        onboarding: onboardingData.success ? onboardingData.data : null
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user profile: ' + error.message 
    });
  }
});

// User Logout
router.post('/logout', async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to logout: ' + error.message 
    });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user data
    const User = mongoose.model('User');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, email: user.email, exam: user.exam },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          exam: user.exam,
          language: user.language,
          onboardingCompleted: user.onboardingCompleted
        }
      }
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
});

module.exports = router; 