const mongoose = require('mongoose');

// Subject-based Test Service
class SubjectBasedTestService {
  constructor() {
    // Subject mapping for different exams
    this.subjectMapping = {
      'ssc-cgl': {
        'general-awareness': {
          name: 'General Awareness',
          description: 'History, Geography, Polity, Economics, Science, Current Events',
          totalQuestions: 25,
          timeLimit: 20
        },
        'quantitative-aptitude': {
          name: 'Quantitative Aptitude',
          description: 'Number System, Algebra, Geometry, Trigonometry, Data Interpretation, Arithmetic',
          totalQuestions: 25,
          timeLimit: 25
        },
        'english-comprehension': {
          name: 'English Comprehension',
          description: 'Grammar, Vocabulary, Comprehension, Synonyms, Antonyms',
          totalQuestions: 25,
          timeLimit: 20
        },
        'general-intelligence-reasoning': {
          name: 'General Intelligence and Reasoning',
          description: 'Analogies, Coding-Decoding, Blood Relations, Series, Syllogism, Venn Diagrams',
          totalQuestions: 25,
          timeLimit: 20
        }
      },
      'ssc-chsl': {
        'general-awareness': {
          name: 'General Awareness',
          description: 'Current Affairs, History, Geography, Polity, Economics',
          totalQuestions: 25,
          timeLimit: 20
        },
        'quantitative-aptitude': {
          name: 'Quantitative Aptitude',
          description: 'Number System, Time & Work, Profit & Loss, Simplification',
          totalQuestions: 25,
          timeLimit: 25
        },
        'english-language': {
          name: 'English Language and Comprehension',
          description: 'Grammar, Vocabulary, Reading Comprehension',
          totalQuestions: 25,
          timeLimit: 20
        },
        'general-intelligence': {
          name: 'General Intelligence',
          description: 'Verbal and Non-Verbal Reasoning, Series, Puzzles, Analogy',
          totalQuestions: 25,
          timeLimit: 20
        }
      },
      'rrb-je': {
        'mathematics': {
          name: 'Mathematics',
          description: 'Number System, Algebra, Geometry, Trigonometry, Statistics',
          totalQuestions: 30,
          timeLimit: 30
        },
        'reasoning': {
          name: 'Reasoning',
          description: 'Analogies, Coding-Decoding, Blood Relations, Series, Syllogism',
          totalQuestions: 30,
          timeLimit: 25
        },
        'general-knowledge': {
          name: 'General Knowledge',
          description: 'History, Geography, Polity, Economics, Science, Current Affairs',
          totalQuestions: 30,
          timeLimit: 20
        },
        'civil-engineering': {
          name: 'Civil Engineering',
          description: 'Building Materials, Structural Analysis, Concrete Technology, Soil Mechanics, Hydraulics, Transportation',
          totalQuestions: 30,
          timeLimit: 30
        },
        'mechanical-engineering': {
          name: 'Mechanical Engineering',
          description: 'Thermodynamics, Fluid Mechanics, Strength of Materials, Machine Design, Manufacturing',
          totalQuestions: 30,
          timeLimit: 30
        },
        'electrical-engineering': {
          name: 'Electrical Engineering',
          description: 'Electrical Machines, Power Systems, Electronics, Control Systems, Measurements',
          totalQuestions: 30,
          timeLimit: 30
        }
      },
      'rrb-alp': {
        'mathematics': {
          name: 'Mathematics',
          description: 'Number System, Algebra, Geometry, Statistics',
          totalQuestions: 30,
          timeLimit: 30
        },
        'general-intelligence-reasoning': {
          name: 'General Intelligence and Reasoning',
          description: 'Analogies, Venn Diagrams, Syllogism, Puzzles',
          totalQuestions: 30,
          timeLimit: 25
        },
        'general-awareness': {
          name: 'General Awareness',
          description: 'History, Geography, Polity, Current Affairs',
          totalQuestions: 30,
          timeLimit: 20
        },
        'general-science': {
          name: 'General Science',
          description: 'Physics, Chemistry, Biology',
          totalQuestions: 30,
          timeLimit: 25
        }
      },
      'rrb-ntpc': {
        'general-awareness': {
          name: 'General Awareness',
          description: 'History, Geography, Polity, Economy, Current Affairs, Environment',
          totalQuestions: 30,
          timeLimit: 20
        },
        'mathematics': {
          name: 'Mathematics',
          description: 'Number System, Algebra, Profit and Loss, Geometry, SI & CI',
          totalQuestions: 30,
          timeLimit: 30
        },
        'general-intelligence-reasoning': {
          name: 'General Intelligence and Reasoning',
          description: 'Coding-Decoding, Classification, Statement & Conclusion, Analogy',
          totalQuestions: 30,
          timeLimit: 25
        },
        'general-science': {
          name: 'General Science',
          description: 'Physics, Chemistry, Biology',
          totalQuestions: 30,
          timeLimit: 25
        }
      }
    };
  }

