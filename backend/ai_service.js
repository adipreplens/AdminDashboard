// AI Service Functions for Backend
// This file contains all the AI logic for analyzing attempts, generating recommendations, etc.

// Configuration
const USE_REAL_AI = false; // Toggle between real AI and simulation
const REAL_AI_ENDPOINT = 'https://your-ai-service.com/api/ai';

// AI System Prompt for all modes
const SYSTEM_PROMPT = `
You are an intelligent AI tutor for competitive exam preparation (RRB-JE, SSC-JE, UPSC, etc.).
Your role is to analyze user performance, provide personalized recommendations, and answer doubts.

Available modes:
1. analyze_attempt - Analyze user's test/practice/mock performance
2. recommend_path - Recommend learning path and next modules
3. tutor - Answer user doubts with step-by-step explanations

IMPORTANT RULES:
- Always respond in valid JSON format
- Never use markdown or plain text
- Include confidence scores (0.0 to 1.0)
- Flag answers that need human review
- Provide actionable recommendations
- Use step-by-step explanations for tutor mode
`;

// 1. Generate AI Analysis for Attempt Data
async function generateAIAnalysis(attemptData, examType, mode) {
  try {
    if (USE_REAL_AI) {
      return await callRealAI('analyze_attempt', {
        attemptData,
        examType,
        mode
      });
    }

    // Simulated AI analysis
    const topics = {};
    let totalCorrect = 0;
    let totalTime = 0;
    
    // Analyze attempt data
    for (const attempt of attemptData) {
      const subject = attempt.subject || 'unknown';
      const isCorrect = attempt.isCorrect || false;
      const timeSpent = attempt.timeSpent || 0;
      const difficulty = attempt.difficulty || 1;
      
      if (!topics[subject]) {
        topics[subject] = {
          totalQuestions: 0,
          correctAnswers: 0,
          totalTime: 0,
          difficultyBreakdown: {0: 0, 1: 0, 2: 0},
          strengths: [],
          weaknesses: [],
        };
      }
      
      const topic = topics[subject];
      topic.totalQuestions += 1;
      topic.totalTime += timeSpent;
      topic.difficultyBreakdown[difficulty] = (topic.difficultyBreakdown[difficulty] || 0) + 1;
      
      if (isCorrect) {
        topic.correctAnswers += 1;
        totalCorrect += 1;
      }
      
      totalTime += timeSpent;
    }
    
    // Calculate accuracy and identify strengths/weaknesses
    const overallAccuracy = attemptData.length > 0 ? (totalCorrect / attemptData.length) * 100 : 0;
    
    Object.keys(topics).forEach(subject => {
      const data = topics[subject];
      const accuracy = (data.correctAnswers / data.totalQuestions) * 100;
      const avgTime = data.totalTime / data.totalQuestions;
      
      data.accuracy = accuracy;
      data.averageTime = avgTime;
      
      if (accuracy >= 80) {
        data.strengths.push(`High accuracy in ${subject}`);
      } else if (accuracy <= 50) {
        data.weaknesses.push(`Low accuracy in ${subject}`);
      }
      
      if (avgTime < 45) {
        data.strengths.push(`Fast problem solving in ${subject}`);
      } else if (avgTime > 90) {
        data.weaknesses.push(`Slow problem solving in ${subject}`);
      }
    });
    
    return {
      overallAccuracy,
      totalQuestions: attemptData.length,
      totalTimeSpent: totalTime,
      averageTimePerQuestion: attemptData.length > 0 ? totalTime / attemptData.length : 0,
      topics,
      strengths: identifyOverallStrengths(topics),
      weaknesses: identifyOverallWeaknesses(topics),
      recommendations: generateTopicRecommendations(topics),
    };
    
  } catch (error) {
    console.error('AI Analysis generation error:', error);
    throw error;
  }
}

// 2. Generate AI Learning Path Recommendations
async function generateAILearningPath(performanceData, examType, preparationMonths, mode) {
  try {
    if (USE_REAL_AI) {
      return await callRealAI('recommend_path', {
        performanceData,
        examType,
        preparationMonths,
        mode
      });
    }

    // Simulated AI recommendations
    const userLevel = calculateUserLevel(preparationMonths);
    const topics = performanceData.topics || {};
    const recommendations = [];
    
    Object.keys(topics).forEach(subject => {
      const data = topics[subject];
      const accuracy = data.accuracy || 0;
      const avgTime = data.averageTime || 0;
      
      if (accuracy < 70) {
        recommendations.push({
          type: 'remedial',
          subject: subject,
          priority: 'high',
          action: 'Focus on fundamental concepts',
          resources: ['Basic theory videos', 'Easy practice questions', 'Concept revision'],
          estimatedTime: '2-3 hours daily',
          difficulty: 'easy',
          targetAccuracy: 70,
        });
      } else if (accuracy >= 70 && accuracy < 85) {
        recommendations.push({
          type: 'practice',
          subject: subject,
          priority: 'medium',
          action: 'Practice medium difficulty questions',
          resources: ['Medium practice sets', 'Previous year questions', 'Mock tests'],
          estimatedTime: '1-2 hours daily',
          difficulty: 'medium',
          targetAccuracy: 85,
        });
      } else {
        recommendations.push({
          type: 'advanced',
          subject: subject,
          priority: 'low',
          action: 'Focus on advanced concepts and speed',
          resources: ['Advanced problems', 'Speed tests', 'Competition level questions'],
          estimatedTime: '30-60 minutes daily',
          difficulty: 'hard',
          targetAccuracy: 90,
        });
      }
    });
    
    return {
      modules: recommendations,
      nextFocusArea: identifyNextFocusArea(topics),
      studyStrategy: generateStudyStrategy(topics),
      estimatedCompletionTime: estimateCompletionTime(recommendations),
      userLevel: userLevel,
      levelName: getLevelName(userLevel),
    };
    
  } catch (error) {
    console.error('AI Learning Path generation error:', error);
    throw error;
  }
}

