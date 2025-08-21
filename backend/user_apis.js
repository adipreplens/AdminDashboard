const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const aiService = require('./ai_service');
const { TestResult, TestSession, TestAnswer, UserProgress, UserPreferences } = require('./database_schemas');

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

// Authentication Middleware

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

    // Generate JWT token and refresh token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
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

    // Generate JWT token and refresh token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
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

  // Get Questions by Exam
  router.get('/questions/:exam', async (req, res) => {
    try {
      const { exam } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        subject, 
        difficulty, 
        language = 'english',
        search 
      } = req.query;

      // Validate exam
      const validExams = ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je', 'upsc', 'bank-po', 'cat'];
      if (!validExams.includes(exam)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid exam. Must be one of: ${validExams.join(', ')}` 
        });
      }

      // Build query
      let query = { 
        exam: exam,
        publishStatus: 'published'
      };

      // Add filters
      if (subject) query.subject = subject;
      if (difficulty) query.difficulty = difficulty;
      if (language) query.language = language;
      if (search) {
        query.$or = [
          { text: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { topic: { $regex: search, $options: 'i' } }
        ];
      }

      // Get questions from main database
      const Question = mongoose.model('Question');
      const questions = await Question.find(query)
        .select('text options answer subject exam difficulty level marks timeLimit blooms imageUrl solutionImageUrl optionImages questionMath solutionMath topic solution')
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
          },
          filters: {
            exam,
            subject,
            difficulty,
            language,
            search
          }
        }
      });

    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch questions: ' + error.message 
      });
    }
  });

  // Get Available Subjects for Exam
  router.get('/subjects/:exam', async (req, res) => {
    try {
      const { exam } = req.params;

      // Validate exam
      const validExams = ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je', 'upsc', 'bank-po', 'cat'];
      if (!validExams.includes(exam)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid exam. Must be one of: ${validExams.join(', ')}` 
        });
      }

      const Question = mongoose.model('Question');
      const subjects = await Question.distinct('subject', { 
        exam: exam,
        publishStatus: 'published'
      });

      res.json({
        success: true,
        data: subjects
      });

    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch subjects: ' + error.message 
      });
    }
  });

  // Get Available Difficulties for Exam
  router.get('/difficulties/:exam', async (req, res) => {
    try {
      const { exam } = req.params;

      const Question = mongoose.model('Question');
      const difficulties = await Question.distinct('difficulty', { 
        exam: exam,
        publishStatus: 'published'
      });

      res.json({
        success: true,
        data: difficulties
      });

    } catch (error) {
      console.error('Error fetching difficulties:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch difficulties: ' + error.message 
      });
    }
  });

  // ==================== AI ENDPOINTS ====================

  // AI Analysis endpoint
  router.post('/ai/analyze-attempt', async (req, res) => {
    try {
      const { userId, examType, attemptData, mode = 'analyze_attempt' } = req.body;
      
      // Validate input
      if (!userId || !examType || !attemptData) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, examType, attemptData'
        });
      }

      // Generate AI analysis
      const analysis = await aiService.generateAIAnalysis(attemptData, examType, mode);
      
      res.json({
        success: true,
        analysis: analysis,
        mode: mode,
        confidence: 0.95,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'AI analysis failed',
        details: error.message
      });
    }
  });

  // AI Learning Path endpoint
  router.post('/ai/recommend-path', async (req, res) => {
    try {
      const { userId, examType, performanceData, preparationMonths, mode = 'recommend_path' } = req.body;
      
      if (!userId || !examType || !performanceData) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const recommendations = await aiService.generateAILearningPath(performanceData, examType, preparationMonths, mode);
      
      res.json({
        success: true,
        recommendations: recommendations,
        mode: mode,
        confidence: 0.90,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Recommendations error:', error);
      res.status(500).json({
        success: false,
        error: 'AI recommendations failed',
        details: error.message
      });
    }
  });

  // AI Tutor endpoint
  router.post('/ai/tutor', async (req, res) => {
    try {
      const { userId, question, subject, examType, availableContent, mode = 'tutor' } = req.body;
      
      if (!userId || !question) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, question'
        });
      }

      const tutorResponse = await aiService.generateAITutorResponse(question, subject, examType, availableContent, mode);
      
      res.json({
        success: true,
        response: tutorResponse,
        mode: mode,
        confidence: tutorResponse.confidence || 0.85,
        needs_human_review: tutorResponse.needsHumanReview || false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Tutor error:', error);
      res.status(500).json({
        success: false,
        error: 'AI tutor failed',
        details: error.message
      });
    }
  });

  // AI Weekly Plan endpoint
  router.post('/ai/weekly-plan', async (req, res) => {
    try {
      const { userId, examType, currentPerformance, preparationMonths, mode = 'weekly_plan' } = req.body;
      
      if (!userId || !examType || !currentPerformance) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const weeklyPlan = await aiService.generateAIWeeklyPlan(currentPerformance, examType, preparationMonths, mode);
      
      res.json({
        success: true,
        weeklyPlan: weeklyPlan,
        mode: mode,
        confidence: 0.88,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Weekly Plan error:', error);
      res.status(500).json({
        success: false,
        error: 'AI weekly plan failed',
        details: error.message
      });
    }
  });

  // AI Insights Summary endpoint
  router.post('/ai/insights-summary', async (req, res) => {
    try {
      const { userId, examType, preparationMonths, days = 30, mode = 'insights_summary' } = req.body;
      
      if (!userId || !examType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const insights = await aiService.generateAIInsightsSummary(examType, days, preparationMonths, mode);
      
      res.json({
        success: true,
        insights: insights,
        mode: mode,
        confidence: 0.82,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Insights error:', error);
      res.status(500).json({
        success: false,
        error: 'AI insights failed',
        details: error.message
      });
    }
  });

  // ==================== CRITICAL MISSING ENDPOINTS ====================

  // 1. Token Refresh (Critical)
  router.post('/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
      
      // Generate new tokens
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      
      const newRefreshToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  });

  // 2. Save Test Results
  router.post('/test-results', async (req, res) => {
    try {
      const { testId, testType, examType, answers, score, totalQuestions, timeTaken, completedAt } = req.body;
      
      if (!testId || !testType || !examType || !answers) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Get user from token
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Create test result document
      const testResult = new TestResult({
        userId: decoded.userId,
        testId,
        testType,
        examType,
        answers,
        score: score || 0,
        totalQuestions: totalQuestions || answers.length,
        timeTaken: timeTaken || 0,
        completedAt: completedAt || new Date(),
        createdAt: new Date()
      });

      await testResult.save();
      
      res.status(201).json({
        success: true,
        resultId: testResult._id
      });

    } catch (error) {
      console.error('Save test result error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save test result'
      });
    }
  });

  // 3. Get Test Results
  router.get('/test-results', async (req, res) => {
    try {
      const { page = 1, limit = 10, examType, testType } = req.query;
      
      // Get user from token
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const query = { userId: decoded.userId };
      if (examType) query.examType = examType;
      if (testType) query.testType = testType;

      const results = await TestResult.find(query)
        .sort({ completedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await TestResult.countDocuments(query);

      res.json({
        results,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: page * limit < total
      });

    } catch (error) {
      console.error('Get test results error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch test results'
      });
    }
  });

  // 4. Start Test Session
  router.post('/test-session/start', async (req, res) => {
    try {
      const { examType, testType, questionCount } = req.body;
      
      if (!examType || !testType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get questions for the exam
      const Question = mongoose.model('Question');
      const questions = await Question.find({ 
        exam: examType,
        publishStatus: 'published'
      })
      .limit(questionCount || 10)
      .select('text options answer subject difficulty');

      // Create test session
      const testSession = new TestSession({
        sessionId,
        examType,
        testType,
        questionCount: questions.length,
        status: 'active',
        startedAt: new Date(),
        questions: questions.map(q => ({
          questionId: q._id,
          text: q.text,
          options: q.options,
          subject: q.subject,
          difficulty: q.difficulty
        }))
      });

      await testSession.save();
      
      res.json({
        success: true,
        sessionId,
        questions: questions.map(q => ({
          id: q._id,
          text: q.text,
          options: q.options,
          subject: q.subject,
          difficulty: q.difficulty
        }))
      });

    } catch (error) {
      console.error('Start test session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start test session',
        details: error.message
      });
    }
  });

  // 5. Submit Test Answer
  router.post('/test-session/:sessionId/answer', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { questionId, selectedAnswer, isCorrect } = req.body;
      
      if (!questionId || !selectedAnswer) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Save answer
      const testAnswer = new TestAnswer({
        sessionId,
        questionId,
        selectedAnswer,
        isCorrect: isCorrect || false,
        answeredAt: new Date()
      });

      await testAnswer.save();
      
      res.json({
        success: true,
        message: 'Answer submitted successfully'
      });

    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit answer',
        details: error.message
      });
    }
  });

  // 6. Complete Test Session
  router.post('/test-session/:sessionId/complete', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { totalTime } = req.body;
      
      // Update session status
      const session = await TestSession.findOneAndUpdate(
        { sessionId },
        { 
          status: 'completed',
          completedAt: new Date(),
          totalTime: totalTime || 0
        },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Test session not found'
        });
      }

      // Calculate results
      const answers = await TestAnswer.find({ sessionId });
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const score = (correctAnswers / session.questionCount) * 100;

      res.json({
        success: true,
        result: {
          sessionId,
          score: Math.round(score),
          correctAnswers,
          totalQuestions: session.questionCount,
          totalTime: session.totalTime,
          completedAt: session.completedAt
        }
      });

    } catch (error) {
      console.error('Complete test session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete test session',
        details: error.message
      });
    }
  });

  // 7. Get User Progress
  router.get('/progress', async (req, res) => {
    try {
      const { examType } = req.query;
      
      // Get user from token
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const query = { userId: decoded.userId };
      if (examType) query.examType = examType;

      const results = await TestResult.find(query);

      const totalTests = results.length;
      const passedTests = results.filter(r => r.score >= 60).length;
      const failedTests = totalTests - passedTests;
      const averageScore = totalTests > 0 ? results.reduce((sum, r) => sum + r.score, 0) / totalTests : 0;
      const totalTime = results.reduce((sum, r) => sum + r.timeTaken, 0);

      // Calculate streak
      const sortedResults = results.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      let streak = 0;
      let currentDate = new Date();
      
      for (const result of sortedResults) {
        const resultDate = new Date(result.completedAt);
        const daysDiff = Math.floor((currentDate - resultDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          streak++;
          currentDate = resultDate;
        } else {
          break;
        }
      }

      res.json({
        progress: {
          totalTests,
          passedTests,
          failedTests,
          averageScore: Math.round(averageScore),
          totalTime,
          streak,
          lastTestDate: sortedResults.length > 0 ? sortedResults[0].completedAt : null
        }
      });

    } catch (error) {
      console.error('Get user progress error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user progress'
      });
    }
  });

  // 8. Get User Stats
  router.get('/stats', async (req, res) => {
    try {
      // Get user from token
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const results = await TestResult.find({ userId: decoded.userId }).sort({ completedAt: -1 });

      const totalTests = results.length;
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
      const totalTime = results.reduce((sum, r) => sum + r.timeTaken, 0);
      const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
      const averageTime = totalTests > 0 ? totalTime / totalTests : 0;
      const accuracy = totalQuestions > 0 ? (results.reduce((sum, r) => sum + (r.score * r.totalQuestions / 100), 0) / totalQuestions) * 100 : 0;

      // Calculate streak
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let currentDate = new Date();

      for (const result of results) {
        const resultDate = new Date(result.completedAt);
        const daysDiff = Math.floor((currentDate - resultDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          tempStreak++;
          currentDate = resultDate;
        } else {
          if (tempStreak > bestStreak) bestStreak = tempStreak;
          if (currentStreak === 0) currentStreak = tempStreak;
          tempStreak = 0;
          currentDate = resultDate;
        }
      }

      if (tempStreak > bestStreak) bestStreak = tempStreak;
      if (currentStreak === 0) currentStreak = tempStreak;

      res.json({
        stats: {
          totalTests,
          totalScore: Math.round(totalScore),
          totalQuestions,
          totalTime,
          averageScore: Math.round(averageScore),
          averageTime: Math.round(averageTime),
          currentStreak,
          bestStreak,
          lastTestDate: results.length > 0 ? results[0].completedAt : null,
          accuracy: Math.round(accuracy)
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user stats'
      });
    }
  });

  // 9. Get Dashboard Data
  router.get('/dashboard', async (req, res) => {
    try {
      // Get stats
      const results = await TestResult.find().sort({ completedAt: -1 }).limit(10);

      const totalTests = await TestResult.countDocuments();
      const averageScore = totalTests > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;

      // Get recent tests
      const recentTests = results.slice(0, 5).map(r => ({
        id: r._id,
        testType: r.testType,
        examType: r.examType,
        score: r.score,
        totalQuestions: r.totalQuestions,
        completedAt: r.completedAt
      }));

      // Generate recommendations
      const recommendations = [];
      if (results.length === 0) {
        recommendations.push('Start your first practice test to begin learning');
      } else if (averageScore < 60) {
        recommendations.push('Focus on fundamental concepts and basic practice');
      } else if (averageScore < 80) {
        recommendations.push('Practice medium difficulty questions to improve');
      } else {
        recommendations.push('Try advanced questions to master the concepts');
      }

      res.json({
        success: true,
        stats: {
          totalTests,
          averageScore: Math.round(averageScore),
          currentStreak: 0 // Calculate from progress endpoint
        },
        recentTests,
        recommendations
      });

    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard data',
        details: error.message
      });
    }
  });

  // 10. Update User Preferences
  router.put('/profile', async (req, res) => {
    try {
      const { preferences } = req.body;
      
      if (!preferences) {
        return res.status(400).json({
          success: false,
          error: 'Preferences are required'
        });
      }

      // Update user preferences
      const User = mongoose.model('User');
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { 
          preferences,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        preferences: updatedUser.preferences,
        message: 'Preferences updated successfully'
      });

    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update preferences',
        details: error.message
      });
    }
  });

  // 11. Get Test History
  router.get('/test-history', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const history = await TestResult.find()
        .sort({ completedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await TestResult.countDocuments();

      res.json({
        success: true,
        history: history.map(h => ({
          id: h._id,
          testType: h.testType,
          examType: h.examType,
          score: h.score,
          totalQuestions: h.totalQuestions,
          timeTaken: h.timeTaken,
          completedAt: h.completedAt
        })),
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: page * limit < total
      });

    } catch (error) {
      console.error('Get test history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get test history',
        details: error.message
      });
    }
  });

module.exports = router; 