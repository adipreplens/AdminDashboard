import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// AI Recommendation Service for Flutter
class AIRecommendationService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  // Get auth token from shared preferences
  static Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  /// Get AI-powered next test recommendation
  static Future<Map<String, dynamic>> getNextTestRecommendation({
    String testType = 'practice',
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/ai/next-test?testType=$testType'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to get AI recommendation: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('AI recommendation error: $e');
    }
  }

  /// Get personalized study plan
  static Future<Map<String, dynamic>> getPersonalizedStudyPlan() async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/ai/study-plan'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to get study plan: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Study plan error: $e');
    }
  }

  /// Get performance analysis
  static Future<Map<String, dynamic>> getPerformanceAnalysis() async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/ai/performance-analysis'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to get performance analysis: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Performance analysis error: $e');
    }
  }

  /// Start smart test session with AI recommendation
  static Future<Map<String, dynamic>> startSmartTestSession({
    String testType = 'practice',
    String? subject,
    String? topic,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/users/ai/smart-test-session/start'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'testType': testType,
          'subject': subject,
          'topic': topic,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to start smart test session: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Smart test session error: $e');
    }
  }
}

// AI Recommendation Models
class AIRecommendation {
  final String testType;
  final String difficulty;
  final String subjectFocus;
  final List<String> topicFocus;
  final int questionCount;
  final int timeLimit;
  final String reasoning;
  final bool aiGenerated;

  AIRecommendation({
    required this.testType,
    required this.difficulty,
    required this.subjectFocus,
    required this.topicFocus,
    required this.questionCount,
    required this.timeLimit,
    required this.reasoning,
    this.aiGenerated = false,
  });

  factory AIRecommendation.fromJson(Map<String, dynamic> json) {
    return AIRecommendation(
      testType: json['testType'] ?? '',
      difficulty: json['difficulty'] ?? 'medium',
      subjectFocus: json['subjectFocus'] ?? 'general',
      topicFocus: List<String>.from(json['topicFocus'] ?? []),
      questionCount: json['questionCount'] ?? 20,
      timeLimit: json['timeLimit'] ?? 30,
      reasoning: json['reasoning'] ?? '',
      aiGenerated: json['aiGenerated'] ?? false,
    );
  }
}

class PerformanceAnalysis {
  final String level;
  final List<String> weakSubjects;
  final List<String> strongSubjects;
  final List<String> weakTopics;
  final String recommendedDifficulty;
  final List<String> focusAreas;
  final String studyPlan;
  final double averageScore;
  final int totalTests;

  PerformanceAnalysis({
    required this.level,
    required this.weakSubjects,
    required this.strongSubjects,
    required this.weakTopics,
    required this.recommendedDifficulty,
    required this.focusAreas,
    required this.studyPlan,
    required this.averageScore,
    required this.totalTests,
  });

  factory PerformanceAnalysis.fromJson(Map<String, dynamic> json) {
    return PerformanceAnalysis(
      level: json['level'] ?? 'beginner',
      weakSubjects: List<String>.from(json['weakSubjects'] ?? []),
      strongSubjects: List<String>.from(json['strongSubjects'] ?? []),
      weakTopics: List<String>.from(json['weakTopics'] ?? []),
      recommendedDifficulty: json['recommendedDifficulty'] ?? 'medium',
      focusAreas: List<String>.from(json['focusAreas'] ?? []),
      studyPlan: json['studyPlan'] ?? 'balanced_practice',
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      totalTests: json['totalTests'] ?? 0,
    );
  }
}

class StudyPlan {
  final Map<String, dynamic> dailyGoal;
  final Map<String, dynamic> weeklyTarget;
  final List<String> focusAreas;
  final List<String> recommendedTests;
  final List<String> tips;

  StudyPlan({
    required this.dailyGoal,
    required this.weeklyTarget,
    required this.focusAreas,
    required this.recommendedTests,
    required this.tips,
  });

  factory StudyPlan.fromJson(Map<String, dynamic> json) {
    return StudyPlan(
      dailyGoal: Map<String, dynamic>.from(json['dailyGoal'] ?? {}),
      weeklyTarget: Map<String, dynamic>.from(json['weeklyTarget'] ?? {}),
      focusAreas: List<String>.from(json['focusAreas'] ?? []),
      recommendedTests: List<String>.from(json['recommendedTests'] ?? []),
      tips: List<String>.from(json['tips'] ?? []),
    );
  }
}

// AI Recommendation Widget Example
import 'package:flutter/material.dart';

class AIRecommendationWidget extends StatefulWidget {
  final String testType;

  const AIRecommendationWidget({
    Key? key,
    required this.testType,
  }) : super(key: key);

  @override
  _AIRecommendationWidgetState createState() => _AIRecommendationWidgetState();
}

