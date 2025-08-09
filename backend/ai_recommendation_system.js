const axios = require('axios');
const mongoose = require('mongoose');

// AI Recommendation System for PrepLens
class AIRecommendationSystem {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.useRealAI = process.env.USE_REAL_AI === 'true';
  }

  /**
   * Get personalized next test recommendation
   * Combines fake AI (rule-based) and real AI (OpenAI)
   */
  async getNextTestRecommendation(userId, testType = 'practice') {
    try {
      // Step 1: Get user's test history and performance
      const userHistory = await this.getUserTestHistory(userId);
      
      // Step 2: Analyze performance patterns
      const performanceAnalysis = this.analyzePerformance(userHistory);
      
      // Step 3: Get recommendation (fake AI + real AI)
      const recommendation = await this.generateRecommendation(performanceAnalysis, testType);
      
      // Step 4: Generate or select questions based on recommendation
      const questions = await this.getRecommendedQuestions(recommendation, userId);
      
      return {
        success: true,
        recommendation: recommendation,
        questions: questions,
        analysis: performanceAnalysis
      };
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      return {
        success: false,
        error: 'Failed to generate recommendation',
        fallback: await this.getFallbackQuestions(testType)
      };
    }
  }

  /**
   * Get user's complete test history
   */
  async getUserTestHistory(userId) {
    const TestSession = mongoose.model('TestSession');
    const UserProgress = mongoose.model('UserProgress');
    
    // Get all test sessions
    const testSessions = await TestSession.find({ userId })
      .populate('questions')
      .sort({ completedAt: -1 })
      .limit(20); // Last 20 tests
    
    // Get user progress
    const userProgress = await UserProgress.findOne({ userId });
    
    return {
      testSessions,
      userProgress,
      totalTests: testSessions.length,
      averageScore: testSessions.reduce((sum, test) => sum + test.score, 0) / testSessions.length || 0
    };
  }

  /**
   * Analyze user performance patterns (Fake AI - Rule-based)
   */
  analyzePerformance(userHistory) {
    const { testSessions, userProgress } = userHistory;
    
    if (testSessions.length === 0) {
      return {
        level: 'beginner',
        weakSubjects: [],
        strongSubjects: [],
        recommendedDifficulty: 'easy',
        focusAreas: ['basic_concepts'],
        studyPlan: 'start_with_basics'
      };
    }

    // Analyze subject-wise performance
    const subjectPerformance = {};
    const topicPerformance = {};
    
    testSessions.forEach(session => {
      session.answers.forEach(answer => {
        const subject = answer.question.subject;
        const topic = answer.question.topic;
        const isCorrect = answer.isCorrect;
        
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = { correct: 0, total: 0 };
        }
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0 };
        }
        
        subjectPerformance[subject].total++;
        topicPerformance[topic].total++;
        
        if (isCorrect) {
          subjectPerformance[subject].correct++;
          topicPerformance[topic].correct++;
        }
      });
    });

    // Calculate weak and strong areas
    const weakSubjects = [];
    const strongSubjects = [];
    const weakTopics = [];
    
    Object.entries(subjectPerformance).forEach(([subject, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 60) {
        weakSubjects.push(subject);
      } else if (accuracy > 80) {
        strongSubjects.push(subject);
      }
    });

    Object.entries(topicPerformance).forEach(([topic, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 60) {
        weakTopics.push(topic);
      }
    });

    // Determine recommended difficulty
    const averageScore = userHistory.averageScore;
    let recommendedDifficulty = 'medium';
    
    if (averageScore < 40) {
      recommendedDifficulty = 'easy';
    } else if (averageScore > 80) {
      recommendedDifficulty = 'hard';
    }

    // Determine focus areas
    const focusAreas = weakTopics.length > 0 ? weakTopics.slice(0, 3) : ['general_practice'];
    
    // Generate study plan
    let studyPlan = 'balanced_practice';
    if (weakSubjects.length > 2) {
      studyPlan = 'focus_on_weak_areas';
    } else if (strongSubjects.length > 2) {
      studyPlan = 'build_on_strengths';
    }

    return {
      level: averageScore < 50 ? 'beginner' : averageScore < 80 ? 'intermediate' : 'advanced',
      weakSubjects,
      strongSubjects,
      weakTopics,
      recommendedDifficulty,
      focusAreas,
      studyPlan,
      averageScore,
      totalTests: testSessions.length
    };
  }

  /**
   * Generate recommendation using AI (Real AI + Fake AI)
   */
  async generateRecommendation(performanceAnalysis, testType) {
    if (this.useRealAI && this.openaiApiKey) {
      return await this.generateRealAIRecommendation(performanceAnalysis, testType);
    } else {
      return this.generateFakeAIRecommendation(performanceAnalysis, testType);
    }
  }

  /**
   * Generate recommendation using OpenAI (Real AI)
   */
  async generateRealAIRecommendation(performanceAnalysis, testType) {
    try {
      const prompt = this.buildAIRecommendationPrompt(performanceAnalysis, testType);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational AI that creates personalized test recommendations for government job exam preparation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      // Parse AI response and combine with rule-based logic
      return this.parseAIRecommendation(aiResponse, performanceAnalysis, testType);
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Fallback to fake AI
      return this.generateFakeAIRecommendation(performanceAnalysis, testType);
    }
  }

  /**
   * Generate recommendation using rule-based logic (Fake AI)
   */
  generateFakeAIRecommendation(performanceAnalysis, testType) {
    const { level, weakSubjects, weakTopics, recommendedDifficulty, studyPlan } = performanceAnalysis;
    
    let recommendation = {
      testType: testType,
      difficulty: recommendedDifficulty,
      subjectFocus: weakSubjects.length > 0 ? weakSubjects[0] : 'general',
      topicFocus: weakTopics.length > 0 ? weakTopics.slice(0, 2) : [],
      questionCount: 20,
      timeLimit: 30,
      reasoning: this.generateReasoning(performanceAnalysis, testType)
    };

    // Adjust based on test type
    switch (testType) {
      case 'practice':
        recommendation.questionCount = 15;
        recommendation.timeLimit = 25;
        break;
      case 'section_test':
        recommendation.questionCount = 25;
        recommendation.timeLimit = 45;
        break;
      case 'mock_test':
        recommendation.questionCount = 50;
        recommendation.timeLimit = 90;
        break;
      case 'test_series':
        recommendation.questionCount = 30;
        recommendation.timeLimit = 60;
        break;
    }

    // Adjust based on study plan
    if (studyPlan === 'focus_on_weak_areas') {
      recommendation.subjectFocus = weakSubjects[0] || 'general';
      recommendation.topicFocus = weakTopics.slice(0, 3);
    } else if (studyPlan === 'build_on_strengths') {
      recommendation.subjectFocus = 'balanced';
      recommendation.topicFocus = ['mixed_topics'];
    }

    return recommendation;
  }

  /**
   * Build prompt for OpenAI
   */
  buildAIRecommendationPrompt(performanceAnalysis, testType) {
    return `
Based on this user's performance analysis, recommend the next test:

User Level: ${performanceAnalysis.level}
Average Score: ${performanceAnalysis.averageScore}%
Total Tests Taken: ${performanceAnalysis.totalTests}
Weak Subjects: ${performanceAnalysis.weakSubjects.join(', ')}
Weak Topics: ${performanceAnalysis.weakTopics.join(', ')}
Strong Subjects: ${performanceAnalysis.strongSubjects.join(', ')}
Study Plan: ${performanceAnalysis.studyPlan}

Test Type Requested: ${testType}

Please recommend:
1. Focus subjects (max 2)
2. Focus topics (max 3)
3. Difficulty level (easy/medium/hard)
4. Question count
5. Time limit
6. Reasoning for this recommendation

Format your response as JSON:
{
  "subjectFocus": ["subject1", "subject2"],
  "topicFocus": ["topic1", "topic2", "topic3"],
  "difficulty": "medium",
  "questionCount": 20,
  "timeLimit": 30,
  "reasoning": "explanation here"
}
    `;
  }

  /**
   * Parse AI response and combine with rule-based logic
   */
  parseAIRecommendation(aiResponse, performanceAnalysis, testType) {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const aiRecommendation = JSON.parse(jsonMatch[0]);
      
      // Combine with rule-based logic
      return {
        testType: testType,
        difficulty: aiRecommendation.difficulty || performanceAnalysis.recommendedDifficulty,
        subjectFocus: aiRecommendation.subjectFocus?.[0] || performanceAnalysis.weakSubjects[0] || 'general',
        topicFocus: aiRecommendation.topicFocus || performanceAnalysis.weakTopics.slice(0, 2),
        questionCount: aiRecommendation.questionCount || 20,
        timeLimit: aiRecommendation.timeLimit || 30,
        reasoning: aiRecommendation.reasoning || this.generateReasoning(performanceAnalysis, testType),
        aiGenerated: true
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.generateFakeAIRecommendation(performanceAnalysis, testType);
    }
  }

  /**
   * Generate reasoning for recommendation
   */
  generateReasoning(performanceAnalysis, testType) {
    const { level, weakSubjects, weakTopics, averageScore } = performanceAnalysis;
    
    let reasoning = `Based on your ${averageScore}% average score and ${performanceAnalysis.totalTests} tests taken, `;
    
    if (weakSubjects.length > 0) {
      reasoning += `I recommend focusing on ${weakSubjects[0]} as it's your weakest area. `;
    }
    
    if (weakTopics.length > 0) {
      reasoning += `The test will include questions on ${weakTopics.slice(0, 2).join(' and ')} to help you improve. `;
    }
    
    reasoning += `This ${testType.replace('_', ' ')} will help you build confidence and improve your performance.`;
    
    return reasoning;
  }

  /**
   * Get recommended questions based on AI recommendation
   */
  async getRecommendedQuestions(recommendation, userId) {
    const Question = mongoose.model('Question');
    
    // Build query based on recommendation
    const query = {
      publishStatus: 'published',
      isPremium: false // Start with free questions
    };

    // Add subject filter
    if (recommendation.subjectFocus && recommendation.subjectFocus !== 'general' && recommendation.subjectFocus !== 'balanced') {
      query.subject = recommendation.subjectFocus;
    }

    // Add difficulty filter
    if (recommendation.difficulty) {
      query.difficulty = recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1);
    }

    // Add topic filter
    if (recommendation.topicFocus && recommendation.topicFocus.length > 0) {
      query.topic = { $in: recommendation.topicFocus };
    }

    // Exclude questions user has already attempted
    const userHistory = await this.getUserTestHistory(userId);
    const attemptedQuestionIds = userHistory.testSessions
      .flatMap(session => session.answers.map(answer => answer.questionId))
      .filter(id => id);

    if (attemptedQuestionIds.length > 0) {
      query._id = { $nin: attemptedQuestionIds };
    }

    // Get questions
    let questions = await Question.find(query)
      .limit(recommendation.questionCount)
      .sort({ difficulty: 1 }); // Start with easier questions

    // If not enough questions, relax filters
    if (questions.length < recommendation.questionCount) {
      const relaxedQuery = { ...query };
      delete relaxedQuery.subject;
      delete relaxedQuery.topic;
      
      const additionalQuestions = await Question.find(relaxedQuery)
        .limit(recommendation.questionCount - questions.length)
        .sort({ difficulty: 1 });
      
      questions = [...questions, ...additionalQuestions];
    }

    // If still not enough, get any available questions
    if (questions.length < recommendation.questionCount) {
      const fallbackQuestions = await Question.find({ publishStatus: 'published' })
        .limit(recommendation.questionCount - questions.length);
      
      questions = [...questions, ...fallbackQuestions];
    }

    return questions.slice(0, recommendation.questionCount);
  }

  /**
   * Get fallback questions if AI fails
   */
  async getFallbackQuestions(testType) {
    const Question = mongoose.model('Question');
    
    const questionCount = testType === 'practice' ? 15 : 20;
    
    return await Question.find({ publishStatus: 'published' })
      .limit(questionCount)
      .sort({ difficulty: 1 });
  }

  /**
   * Get personalized study plan
   */
  async getPersonalizedStudyPlan(userId) {
    const performanceAnalysis = this.analyzePerformance(await this.getUserTestHistory(userId));
    
    const studyPlan = {
      dailyGoal: this.calculateDailyGoal(performanceAnalysis),
      weeklyTarget: this.calculateWeeklyTarget(performanceAnalysis),
      focusAreas: performanceAnalysis.weakTopics.slice(0, 3),
      recommendedTests: this.getRecommendedTestSequence(performanceAnalysis),
      tips: this.generateStudyTips(performanceAnalysis)
    };

    return studyPlan;
  }

  /**
   * Calculate daily study goal
   */
  calculateDailyGoal(performanceAnalysis) {
    const { level, averageScore } = performanceAnalysis;
    
    switch (level) {
      case 'beginner':
        return { questions: 20, time: 30, tests: 1 };
      case 'intermediate':
        return { questions: 30, time: 45, tests: 2 };
      case 'advanced':
        return { questions: 40, time: 60, tests: 2 };
      default:
        return { questions: 25, time: 40, tests: 1 };
    }
  }

  /**
   * Calculate weekly target
   */
  calculateWeeklyTarget(performanceAnalysis) {
    const dailyGoal = this.calculateDailyGoal(performanceAnalysis);
    
    return {
      questions: dailyGoal.questions * 7,
      time: dailyGoal.time * 7,
      tests: dailyGoal.tests * 7,
      targetScore: Math.min(100, performanceAnalysis.averageScore + 10)
    };
  }

  /**
   * Get recommended test sequence
   */
  getRecommendedTestSequence(performanceAnalysis) {
    const { level, weakSubjects } = performanceAnalysis;
    
    const sequence = [];
    
    if (level === 'beginner') {
      sequence.push('practice', 'practice', 'section_test', 'practice', 'mock_test');
    } else if (level === 'intermediate') {
      sequence.push('section_test', 'practice', 'mock_test', 'section_test', 'test_series');
    } else {
      sequence.push('mock_test', 'test_series', 'section_test', 'mock_test', 'live_test');
    }
    
    return sequence;
  }

  /**
   * Generate personalized study tips
   */
  generateStudyTips(performanceAnalysis) {
    const { level, weakSubjects, weakTopics, averageScore } = performanceAnalysis;
    
    const tips = [];
    
    if (averageScore < 50) {
      tips.push('Focus on understanding basic concepts before attempting advanced questions');
      tips.push('Take more practice tests to build confidence');
    }
    
    if (weakSubjects.length > 0) {
      tips.push(`Spend extra time on ${weakSubjects[0]} - your weakest subject`);
    }
    
    if (weakTopics.length > 0) {
      tips.push(`Review ${weakTopics.slice(0, 2).join(' and ')} topics thoroughly`);
    }
    
    if (level === 'beginner') {
      tips.push('Start with easy questions and gradually increase difficulty');
    } else if (level === 'advanced') {
      tips.push('Focus on time management and accuracy in mock tests');
    }
    
    return tips;
  }
}

module.exports = AIRecommendationSystem; 