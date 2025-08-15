import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:preplens_app/utils/constants.dart';

class AIService {
  static final AIService _instance = AIService._internal();
  factory AIService() => _instance;
  AIService._internal();

  String? _authToken;
  final Map<String, String> _headers = {
    'Content-Type': 'application/json',
  };

  Future<String?> get authToken async {
    if (_authToken != null) return _authToken;
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString(AppConstants.tokenKey);
    return _authToken;
  }

  Future<void> _updateHeaders() async {
    final token = await authToken;
    if (token != null) {
      _headers['Authorization'] = 'Bearer $token';
    }
  }

  // ==================== BACKEND AI ENDPOINTS ====================

  // 1. AI-Powered Attempt Analysis
  Future<Map<String, dynamic>> analyzeAttempt({
    required String userId,
    required String examType,
    required List<Map<String, dynamic>> attemptData,
    String mode = 'analyze_attempt',
  }) async {
    await _updateHeaders();
    
    try {
      final token = await authToken;
      if (token == null) {
        return {'success': false, 'message': 'Authentication required'};
      }

      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/v1/users/ai/analyze-attempt'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'userId': userId,
          'examType': examType,
          'attemptData': attemptData,
          'mode': mode,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🤖 AI Analysis completed for user: $userId, exam: $examType');
        print('📊 Generated analysis with ${data['analysis']['topics'].length} topic insights');
        return data;
      } else {
        return {
          'success': false,
          'message': 'AI analysis failed: ${response.statusCode}',
        };
      }
    } catch (e) {
      print('❌ AI Analysis failed: $e');
      return {
        'success': false,
        'message': 'AI analysis failed: $e',
        'mode': mode,
      };
    }
  }

  // 2. AI Learning Path Recommendations
  Future<Map<String, dynamic>> getLearningPathRecommendations({
    required String userId,
    required String examType,
    required Map<String, dynamic> performanceData,
    required int preparationMonths,
    String mode = 'recommend_path',
  }) async {
    await _updateHeaders();
    
    try {
      final token = await authToken;
      if (token == null) {
        return {'success': false, 'message': 'Authentication required'};
      }

      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/v1/users/ai/recommend-path'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'userId': userId,
          'examType': examType,
          'performanceData': performanceData,
          'preparationMonths': preparationMonths,
          'mode': mode,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🤖 AI Learning Path generated for user: $userId, exam: $examType');
        print('📚 Generated ${data['recommendations']['modules'].length} recommended modules');
        return data;
      } else {
        return {
          'success': false,
          'message': 'AI recommendations failed: ${response.statusCode}',
        };
      }
    } catch (e) {
      print('❌ AI Recommendations failed: $e');
      return {
        'success': false,
        'message': 'AI recommendations failed: $e',
        'mode': mode,
      };
    }
  }

  // 3. AI Tutor - 24/7 Doubt Solver
  Future<Map<String, dynamic>> askAITutor({
    required String userId,
    required String question,
    String? subject,
    String? examType,
    List<String>? availableContent,
    String mode = 'tutor',
  }) async {
    await _updateHeaders();
    
    try {
      final token = await authToken;
      if (token == null) {
        return {'success': false, 'message': 'Authentication required'};
      }

      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/v1/users/ai/tutor'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'userId': userId,
          'question': question,
          'subject': subject,
          'examType': examType,
          'availableContent': availableContent,
          'mode': mode,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🤖 AI Tutor answered question for user: $userId');
        print('❓ Question: ${question.substring(0, question.length > 50 ? 50 : question.length)}...');
        return data;
      } else {
        return {
          'success': false,
          'message': 'AI tutor failed: ${response.statusCode}',
        };
      }
    } catch (e) {
      print('❌ AI Tutor failed: $e');
      return {
        'success': false,
        'message': 'AI tutor failed: $e',
        'mode': mode,
      };
    }
  }

  // 4. Generate 7-Day Learning Plan
  Future<Map<String, dynamic>> generateWeeklyPlan({
    required String userId,
    required String examType,
    required Map<String, dynamic> currentPerformance,
    required int preparationMonths,
  }) async {
    await _updateHeaders();
    
    try {
      final token = await authToken;
      if (token == null) {
        return {'success': false, 'message': 'Authentication required'};
      }

      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/v1/users/ai/weekly-plan'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'userId': userId,
          'examType': examType,
          'currentPerformance': currentPerformance,
          'preparationMonths': preparationMonths,
          'mode': 'weekly_plan',
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🤖 AI Weekly Plan generated for user: $userId, exam: $examType');
        return data;
      } else {
        return {
          'success': false,
          'message': 'AI weekly plan failed: ${response.statusCode}',
        };
      }
    } catch (e) {
      print('❌ AI Weekly Plan failed: $e');
      return {
        'success': false,
        'message': 'AI weekly plan failed: $e',
      };
    }
  }

  // 5. Get AI Insights Summary
  Future<Map<String, dynamic>> getAIInsightsSummary({
    required String userId,
    required String examType,
    required int preparationMonths,
    int days = 30,
  }) async {
    await _updateHeaders();
    
    try {
      final token = await authToken;
      if (token == null) {
        return {'success': false, 'message': 'Authentication required'};
      }

      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/v1/users/ai/insights-summary'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'userId': userId,
          'examType': examType,
          'preparationMonths': preparationMonths,
          'days': days,
          'mode': 'insights_summary',
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🤖 AI Insights summary generated for user: $userId, exam: $examType');
        return data;
      } else {
        return {
          'success': false,
          'message': 'AI insights failed: ${response.statusCode}',
        };
      }
    } catch (e) {
      print('❌ AI Insights failed: $e');
      return {
        'success': false,
        'message': 'AI insights failed: $e',
      };
    }
  }

  // 6. Get Questions with AI Recommendations
  Future<Map<String, dynamic>> getExamQuestionsWithAI({
    required String userId,
    required String examType,
    required int preparationMonths,
    String? subject,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    await _updateHeaders();
    
    try {
      final token = await authToken;
      if (token == null) {
        return {'success': false, 'message': 'Authentication required'};
      }

      // Calculate user's level based on preparation time
      final userLevel = _calculateUserLevel(preparationMonths);
      
      // Get questions from backend API
      final questionsResult = await _fetchQuestionsFromAPI(
        examType: examType,
        difficulty: userLevel.toString(),
        subject: subject,
        search: search,
        page: page,
        limit: limit,
      );
      
      if (!questionsResult['success']) {
        return questionsResult;
      }
      
      // Generate AI insights for the questions
      final aiInsights = await _generateAIInsightsForQuestions(
        userId: userId,
        examType: examType,
        questions: questionsResult['data']['questions'],
        userLevel: userLevel,
        preparationMonths: preparationMonths,
      );
      
      return {
        'success': true,
        'questions': questionsResult['data']['questions'],
        'pagination': questionsResult['data']['pagination'],
        'filters': questionsResult['data']['filters'],
        'aiInsights': aiInsights,
        'userLevel': userLevel,
        'levelName': _getLevelName(userLevel),
        'timestamp': DateTime.now().toIso8601String(),
      };
      
    } catch (e) {
      print('❌ Get Exam Questions with AI failed: $e');
      return {
        'success': false,
        'message': 'Failed to get questions: $e',
      };
    }
  }

  // 7. Get AI-Powered Study Recommendations
  Future<Map<String, dynamic>> getStudyRecommendations({
    required String userId,
    required String examType,
    required int preparationMonths,
    required Map<String, dynamic> performanceData,
  }) async {
    await _updateHeaders();
    
    try {
      final userLevel = _calculateUserLevel(preparationMonths);
      final recommendations = _generateLevelBasedRecommendations(
        userLevel: userLevel,
        examType: examType,
        performanceData: performanceData,
        preparationMonths: preparationMonths,
      );
      
      return {
        'success': true,
        'recommendations': recommendations,
        'userLevel': userLevel,
        'levelName': _getLevelName(userLevel),
        'timestamp': DateTime.now().toIso8601String(),
      };
      
    } catch (e) {
      print('❌ Study Recommendations failed: $e');
      return {
        'success': false,
        'message': 'Failed to generate recommendations: $e',
      };
    }
  }

  // 8. Get AI-Powered Question Difficulty Progression
  Future<Map<String, dynamic>> getDifficultyProgression({
    required String userId,
    required String examType,
    required int preparationMonths,
    required Map<String, dynamic> currentPerformance,
  }) async {
    await _updateHeaders();
    
    try {
      final userLevel = _calculateUserLevel(preparationMonths);
      final progression = _generateDifficultyProgression(
        currentLevel: userLevel,
        currentPerformance: currentPerformance,
        examType: examType,
      );
      
      return {
        'success': true,
        'progression': progression,
        'currentLevel': userLevel,
        'nextLevel': progression['nextLevel'],
        'estimatedTimeToNextLevel': progression['estimatedTimeToNextLevel'],
        'timestamp': DateTime.now().toIso8601String(),
      };
      
    } catch (e) {
      print('❌ Difficulty Progression failed: $e');
      return {
        'success': false,
        'message': 'Failed to generate progression: $e',
      };
    }
  }

  // ==================== HELPER METHODS ====================

  // Calculate user's level based on preparation time
  int _calculateUserLevel(int preparationMonths) {
    if (preparationMonths <= 6) return 0;      // Easy
    if (preparationMonths <= 12) return 1;     // Medium  
    return 2;                                   // Hard
  }

  // Get level name for display
  String _getLevelName(int level) {
    switch (level) {
      case 0: return 'Beginner';
      case 1: return 'Intermediate';
      case 2: return 'Advanced';
      default: return 'Unknown';
    }
  }

  // Get level color for UI
  Color _getLevelColor(int level) {
    switch (level) {
      case 0: return Colors.green;
      case 1: return Colors.orange;
      case 2: return Colors.red;
      default: return Colors.grey;
    }
  }

  // Fetch questions from your backend API
  Future<Map<String, dynamic>> _fetchQuestionsFromAPI({
    required String examType,
    required String difficulty,
    String? subject,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final token = await authToken;
      if (token == null) {
        return {'success': false, 'message': 'Authentication required'};
      }

      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
        'difficulty': difficulty,
      };
      
      if (subject != null && subject != 'all') {
        queryParams['subject'] = subject;
      }
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final uri = Uri.parse('${AppConstants.baseUrl}/api/v1/users/questions/$examType')
          .replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        return {
          'success': false,
          'message': 'Failed to fetch questions: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // Generate AI insights for questions
  Future<Map<String, dynamic>> _generateAIInsightsForQuestions({
    required String userId,
    required String examType,
    required List<dynamic> questions,
    required int userLevel,
    required int preparationMonths,
  }) async {
    // Simulate AI processing
    await Future.delayed(const Duration(milliseconds: 500));
    
    return {
      'difficultyMatch': 'Perfect match for your level',
      'estimatedCompletionTime': '${questions.length * 2} minutes',
      'focusAreas': _identifyFocusAreas(questions),
      'confidenceBoost': 'These questions will strengthen your foundation',
      'nextSteps': _suggestNextSteps(userLevel, questions.length),
      'aiConfidence': 0.92,
    };
  }

  // Generate level-based recommendations
  Map<String, dynamic> _generateLevelBasedRecommendations({
    required int userLevel,
    required String examType,
    required Map<String, dynamic> performanceData,
    required int preparationMonths,
  }) {
    final recommendations = <Map<String, dynamic>>[];
    
    switch (userLevel) {
      case 0: // Beginner
        recommendations.addAll([
          {
            'type': 'foundation',
            'priority': 'high',
            'action': 'Build strong fundamentals',
            'resources': ['Basic theory videos', 'Easy practice sets', 'Concept explanations'],
            'estimatedTime': '3-4 hours daily',
            'difficulty': 'easy',
            'targetAccuracy': 70,
          },
          {
            'type': 'consistency',
            'priority': 'medium',
            'action': 'Maintain daily study routine',
            'resources': ['Daily practice', 'Weekly tests', 'Progress tracking'],
            'estimatedTime': '1-2 hours daily',
            'difficulty': 'easy',
            'targetAccuracy': 75,
          },
        ]);
        break;
        
      case 1: // Intermediate
        recommendations.addAll([
          {
            'type': 'practice',
            'priority': 'high',
            'action': 'Practice medium difficulty questions',
            'resources': ['Medium practice sets', 'Previous year questions', 'Mock tests'],
            'estimatedTime': '2-3 hours daily',
            'difficulty': 'medium',
            'targetAccuracy': 80,
          },
          {
            'type': 'speed',
            'priority': 'medium',
            'action': 'Improve problem-solving speed',
            'resources': ['Timed practice', 'Speed tests', 'Efficiency drills'],
            'estimatedTime': '1-2 hours daily',
            'difficulty': 'medium',
            'targetAccuracy': 75,
          },
        ]);
        break;
        
      case 2: // Advanced
        recommendations.addAll([
          {
            'type': 'advanced',
            'priority': 'high',
            'action': 'Master advanced concepts',
            'resources': ['Advanced problems', 'Competition level questions', 'Speed optimization'],
            'estimatedTime': '2-3 hours daily',
            'difficulty': 'hard',
            'targetAccuracy': 85,
          },
          {
            'type': 'refinement',
            'priority': 'medium',
            'action': 'Refine weak areas',
            'resources': ['Targeted practice', 'Performance analysis', 'Strategy optimization'],
            'estimatedTime': '1-2 hours daily',
            'difficulty': 'mixed',
            'targetAccuracy': 90,
          },
        ]);
        break;
    }
    
    return {
      'modules': recommendations,
      'studyStrategy': _getStudyStrategy(userLevel),
      'estimatedCompletionTime': _estimateLevelCompletionTime(userLevel, preparationMonths),
      'nextMilestone': _getNextMilestone(userLevel),
    };
  }

  // Generate difficulty progression
  Map<String, dynamic> _generateDifficultyProgression({
    required int currentLevel,
    required Map<String, dynamic> currentPerformance,
    required String examType,
  }) {
    final nextLevel = currentLevel < 2 ? currentLevel + 1 : currentLevel;
    final isMaxLevel = currentLevel >= 2;
    
    if (isMaxLevel) {
      return {
        'nextLevel': currentLevel,
        'estimatedTimeToNextLevel': 'Already at maximum level',
        'focus': 'Maintain excellence and help others',
        'recommendations': [
          'Mentor other students',
          'Create study materials',
          'Focus on speed optimization',
        ],
      };
    }
    
    // Calculate time to next level based on performance
    final accuracy = currentPerformance['overallAccuracy'] || 0;
    final estimatedDays = _calculateDaysToNextLevel(accuracy, currentLevel);
    
    return {
      'nextLevel': nextLevel,
      'estimatedTimeToNextLevel': '$estimatedDays days',
      'focus': 'Improve accuracy and speed',
      'requirements': {
        'accuracy': 'Achieve 80%+ consistently',
        'speed': 'Reduce average time per question',
        'consistency': 'Maintain daily practice',
      },
      'recommendations': [
        'Practice harder questions',
        'Focus on weak subjects',
        'Take timed mock tests',
      ],
    };
  }

  // Helper methods
  List<String> _identifyFocusAreas(List<dynamic> questions) {
    final subjects = <String>{};
    questions.forEach((q) {
      if (q['subject'] != null) subjects.add(q['subject']);
    });
    return subjects.toList();
  }

  String _suggestNextSteps(int userLevel, int questionsCount) {
    if (userLevel == 0) return 'Complete all questions to build foundation';
    if (userLevel == 1) return 'Focus on accuracy improvement';
    return 'Optimize speed and accuracy';
  }

  String _getStudyStrategy(int userLevel) {
    switch (userLevel) {
      case 0: return 'Foundation building approach';
      case 1: return 'Practice and improvement strategy';
      case 2: return 'Advanced optimization and mastery';
      default: return 'General study approach';
    }
  }

  String _estimateLevelCompletionTime(int userLevel, int preparationMonths) {
    switch (userLevel) {
      case 0: return '2-3 months';
      case 1: return '3-6 months';
      case 2: return '6-12 months';
      default: return 'Unknown';
    }
  }

  String _getNextMilestone(int userLevel) {
    switch (userLevel) {
      case 0: return 'Achieve 70% accuracy in all subjects';
      case 1: return 'Achieve 80% accuracy and improve speed';
      case 2: return 'Achieve 90% accuracy and optimize time';
      default: return 'Improve overall performance';
    }
  }

  int _calculateDaysToNextLevel(double accuracy, int currentLevel) {
    if (accuracy >= 85) return 14;  // 2 weeks
    if (accuracy >= 75) return 30;  // 1 month
    if (accuracy >= 65) return 60;  // 2 months
    return 90;  // 3 months
  }
}

// Usage Examples:
/*
// 1. Analyze test attempt
final analysis = await AIService().analyzeAttempt(
  userId: 'user123',
  examType: 'rrb-je',
  attemptData: [
    {'subject': 'civil-engineering', 'isCorrect': true, 'timeSpent': 45, 'difficulty': 1},
    {'subject': 'civil-engineering', 'isCorrect': false, 'timeSpent': 90, 'difficulty': 1},
  ],
);

// 2. Get learning recommendations
final recommendations = await AIService().getLearningPathRecommendations(
  userId: 'user123',
  examType: 'rrb-je',
  performanceData: analysis['analysis'],
  preparationMonths: 8,
);

// 3. Ask AI tutor
final tutorResponse = await AIService().askAITutor(
  userId: 'user123',
  question: 'How to solve quadratic equations?',
  subject: 'mathematics',
  examType: 'rrb-je',
);

// 4. Generate weekly plan
final weeklyPlan = await AIService().generateWeeklyPlan(
  userId: 'user123',
  examType: 'rrb-je',
  currentPerformance: analysis['analysis'],
  preparationMonths: 8,
);

// 5. Get questions with AI insights
final questionsWithAI = await AIService().getExamQuestionsWithAI(
  userId: 'user123',
  examType: 'rrb-je',
  preparationMonths: 8,
  page: 1,
  limit: 20,
);
*/ 