// 3. Generate AI Tutor Response
async function generateAITutorResponse(question, subject, examType, availableContent, mode) {
  try {
    if (USE_REAL_AI) {
      return await callRealAI('tutor', {
        question,
        subject,
        examType,
        availableContent,
        mode
      });
    }

    // Simulated AI tutor response
    const questionLower = question.toLowerCase();
    const isMathQuestion = questionLower.includes('solve') || questionLower.includes('calculate') || questionLower.includes('find');
    const isConceptQuestion = questionLower.includes('what') || questionLower.includes('explain') || questionLower.includes('how');
    
    if (isMathQuestion) {
      return {
        answer: 'Let me solve this step by step...',
        stepByStep: [
          'Step 1: Identify the given information',
          'Step 2: Apply the relevant formula',
          'Step 3: Solve step by step',
          'Step 4: Verify the answer',
        ],
        finalAnswer: 'The answer is [calculated result]',
        hints: [
          'Remember the key formula for this type of problem',
          'Check your units carefully',
          'Verify your answer makes sense in context',
        ],
        relatedTopics: ['Algebra', 'Arithmetic', 'Problem Solving'],
        confidence: 0.95,
        needsHumanReview: false,
        source: 'AI knowledge base',
      };
    } else if (isConceptQuestion) {
      return {
        answer: 'This concept can be explained as follows...',
        stepByStep: [
          'Step 1: Define the basic concept',
          'Step 2: Explain with examples',
          'Step 3: Connect to related concepts',
          'Step 4: Provide practical applications',
        ],
        finalAnswer: 'The concept is [explanation]',
        hints: [
          'Try to relate this to real-world examples',
          'Connect it to concepts you already know',
          'Practice with simple examples first',
        ],
        relatedTopics: [subject || 'General Knowledge'],
        confidence: 0.88,
        needsHumanReview: false,
        source: 'AI knowledge base',
      };
    } else {
      return {
        answer: 'I understand you\'re asking about this topic...',
        stepByStep: [
          'Step 1: Clarify the question',
          'Step 2: Provide relevant information',
          'Step 3: Give examples',
          'Step 4: Summarize key points',
        ],
        finalAnswer: 'Based on the information available...',
        hints: [
          'Try to be more specific in your question',
          'Provide context if possible',
          'Ask follow-up questions for clarity',
        ],
        relatedTopics: ['General', subject || 'Various'],
        confidence: 0.75,
        needsHumanReview: true,
        source: 'AI interpretation',
        reviewReason: 'Question format unclear, may need human expert review',
      };
    }
    
  } catch (error) {
    console.error('AI Tutor response generation error:', error);
    throw error;
  }
}

// 4. Generate AI Weekly Plan
async function generateAIWeeklyPlan(currentPerformance, examType, preparationMonths, mode) {
  try {
    if (USE_REAL_AI) {
      return await callRealAI('weekly_plan', {
        currentPerformance,
        examType,
        preparationMonths,
        mode
      });
    }

    // Simulated weekly plan
    const userLevel = calculateUserLevel(preparationMonths);
    const days = [];
    const subjects = ['Mathematics', 'Reasoning', 'General Knowledge', 'Engineering'];
    
    for (let i = 0; i < 7; i++) {
      const day = i + 1;
      const subject = subjects[i % subjects.length];
      const focus = i < 3 ? 'Weak areas' : 'Mixed practice';
      
      days.push({
        day: day,
        focus: focus,
        subject: subject,
        tasks: [
          'Complete 20 practice questions',
          'Review 2-3 concepts',
          'Take 1 mini test',
        ],
        estimatedTime: '2-3 hours',
        difficulty: i < 3 ? 'easy' : 'medium',
        resources: [
          'Practice sets',
          'Video lectures',
          'Previous year questions',
        ],
      });
    }
    
    return {
      weekNumber: Math.floor((new Date() - new Date(2024, 0, 1)) / (1000 * 60 * 60 * 24 * 7)) + 1,
      goal: 'Improve overall accuracy by 5%',
      days: days,
      weeklyTargets: {
        questionsToComplete: 140,
        accuracyTarget: 80,
        timeTarget: '14-21 hours',
      },
      adaptationRules: [
        'If accuracy < 70%, reduce difficulty',
        'If time > 3 hours, add more breaks',
        'If consistency < 5 days, adjust schedule',
      ],
      userLevel: userLevel,
      levelName: getLevelName(userLevel),
    };
    
  } catch (error) {
    console.error('AI Weekly Plan generation error:', error);
    throw error;
  }
}

