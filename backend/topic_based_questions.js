const mongoose = require('mongoose');

// Topic-based Question Service
class TopicBasedQuestionService {
  constructor() {
    // Topic mapping based on the Google Sheets syllabus
    this.topicMapping = {
      'ssc-cgl': {
        'general-awareness': {
          name: 'General Awareness',
          topics: ['history', 'geography', 'polity', 'economics', 'science', 'current-events']
        },
        'quantitative-aptitude': {
          name: 'Quantitative Aptitude',
          topics: ['number-system', 'algebra', 'geometry', 'trigonometry', 'data-interpretation', 'arithmetic']
        },
        'english-comprehension': {
          name: 'English Comprehension',
          topics: ['grammar', 'vocabulary', 'comprehension', 'synonyms', 'antonyms']
        },
        'general-intelligence-reasoning': {
          name: 'General Intelligence and Reasoning',
          topics: ['analogies', 'coding-decoding', 'blood-relations', 'series', 'syllogism', 'venn-diagrams']
        }
      },
      'ssc-chsl': {
        'general-awareness': {
          name: 'General Awareness',
          topics: ['current-affairs', 'history', 'geography', 'polity', 'economics']
        },
        'quantitative-aptitude': {
          name: 'Quantitative Aptitude',
          topics: ['number-system', 'time-work', 'profit-loss', 'simplification']
        },
        'english-language': {
          name: 'English Language and Comprehension',
          topics: ['grammar', 'vocabulary', 'reading-comprehension']
        },
        'general-intelligence': {
          name: 'General Intelligence',
          topics: ['verbal-reasoning', 'non-verbal-reasoning', 'series', 'puzzles', 'analogy']
        }
      },
      'rrb-ntpc': {
        'general-awareness': {
          name: 'General Awareness',
          topics: ['history', 'geography', 'polity', 'economy', 'current-affairs', 'environment']
        },
        'mathematics': {
          name: 'Mathematics',
          topics: ['number-system', 'algebra', 'profit-loss', 'geometry', 'si-ci']
        },
        'general-intelligence-reasoning': {
          name: 'General Intelligence and Reasoning',
          topics: ['coding-decoding', 'classification', 'statement-conclusion', 'analogy']
        },
        'general-science': {
          name: 'General Science',
          topics: ['physics', 'chemistry', 'biology']
        }
      },
      'rrb-alp': {
        'mathematics': {
          name: 'Mathematics',
          topics: ['number-system', 'algebra', 'geometry', 'statistics']
        },
        'general-intelligence-reasoning': {
          name: 'General Intelligence and Reasoning',
          topics: ['analogies', 'venn-diagrams', 'syllogism', 'puzzles']
        },
        'general-awareness': {
          name: 'General Awareness',
          topics: ['history', 'geography', 'polity', 'current-affairs']
        },
        'general-science': {
          name: 'General Science',
          topics: ['physics', 'chemistry', 'biology']
        }
      },
      'rrb-je': {
        'mathematics': {
          name: 'Mathematics',
          topics: ['number-system', 'algebra', 'geometry', 'trigonometry', 'statistics']
        },
        'reasoning': {
          name: 'Reasoning',
          topics: ['analogies', 'coding-decoding', 'blood-relations', 'series', 'syllogism']
        },
        'general-knowledge': {
          name: 'General Knowledge',
          topics: ['history', 'geography', 'polity', 'economics', 'science', 'current-affairs']
        },
        'civil-engineering': {
          name: 'Civil Engineering',
          topics: ['building-materials', 'structural-analysis', 'concrete-technology', 'soil-mechanics', 'hydraulics', 'transportation']
        },
        'mechanical-engineering': {
          name: 'Mechanical Engineering',
          topics: ['thermodynamics', 'fluid-mechanics', 'strength-of-materials', 'machine-design', 'manufacturing']
        },
        'electrical-engineering': {
          name: 'Electrical Engineering',
          topics: ['electrical-machines', 'power-systems', 'electronics', 'control-systems', 'measurements']
        }
      },
      'ssc-je': {
        'general-intelligence-reasoning': {
          name: 'General Intelligence and Reasoning',
          topics: ['analogies', 'spatial-visualization', 'problem-solving', 'judgment']
        },
        'general-awareness': {
          name: 'General Awareness',
          topics: ['current-affairs', 'history', 'geography', 'polity', 'economics', 'science']
        },
        'civil-engineering': {
          name: 'Civil Engineering',
          topics: ['building-materials', 'structural-analysis', 'concrete-technology', 'soil-mechanics', 'hydraulics']
        },
        'mechanical-engineering': {
          name: 'Mechanical Engineering',
          topics: ['thermodynamics', 'fluid-mechanics', 'strength-of-materials', 'machine-design']
        },
        'electrical-engineering': {
          name: 'Electrical Engineering',
          topics: ['electrical-machines', 'power-systems', 'electronics', 'control-systems']
        }
      }
    };
  }