  /**
   * Get available subjects for an exam
   */
  getSubjectsForExam(examId) {
    const examSubjects = this.subjectMapping[examId];
    if (!examSubjects) {
      return [];
    }

    return Object.entries(examSubjects).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      totalQuestions: value.totalQuestions,
      timeLimit: value.timeLimit
    }));
  }

  /**
   * Get subject details
   */
  getSubjectDetails(examId, subjectId) {
    const examSubjects = this.subjectMapping[examId];
    if (!examSubjects || !examSubjects[subjectId]) {
      return null;
    }

    return {
      id: subjectId,
      name: examSubjects[subjectId].name,
      description: examSubjects[subjectId].description,
      totalQuestions: examSubjects[subjectId].totalQuestions,
      timeLimit: examSubjects[subjectId].timeLimit
    };
  }

  /**
   * Start a subject-based test
   */
  async startSubjectTest(examId, subjectId, userId, options = {}) {
    try {
      const Question = mongoose.model('Question');
      const TestSession = mongoose.model('TestSession');

      // Get subject details
      const subjectDetails = this.getSubjectDetails(examId, subjectId);
      if (!subjectDetails) {
        return {
          success: false,
          error: 'Subject not found'
        };
      }

      // Build query for questions
      const query = {
        exam: examId,
        subject: subjectId,
        publishStatus: 'published'
      };

      // Add difficulty filter if specified
      if (options.difficulty) {
        query.difficulty = options.difficulty;
      }

      // Add language filter if specified
      if (options.language) {
        query.language = options.language;
      }

      // Get questions
      const questions = await Question.find(query)
        .limit(subjectDetails.totalQuestions)
        .sort({ createdAt: -1 });

      if (questions.length === 0) {
        return {
          success: false,
          error: 'No questions available for this subject'
        };
      }

      // Create test session
      const testSession = new TestSession({
        userId,
        exam: examId,
        subject: subjectId,
        testType: 'subject-test',
        questions: questions.map(q => ({
          questionId: q._id,
          text: q.text,
          options: q.options,
          answer: q.answer,
          subject: q.subject,
          difficulty: q.difficulty,
          tags: q.tags,
          marks: q.marks,
          timeLimit: q.timeLimit,
          solution: q.solution,
          explanation: q.explanation,
          isCorrect: false,
          userAnswer: null,
          timeSpent: 0
        })),
        totalQuestions: questions.length,
        timeLimit: subjectDetails.timeLimit * 60, // Convert to seconds
        startTime: new Date(),
        status: 'in-progress'
      });

      await testSession.save();

      return {
        success: true,
        data: {
          sessionId: testSession._id,
          subject: subjectDetails,
          questions: questions.map(q => ({
            id: q._id,
            text: q.text,
            options: q.options,
            subject: q.subject,
            difficulty: q.difficulty,
            marks: q.marks,
            timeLimit: q.timeLimit
          })),
          totalQuestions: questions.length,
          timeLimit: subjectDetails.timeLimit * 60
        }
      };
    } catch (error) {
      console.error('Start subject test error:', error);
      return {
        success: false,
        error: 'Failed to start subject test'
      };
    }
  }

  /**
   * Submit answer for a question
   */
  async submitAnswer(sessionId, questionId, userAnswer, timeSpent) {
    try {
      const TestSession = mongoose.model('TestSession');

      const testSession = await TestSession.findById(sessionId);
      if (!testSession) {
        return {
          success: false,
          error: 'Test session not found'
        };
      }

      // Find the question in the session
      const questionIndex = testSession.questions.findIndex(q => q.questionId.toString() === questionId);
      if (questionIndex === -1) {
        return {
          success: false,
          error: 'Question not found in test session'
        };
      }

      // Update the question
      const question = testSession.questions[questionIndex];
      question.userAnswer = userAnswer;
      question.timeSpent = timeSpent;
      question.isCorrect = userAnswer === question.answer;

      await testSession.save();

      return {
        success: true,
        data: {
          isCorrect: question.isCorrect,
          correctAnswer: question.answer,
          solution: question.solution,
          explanation: question.explanation
        }
      };
    } catch (error) {
      console.error('Submit answer error:', error);
      return {
        success: false,
        error: 'Failed to submit answer'
      };
    }
  }

  /**
   * Complete subject test
   */
  async completeSubjectTest(sessionId) {
    try {
      const TestSession = mongoose.model('TestSession');
      const UserProgress = mongoose.model('UserProgress');

      const testSession = await TestSession.findById(sessionId);
      if (!testSession) {
        return {
          success: false,
          error: 'Test session not found'
        };
      }

      // Calculate results
      const totalQuestions = testSession.questions.length;
      const correctAnswers = testSession.questions.filter(q => q.isCorrect).length;
      const score = (correctAnswers / totalQuestions) * 100;
      const totalTimeSpent = testSession.questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

      // Update test session
      testSession.status = 'completed';
      testSession.completedAt = new Date();
      testSession.score = score;
      testSession.correctAnswers = correctAnswers;
      testSession.totalTimeSpent = totalTimeSpent;

      await testSession.save();

      // Update user progress
      await UserProgress.findOneAndUpdate(
        {
          userId: testSession.userId,
          exam: testSession.exam,
          subject: testSession.subject
        },
        {
          $inc: {
            totalQuestionsAttempted: totalQuestions,
            totalCorrectAnswers: correctAnswers,
            totalTimeSpent: totalTimeSpent
          },
          $set: {
            lastTestDate: new Date(),
            averageAccuracy: score
          }
        },
        { upsert: true, new: true }
      );

      return {
        success: true,
        data: {
          sessionId: testSession._id,
          score,
          correctAnswers,
          totalQuestions,
          totalTimeSpent,
          questions: testSession.questions.map(q => ({
            id: q.questionId,
            text: q.text,
            options: q.options,
            correctAnswer: q.answer,
            userAnswer: q.userAnswer,
            isCorrect: q.isCorrect,
            solution: q.solution,
            explanation: q.explanation,
            timeSpent: q.timeSpent
          }))
        }
      };
    } catch (error) {
      console.error('Complete subject test error:', error);
      return {
        success: false,
        error: 'Failed to complete subject test'
      };
    }
  }

  /**
   * Get subject test history
   */
  async getSubjectTestHistory(userId, examId, subjectId) {
    try {
      const TestSession = mongoose.model('TestSession');

      const testSessions = await TestSession.find({
        userId,
        exam: examId,
        subject: subjectId,
        testType: 'subject-test'
      })
      .sort({ completedAt: -1 })
      .limit(10);

      return {
        success: true,
        data: testSessions.map(session => ({
          id: session._id,
          score: session.score,
          correctAnswers: session.correctAnswers,
          totalQuestions: session.totalQuestions,
          totalTimeSpent: session.totalTimeSpent,
          completedAt: session.completedAt
        }))
      };
    } catch (error) {
      console.error('Get subject test history error:', error);
      return {
        success: false,
        error: 'Failed to get test history'
      };
    }
  }

  /**
   * Get subject performance analytics
   */
  async getSubjectPerformance(userId, examId, subjectId) {
    try {
      const TestSession = mongoose.model('TestSession');
      const UserProgress = mongoose.model('UserProgress');

      // Get recent test sessions
      const recentSessions = await TestSession.find({
        userId,
        exam: examId,
        subject: subjectId,
        testType: 'subject-test',
        status: 'completed'
      })
      .sort({ completedAt: -1 })
      .limit(5);

      // Get user progress
      const userProgress = await UserProgress.findOne({
        userId,
        exam: examId,
        subject: subjectId
      });

      // Calculate analytics
      const totalTests = recentSessions.length;
      const averageScore = totalTests > 0 
        ? recentSessions.reduce((sum, session) => sum + session.score, 0) / totalTests 
        : 0;

      const bestScore = totalTests > 0 
        ? Math.max(...recentSessions.map(session => session.score))
        : 0;

      const improvement = totalTests > 1 
        ? recentSessions[0].score - recentSessions[recentSessions.length - 1].score
        : 0;

      return {
        success: true,
        data: {
          totalTests,
          averageScore,
          bestScore,
          improvement,
          recentSessions: recentSessions.map(session => ({
            id: session._id,
            score: session.score,
            correctAnswers: session.correctAnswers,
            totalQuestions: session.totalQuestions,
            completedAt: session.completedAt
          })),
          userProgress: userProgress ? {
            totalQuestionsAttempted: userProgress.totalQuestionsAttempted,
            totalCorrectAnswers: userProgress.totalCorrectAnswers,
            averageAccuracy: userProgress.averageAccuracy,
            lastTestDate: userProgress.lastTestDate
          } : null
        }
      };
    } catch (error) {
      console.error('Get subject performance error:', error);
      return {
        success: false,
        error: 'Failed to get performance analytics'
      };
    }
  }
}

module.exports = { SubjectBasedTestService }; 