class _AIRecommendationWidgetState extends State<AIRecommendationWidget> {
  bool _isLoading = false;
  AIRecommendation? _recommendation;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRecommendation();
  }

  Future<void> _loadRecommendation() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await AIRecommendationService.getNextTestRecommendation(
        testType: widget.testType,
      );
      
      setState(() {
        _recommendation = AIRecommendation.fromJson(data['recommendation']);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.psychology,
                  color: Colors.blue,
                  size: 24,
                ),
                SizedBox(width: 8),
                Text(
                  'AI Recommendation',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (_recommendation?.aiGenerated == true)
                  Container(
                    margin: EdgeInsets.only(left: 8),
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'AI',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            SizedBox(height: 16),
            
            if (_isLoading)
              Center(child: CircularProgressIndicator())
            else if (_error != null)
              Text(
                'Error: $_error',
                style: TextStyle(color: Colors.red),
              )
            else if (_recommendation != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Recommendation details
                  _buildRecommendationDetail('Test Type', _recommendation!.testType),
                  _buildRecommendationDetail('Difficulty', _recommendation!.difficulty),
                  _buildRecommendationDetail('Subject Focus', _recommendation!.subjectFocus),
                  _buildRecommendationDetail('Questions', '${_recommendation!.questionCount}'),
                  _buildRecommendationDetail('Time Limit', '${_recommendation!.timeLimit} min'),
                  
                  if (_recommendation!.topicFocus.isNotEmpty)
                    _buildRecommendationDetail('Topics', _recommendation!.topicFocus.join(', ')),
                  
                  SizedBox(height: 16),
                  
                  // Reasoning
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Why this recommendation?',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(_recommendation!.reasoning),
                      ],
                    ),
                  ),
                  
                  SizedBox(height: 16),
                  
                  // Start test button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _startSmartTest(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        padding: EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text(
                        'Start AI-Recommended Test',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendationDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _startSmartTest() async {
    try {
      final data = await AIRecommendationService.startSmartTestSession(
        testType: widget.testType,
        subject: _recommendation?.subjectFocus,
        topic: _recommendation?.topicFocus.isNotEmpty == true 
            ? _recommendation!.topicFocus.first 
            : null,
      );
      
      // Navigate to test screen with AI-recommended questions
      // Navigator.push(context, MaterialPageRoute(
      //   builder: (context) => TestScreen(
      //     sessionId: data['sessionId'],
      //     questions: data['questions'],
      //     timeLimit: data['timeLimit'],
      //   ),
      // ));
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Starting AI-recommended test...'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error starting test: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

// Study Plan Widget Example
class StudyPlanWidget extends StatefulWidget {
  @override
  _StudyPlanWidgetState createState() => _StudyPlanWidgetState();
}

class _StudyPlanWidgetState extends State<StudyPlanWidget> {
  bool _isLoading = false;
  StudyPlan? _studyPlan;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStudyPlan();
  }

  Future<void> _loadStudyPlan() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await AIRecommendationService.getPersonalizedStudyPlan();
      setState(() {
        _studyPlan = StudyPlan.fromJson(data);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.school, color: Colors.green),
                SizedBox(width: 8),
                Text(
                  'Personalized Study Plan',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            
            if (_isLoading)
              Center(child: CircularProgressIndicator())
            else if (_error != null)
              Text('Error: $_error', style: TextStyle(color: Colors.red))
            else if (_studyPlan != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Daily Goal
                  _buildSection('Daily Goal', [
                    'Questions: ${_studyPlan!.dailyGoal['questions']}',
                    'Time: ${_studyPlan!.dailyGoal['time']} minutes',
                    'Tests: ${_studyPlan!.dailyGoal['tests']}',
                  ]),
                  
                  SizedBox(height: 16),
                  
                  // Weekly Target
                  _buildSection('Weekly Target', [
                    'Questions: ${_studyPlan!.weeklyTarget['questions']}',
                    'Time: ${_studyPlan!.weeklyTarget['time']} minutes',
                    'Tests: ${_studyPlan!.weeklyTarget['tests']}',
                    'Target Score: ${_studyPlan!.weeklyTarget['targetScore']}%',
                  ]),
                  
                  SizedBox(height: 16),
                  
                  // Focus Areas
                  if (_studyPlan!.focusAreas.isNotEmpty)
                    _buildSection('Focus Areas', _studyPlan!.focusAreas),
                  
                  SizedBox(height: 16),
                  
                  // Study Tips
                  if (_studyPlan!.tips.isNotEmpty)
                    _buildSection('Study Tips', _studyPlan!.tips),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.blue,
          ),
        ),
        SizedBox(height: 8),
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(left: 16.0, bottom: 4.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
              Expanded(child: Text(item)),
            ],
          ),
        )),
      ],
    );
  }
} 