  /**
   * Get available subjects for an exam
   */
  getSubjectsForExam(examId) {
    const examTopics = this.topicMapping[examId];
    if (!examTopics) {
      return [];
    }

    return Object.entries(examTopics).map(([key, value]) => ({
      id: key,
      name: value.name,
      topics: value.topics
    }));
  }

  /**
   * Get available topics for a subject
   */
  getTopicsForSubject(examId, subjectId) {
    const examTopics = this.topicMapping[examId];
    if (!examTopics || !examTopics[subjectId]) {
      return [];
    }

    return examTopics[subjectId].topics.map(topic => ({
      id: topic,
      name: this.formatTopicName(topic)
    }));
  }

  /**
   * Get questions by topic
   */
  async getQuestionsByTopic(examId, subjectId, topicId, options = {}) {
    try {
      const Question = mongoose.model('Question');
      
      const query = {
        exam: examId,
        publishStatus: 'published'
      };

      // Add subject filter
      if (subjectId) {
        query.subject = subjectId;
      }

      // Add topic filter using tags
      if (topicId) {
        query.tags = { $in: [topicId] };
      }

      // Add difficulty filter
      if (options.difficulty) {
        query.difficulty = options.difficulty;
      }

      // Add language filter
      if (options.language) {
        query.language = options.language;
      }

      // Add limit
      const limit = options.limit || 50;
      const skip = options.skip || 0;

      const questions = await Question.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await Question.countDocuments(query);

      return {
        success: true,
        data: {
          questions,
          total,
          hasMore: total > skip + questions.length
        }
      };
    } catch (error) {
      console.error('Get questions by topic error:', error);
      return {
        success: false,
        error: 'Failed to get questions by topic'
      };
    }
  }

  /**
   * Get questions by multiple topics
   */
  async getQuestionsByTopics(examId, topics, options = {}) {
    try {
      const Question = mongoose.model('Question');
      
      const query = {
        exam: examId,
        publishStatus: 'published',
        tags: { $in: topics }
      };

      // Add difficulty filter
      if (options.difficulty) {
        query.difficulty = options.difficulty;
      }

      // Add language filter
      if (options.language) {
        query.language = options.language;
      }

      // Add limit
      const limit = options.limit || 50;
      const skip = options.skip || 0;

      const questions = await Question.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await Question.countDocuments(query);

      return {
        success: true,
        data: {
          questions,
          total,
          hasMore: total > skip + questions.length
        }
      };
    } catch (error) {
      console.error('Get questions by topics error:', error);
      return {
        success: false,
        error: 'Failed to get questions by topics'
      };
    }
  }