// 5. Generate AI Insights Summary
async function generateAIInsightsSummary(examType, days, preparationMonths, mode) {
  try {
    if (USE_REAL_AI) {
      return await callRealAI('insights_summary', {
        examType,
        days,
        preparationMonths,
        mode
      });
    }

    // Simulated AI insights
    const userLevel = calculateUserLevel(preparationMonths);
    
    return {
      learningTrend: 'Improving',
      consistencyScore: 85,
      focusAreas: ['Mathematics', 'Reasoning'],
      improvementRate: 12.5,
      studyPatterns: {
        bestTime: 'Morning (9-11 AM)',
        optimalDuration: '2-3 hours',
        breakFrequency: 'Every 45 minutes',
      },
      predictedScore: 78,
      confidence: 0.82,
      nextMilestone: 'Achieve 80% accuracy in Mathematics',
      estimatedDaysToMilestone: 14,
      userLevel: userLevel,
      levelName: getLevelName(userLevel),
    };
    
  } catch (error) {
    console.error('AI Insights generation error:', error);
    throw error;
  }
}

// Helper Functions
function calculateUserLevel(preparationMonths) {
  if (preparationMonths <= 6) return 0;      // Easy
  if (preparationMonths <= 12) return 1;     // Medium  
  return 2;                                   // Hard
}

function getLevelName(level) {
  switch (level) {
    case 0: return 'Beginner';
    case 1: return 'Intermediate';
    case 2: return 'Advanced';
    default: return 'Unknown';
  }
}

function identifyOverallStrengths(topics) {
  const strengths = [];
  Object.keys(topics).forEach(subject => {
    const data = topics[subject];
    const accuracy = data.accuracy || 0;
    const avgTime = data.averageTime || 0;
    
    if (accuracy >= 80) strengths.push(`Strong in ${subject}`);
    if (avgTime < 60) strengths.push(`Fast problem solver in ${subject}`);
  });
  return strengths;
}

function identifyOverallWeaknesses(topics) {
  const weaknesses = [];
  Object.keys(topics).forEach(subject => {
    const data = topics[subject];
    const accuracy = data.accuracy || 0;
    const avgTime = data.averageTime || 0;
    
    if (accuracy < 60) weaknesses.push(`Needs improvement in ${subject}`);
    if (avgTime > 90) weaknesses.push(`Slow in ${subject}`);
  });
  return weaknesses;
}

function generateTopicRecommendations(topics) {
  const recommendations = [];
  Object.keys(topics).forEach(subject => {
    const data = topics[subject];
    const accuracy = data.accuracy || 0;
    if (accuracy < 70) {
      recommendations.push(`Focus on ${subject} fundamentals`);
    }
  });
  return recommendations;
}

function identifyNextFocusArea(topics) {
  let weakestSubject = 'General';
  let lowestAccuracy = 100;
  
  Object.keys(topics).forEach(subject => {
    const data = topics[subject];
    const accuracy = data.accuracy || 0;
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy;
      weakestSubject = subject;
    }
  });
  
  return weakestSubject;
}

function generateStudyStrategy(topics) {
  const weakSubjects = Object.keys(topics).filter(subject => {
    const data = topics[subject];
    return (data.accuracy || 0) < 70;
  }).length;
  
  if (weakSubjects >= 3) return 'Comprehensive review approach';
  if (weakSubjects >= 1) return 'Targeted improvement strategy';
  return 'Advanced practice and speed enhancement';
}

function estimateCompletionTime(recommendations) {
  let totalHours = 0;
  recommendations.forEach(rec => {
    const time = rec.estimatedTime;
    if (time.includes('2-3')) totalHours += 2;
    else if (time.includes('1-2')) totalHours += 1;
    else totalHours += 1;
  });
  
  const days = Math.ceil(totalHours / 2);
  return `${days} days`;
}

// Real AI Integration (for future use)
async function callRealAI(mode, data) {
  try {
    const response = await fetch(REAL_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        systemPrompt: SYSTEM_PROMPT,
        mode: mode,
        data: data,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Real AI call failed:', error);
    throw error;
  }
}

module.exports = {
  generateAIAnalysis,
  generateAILearningPath,
  generateAITutorResponse,
  generateAIWeeklyPlan,
  generateAIInsightsSummary,
}; 