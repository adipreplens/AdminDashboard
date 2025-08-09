const mongoose = require('mongoose');

// User Onboarding Schema
const userOnboardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true,
    unique: true
  },
  exam: {
    type: String,
    required: true,
    enum: ['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc', 'ssc-cgl', 'ssc-chsl', 'ssc-je', 'upsc', 'bank-po', 'cat']
  },
  examName: {
    type: String,
    required: true
  },
  preparationDays: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  targetDate: {
    type: Date,
    required: true
  },
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  preferredSubjects: [{
    type: String,
    enum: ['mathematics', 'reasoning', 'general-knowledge', 'english', 'civil-engineering', 'mechanical-engineering', 'electrical-engineering', 'computer-science']
  }],
  studyTimePerDay: {
    type: Number,
    min: 1,
    max: 12,
    default: 2
  },
  weakAreas: [String],
  strongAreas: [String],
  goals: {
    targetScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    dailyQuestions: {
      type: Number,
      min: 10,
      max: 100,
      default: 30
    },
    weeklyTests: {
      type: Number,
      min: 1,
      max: 10,
      default: 3
    }
  },
  roadmap: {
    phase1: {
      name: { type: String, default: 'Foundation Building' },
      duration: { type: Number, default: 0 },
      focus: [String],
      targetScore: { type: Number, default: 0 }
    },
    phase2: {
      name: { type: String, default: 'Concept Strengthening' },
      duration: { type: Number, default: 0 },
      focus: [String],
      targetScore: { type: Number, default: 0 }
    },
    phase3: {
      name: { type: String, default: 'Advanced Practice' },
      duration: { type: Number, default: 0 },
      focus: [String],
      targetScore: { type: Number, default: 0 }
    },
    phase4: {
      name: { type: String, default: 'Mock Test Preparation' },
      duration: { type: Number, default: 0 },
      focus: [String],
      targetScore: { type: Number, default: 0 }
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
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

const UserOnboarding = mongoose.model('UserOnboarding', userOnboardingSchema);

// Onboarding Service
class OnboardingService {
  constructor() {
    this.examData = {
      'rrb-je': {
        name: 'RRB Junior Engineer',
        subjects: ['mathematics', 'reasoning', 'general-knowledge', 'civil-engineering', 'mechanical-engineering', 'electrical-engineering'],
        duration: 90,
        totalQuestions: 150,
        timeLimit: 120
      },
      'rrb-alp': {
        name: 'RRB Assistant Loco Pilot',
        subjects: ['mathematics', 'reasoning', 'general-knowledge', 'general-science'],
        duration: 90,
        totalQuestions: 150,
        timeLimit: 120
      },
      'rrb-technician': {
        name: 'RRB Technician',
        subjects: ['mathematics', 'reasoning', 'general-knowledge', 'general-science'],
        duration: 90,
        totalQuestions: 150,
        timeLimit: 120
      },
      'rrb-ntpc': {
        name: 'RRB NTPC',
        subjects: ['mathematics', 'reasoning', 'general-knowledge', 'english'],
        duration: 90,
        totalQuestions: 150,
        timeLimit: 120
      },
      'ssc-cgl': {
        name: 'SSC CGL',
        subjects: ['mathematics', 'reasoning', 'general-knowledge', 'english'],
        duration: 120,
        totalQuestions: 200,
        timeLimit: 120
      },
      'ssc-chsl': {
        name: 'SSC CHSL',
        subjects: ['mathematics', 'reasoning', 'general-knowledge', 'english'],
        duration: 60,
        totalQuestions: 100,
        timeLimit: 60
      },
      'ssc-je': {
        name: 'SSC Junior Engineer',
        subjects: ['mathematics', 'reasoning', 'general-knowledge', 'civil-engineering', 'mechanical-engineering', 'electrical-engineering'],
        duration: 120,
        totalQuestions: 200,
        timeLimit: 120
      },
      'upsc': {
        name: 'UPSC Civil Services',
        subjects: ['general-knowledge', 'english', 'reasoning', 'mathematics'],
        duration: 180,
        totalQuestions: 300,
        timeLimit: 180
      },
      'bank-po': {
        name: 'Bank PO',
        subjects: ['mathematics', 'reasoning', 'english', 'general-knowledge'],
        duration: 120,
        totalQuestions: 200,
        timeLimit: 120
      },
      'cat': {
        name: 'CAT (Common Admission Test)',
        subjects: ['mathematics', 'reasoning', 'english'],
        duration: 180,
        totalQuestions: 100,
        timeLimit: 180
      }
    };
  }

  /**
   * Get available exams
   */
  getAvailableExams() {
    return Object.entries(this.examData).map(([key, value]) => ({
      id: key,
      name: value.name,
      subjects: value.subjects,
      duration: value.duration,
      totalQuestions: value.totalQuestions,
      timeLimit: value.timeLimit
    }));
  }

  /**
   * Save user onboarding data
   */
  async saveOnboardingData(userId, onboardingData) {
    try {
      const examInfo = this.examData[onboardingData.exam];
      if (!examInfo) {
        throw new Error('Invalid exam selected');
      }

      // Calculate target date based on preparation days
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + onboardingData.preparationDays);

      // Generate personalized roadmap
      const roadmap = this.generateRoadmap(onboardingData, examInfo);

      const onboarding = new UserOnboarding({
        userId,
        exam: onboardingData.exam,
        examName: examInfo.name,
        preparationDays: onboardingData.preparationDays,
        targetDate,
        currentLevel: onboardingData.currentLevel || 'beginner',
        preferredSubjects: onboardingData.preferredSubjects || examInfo.subjects.slice(0, 3),
        studyTimePerDay: onboardingData.studyTimePerDay || 2,
        weakAreas: onboardingData.weakAreas || [],
        strongAreas: onboardingData.strongAreas || [],
        goals: {
          targetScore: onboardingData.targetScore || 80,
          dailyQuestions: onboardingData.dailyQuestions || 30,
          weeklyTests: onboardingData.weeklyTests || 3
        },
        roadmap,
        isCompleted: true
      });

      await onboarding.save();

      // Update user's exam preference
      const AppUser = mongoose.model('AppUser');
      await AppUser.findByIdAndUpdate(userId, {
        exam: onboardingData.exam,
        onboardingCompleted: true
      });

      return {
        success: true,
        data: onboarding,
        message: 'Onboarding completed successfully'
      };
    } catch (error) {
      console.error('Onboarding save error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate personalized roadmap
   */
  generateRoadmap(onboardingData, examInfo) {
    const { preparationDays, currentLevel, studyTimePerDay } = onboardingData;
    
    // Calculate phase durations based on preparation days
    const phase1Duration = Math.floor(preparationDays * 0.25); // 25% - Foundation
    const phase2Duration = Math.floor(preparationDays * 0.35); // 35% - Strengthening
    const phase3Duration = Math.floor(preparationDays * 0.25); // 25% - Advanced
    const phase4Duration = Math.floor(preparationDays * 0.15); // 15% - Mock Tests

    // Determine focus areas based on current level
    let phase1Focus, phase2Focus, phase3Focus, phase4Focus;
    
    if (currentLevel === 'beginner') {
      phase1Focus = ['basic-concepts', 'fundamentals'];
      phase2Focus = examInfo.subjects.slice(0, 3);
      phase3Focus = examInfo.subjects;
      phase4Focus = ['mock-tests', 'time-management'];
    } else if (currentLevel === 'intermediate') {
      phase1Focus = examInfo.subjects.slice(0, 2);
      phase2Focus = examInfo.subjects;
      phase3Focus = ['advanced-topics', 'problem-solving'];
      phase4Focus = ['mock-tests', 'speed-accuracy'];
    } else {
      phase1Focus = examInfo.subjects;
      phase2Focus = ['advanced-topics', 'problem-solving'];
      phase3Focus = ['mock-tests', 'speed-accuracy'];
      phase4Focus = ['final-preparation', 'revision'];
    }

    return {
      phase1: {
        name: 'Foundation Building',
        duration: phase1Duration,
        focus: phase1Focus,
        targetScore: currentLevel === 'beginner' ? 40 : 60
      },
      phase2: {
        name: 'Concept Strengthening',
        duration: phase2Duration,
        focus: phase2Focus,
        targetScore: currentLevel === 'beginner' ? 60 : 75
      },
      phase3: {
        name: 'Advanced Practice',
        duration: phase3Duration,
        focus: phase3Focus,
        targetScore: currentLevel === 'beginner' ? 75 : 85
      },
      phase4: {
        name: 'Mock Test Preparation',
        duration: phase4Duration,
        focus: phase4Focus,
        targetScore: onboardingData.targetScore || 80
      }
    };
  }

  /**
   * Get user onboarding data
   */
  async getOnboardingData(userId) {
    try {
      const onboarding = await UserOnboarding.findOne({ userId }).populate('userId');
      return {
        success: true,
        data: onboarding
      };
    } catch (error) {
      console.error('Get onboarding error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get personalized dashboard data
   */
  async getDashboardData(userId) {
    try {
      const onboarding = await UserOnboarding.findOne({ userId });
      if (!onboarding) {
        return {
          success: false,
          error: 'Onboarding not completed'
        };
      }

      // Calculate progress
      const daysElapsed = Math.floor((Date.now() - onboarding.createdAt) / (1000 * 60 * 60 * 24));
      const totalDays = onboarding.preparationDays;
      const progressPercentage = Math.min((daysElapsed / totalDays) * 100, 100);

      // Determine current phase
      let currentPhase = 'phase1';
      let phaseProgress = 0;
      
      if (daysElapsed <= onboarding.roadmap.phase1.duration) {
        currentPhase = 'phase1';
        phaseProgress = (daysElapsed / onboarding.roadmap.phase1.duration) * 100;
      } else if (daysElapsed <= onboarding.roadmap.phase1.duration + onboarding.roadmap.phase2.duration) {
        currentPhase = 'phase2';
        const phase2Days = daysElapsed - onboarding.roadmap.phase1.duration;
        phaseProgress = (phase2Days / onboarding.roadmap.phase2.duration) * 100;
      } else if (daysElapsed <= onboarding.roadmap.phase1.duration + onboarding.roadmap.phase2.duration + onboarding.roadmap.phase3.duration) {
        currentPhase = 'phase3';
        const phase3Days = daysElapsed - onboarding.roadmap.phase1.duration - onboarding.roadmap.phase2.duration;
        phaseProgress = (phase3Days / onboarding.roadmap.phase3.duration) * 100;
      } else {
        currentPhase = 'phase4';
        const phase4Days = daysElapsed - onboarding.roadmap.phase1.duration - onboarding.roadmap.phase2.duration - onboarding.roadmap.phase3.duration;
        phaseProgress = (phase4Days / onboarding.roadmap.phase4.duration) * 100;
      }

      // Get user stats
      const TestSession = mongoose.model('TestSession');
      const testSessions = await TestSession.find({ userId }).sort({ completedAt: -1 }).limit(10);
      
      const totalTests = testSessions.length;
      const averageScore = testSessions.length > 0 
        ? testSessions.reduce((sum, test) => sum + test.score, 0) / testSessions.length 
        : 0;

      const dashboardData = {
        exam: {
          name: onboarding.examName,
          id: onboarding.exam,
          targetDate: onboarding.targetDate
        },
        progress: {
          overall: progressPercentage,
          currentPhase,
          phaseProgress,
          daysElapsed,
          daysRemaining: Math.max(0, totalDays - daysElapsed)
        },
        roadmap: onboarding.roadmap,
        goals: onboarding.goals,
        stats: {
          totalTests,
          averageScore,
          studyTimePerDay: onboarding.studyTimePerDay,
          preferredSubjects: onboarding.preferredSubjects
        },
        recommendations: this.generateRecommendations(onboarding, currentPhase, averageScore)
      };

      return {
        success: true,
        data: dashboardData
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(onboarding, currentPhase, averageScore) {
    const recommendations = [];
    const currentPhaseData = onboarding.roadmap[currentPhase];

    // Phase-specific recommendations
    if (currentPhase === 'phase1') {
      recommendations.push('Focus on building strong fundamentals');
      recommendations.push(`Practice ${onboarding.goals.dailyQuestions} questions daily`);
      recommendations.push('Take basic concept tests to assess understanding');
    } else if (currentPhase === 'phase2') {
      recommendations.push('Strengthen concepts in all subjects');
      recommendations.push('Increase question difficulty gradually');
      recommendations.push('Focus on time management');
    } else if (currentPhase === 'phase3') {
      recommendations.push('Practice advanced problem-solving');
      recommendations.push('Take full-length mock tests');
      recommendations.push('Work on speed and accuracy');
    } else {
      recommendations.push('Focus on mock test preparation');
      recommendations.push('Revise important topics');
      recommendations.push('Practice time management under pressure');
    }

    // Performance-based recommendations
    if (averageScore < currentPhaseData.targetScore) {
      recommendations.push(`Your current score (${averageScore.toFixed(1)}%) is below the target (${currentPhaseData.targetScore}%). Focus on improving weak areas.`);
    } else {
      recommendations.push(`Great job! Your score (${averageScore.toFixed(1)}%) is above the target. You can move to more challenging topics.`);
    }

    // Time-based recommendations
    const daysRemaining = Math.max(0, onboarding.preparationDays - Math.floor((Date.now() - onboarding.createdAt) / (1000 * 60 * 60 * 24)));
    if (daysRemaining < 30) {
      recommendations.push('Less than 30 days remaining. Focus on revision and mock tests.');
    } else if (daysRemaining < 60) {
      recommendations.push('Less than 60 days remaining. Increase study intensity.');
    }

    return recommendations;
  }

  /**
   * Update onboarding data
   */
  async updateOnboardingData(userId, updateData) {
    try {
      const onboarding = await UserOnboarding.findOneAndUpdate(
        { userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      return {
        success: true,
        data: onboarding
      };
    } catch (error) {
      console.error('Update onboarding error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = { UserOnboarding, OnboardingService }; 