  /**
   * Get topic-wise question count
   */
  async getTopicQuestionCount(examId) {
    try {
      const Question = mongoose.model('Question');
      
      const examTopics = this.topicMapping[examId];
      if (!examTopics) {
        return {
          success: false,
          error: 'Exam not found'
        };
      }

      const topicCounts = {};

      for (const [subjectId, subjectData] of Object.entries(examTopics)) {
        topicCounts[subjectId] = {
          name: subjectData.name,
          topics: {}
        };

        for (const topic of subjectData.topics) {
          const count = await Question.countDocuments({
            exam: examId,
            tags: { $in: [topic] },
            publishStatus: 'published'
          });

          topicCounts[subjectId].topics[topic] = {
            name: this.formatTopicName(topic),
            count
          };
        }
      }

      return {
        success: true,
        data: topicCounts
      };
    } catch (error) {
      console.error('Get topic question count error:', error);
      return {
        success: false,
        error: 'Failed to get topic question count'
      };
    }
  }

  /**
   * Get recommended topics based on user performance
   */
  async getRecommendedTopics(userId, examId) {
    try {
      const TestSession = mongoose.model('TestSession');
      const UserProgress = mongoose.model('UserProgress');

      // Get user's test history
      const testSessions = await TestSession.find({
        userId,
        exam: examId
      }).sort({ completedAt: -1 }).limit(10);

      // Get user's progress data
      const userProgress = await UserProgress.findOne({
        userId,
        exam: examId
      });

      const examTopics = this.topicMapping[examId];
      if (!examTopics) {
        return {
          success: false,
          error: 'Exam not found'
        };
      }

      const recommendedTopics = [];

      // Analyze performance and recommend weak topics
      for (const [subjectId, subjectData] of Object.entries(examTopics)) {
        for (const topic of subjectData.topics) {
          // Check if user has attempted questions from this topic
          const topicAttempts = testSessions.filter(session => 
            session.questions.some(q => q.tags && q.tags.includes(topic))
          );

          if (topicAttempts.length === 0) {
            // User hasn't attempted this topic - recommend it
            recommendedTopics.push({
              subjectId,
              subjectName: subjectData.name,
              topicId: topic,
              topicName: this.formatTopicName(topic),
              reason: 'Not attempted yet',
              priority: 'high'
            });
          } else {
            // Calculate average performance for this topic
            const topicScores = topicAttempts.map(session => {
              const topicQuestions = session.questions.filter(q => 
                q.tags && q.tags.includes(topic)
              );
              const correctAnswers = topicQuestions.filter(q => q.isCorrect).length;
              return (correctAnswers / topicQuestions.length) * 100;
            });

            const averageScore = topicScores.reduce((sum, score) => sum + score, 0) / topicScores.length;

            if (averageScore < 70) {
              recommendedTopics.push({
                subjectId,
                subjectName: subjectData.name,
                topicId: topic,
                topicName: this.formatTopicName(topic),
                reason: `Low performance (${averageScore.toFixed(1)}%)`,
                priority: 'medium',
                score: averageScore
              });
            }
          }
        }
      }

      // Sort by priority and score
      recommendedTopics.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return (a.score || 0) - (b.score || 0);
      });

      return {
        success: true,
        data: recommendedTopics.slice(0, 10) // Return top 10 recommendations
      };
    } catch (error) {
      console.error('Get recommended topics error:', error);
      return {
        success: false,
        error: 'Failed to get recommended topics'
      };
    }
  }

  /**
   * Format topic name for display
   */
  formatTopicName(topic) {
    return topic
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get all available exams with their subjects and topics
   */
  getAllExamsWithTopics() {
    const result = {};

    for (const [examId, examData] of Object.entries(this.topicMapping)) {
      result[examId] = {
        subjects: Object.entries(examData).map(([subjectId, subjectData]) => ({
          id: subjectId,
          name: subjectData.name,
          topics: subjectData.topics.map(topic => ({
            id: topic,
            name: this.formatTopicName(topic)
          }))
        }))
      };
    }

    return result;
  }
}

module.exports = { TopicBasedQuestionService }; 