import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Onboarding Service for Flutter
class OnboardingService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  // Get auth token from shared preferences
  static Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  /// Get available exams
  static Future<List<ExamData>> getAvailableExams() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/onboarding/exams'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['data'] as List)
            .map((exam) => ExamData.fromJson(exam))
            .toList();
      } else {
        throw Exception('Failed to get exams: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get exams error: $e');
    }
  }

  /// Save onboarding data
  static Future<Map<String, dynamic>> saveOnboardingData({
    required String exam,
    required int preparationDays,
    String currentLevel = 'beginner',
    List<String>? preferredSubjects,
    int studyTimePerDay = 2,
    List<String>? weakAreas,
    List<String>? strongAreas,
    int targetScore = 80,
    int dailyQuestions = 30,
    int weeklyTests = 3,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/users/onboarding/save'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'exam': exam,
          'preparationDays': preparationDays,
          'currentLevel': currentLevel,
          'preferredSubjects': preferredSubjects,
          'studyTimePerDay': studyTimePerDay,
          'weakAreas': weakAreas ?? [],
          'strongAreas': strongAreas ?? [],
          'targetScore': targetScore,
          'dailyQuestions': dailyQuestions,
          'weeklyTests': weeklyTests,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        throw Exception('Failed to save onboarding: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Save onboarding error: $e');
    }
  }

  /// Get onboarding data
  static Future<OnboardingData?> getOnboardingData() async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/onboarding/data'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return OnboardingData.fromJson(data['data']);
      } else if (response.statusCode == 404) {
        return null; // No onboarding data found
      } else {
        throw Exception('Failed to get onboarding data: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get onboarding error: $e');
    }
  }

  /// Get personalized dashboard data
  static Future<DashboardData> getDashboardData() async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/dashboard'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return DashboardData.fromJson(data['data']);
      } else {
        throw Exception('Failed to get dashboard: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Dashboard error: $e');
    }
  }

  /// Update onboarding data
  static Future<Map<String, dynamic>> updateOnboardingData(Map<String, dynamic> updateData) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.put(
        Uri.parse('$baseUrl/users/onboarding/update'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(updateData),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        throw Exception('Failed to update onboarding: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Update onboarding error: $e');
    }
  }
}

// Data Models
class ExamData {
  final String id;
  final String name;
  final List<String> subjects;
  final int duration;
  final int totalQuestions;
  final int timeLimit;

  ExamData({
    required this.id,
    required this.name,
    required this.subjects,
    required this.duration,
    required this.totalQuestions,
    required this.timeLimit,
  });

  factory ExamData.fromJson(Map<String, dynamic> json) {
    return ExamData(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      subjects: List<String>.from(json['subjects'] ?? []),
      duration: json['duration'] ?? 90,
      totalQuestions: json['totalQuestions'] ?? 150,
      timeLimit: json['timeLimit'] ?? 120,
    );
  }
}

class OnboardingData {
  final String exam;
  final String examName;
  final int preparationDays;
  final DateTime targetDate;
  final String currentLevel;
  final List<String> preferredSubjects;
  final int studyTimePerDay;
  final List<String> weakAreas;
  final List<String> strongAreas;
  final Map<String, dynamic> goals;
  final Map<String, dynamic> roadmap;
  final bool isCompleted;

  OnboardingData({
    required this.exam,
    required this.examName,
    required this.preparationDays,
    required this.targetDate,
    required this.currentLevel,
    required this.preferredSubjects,
    required this.studyTimePerDay,
    required this.weakAreas,
    required this.strongAreas,
    required this.goals,
    required this.roadmap,
    required this.isCompleted,
  });

  factory OnboardingData.fromJson(Map<String, dynamic> json) {
    return OnboardingData(
      exam: json['exam'] ?? '',
      examName: json['examName'] ?? '',
      preparationDays: json['preparationDays'] ?? 0,
      targetDate: DateTime.parse(json['targetDate'] ?? DateTime.now().toIso8601String()),
      currentLevel: json['currentLevel'] ?? 'beginner',
      preferredSubjects: List<String>.from(json['preferredSubjects'] ?? []),
      studyTimePerDay: json['studyTimePerDay'] ?? 2,
      weakAreas: List<String>.from(json['weakAreas'] ?? []),
      strongAreas: List<String>.from(json['strongAreas'] ?? []),
      goals: Map<String, dynamic>.from(json['goals'] ?? {}),
      roadmap: Map<String, dynamic>.from(json['roadmap'] ?? {}),
      isCompleted: json['isCompleted'] ?? false,
    );
  }
}

class DashboardData {
  final ExamInfo exam;
  final ProgressInfo progress;
  final Map<String, dynamic> roadmap;
  final Map<String, dynamic> goals;
  final StatsInfo stats;
  final List<String> recommendations;

  DashboardData({
    required this.exam,
    required this.progress,
    required this.roadmap,
    required this.goals,
    required this.stats,
    required this.recommendations,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      exam: ExamInfo.fromJson(json['exam'] ?? {}),
      progress: ProgressInfo.fromJson(json['progress'] ?? {}),
      roadmap: Map<String, dynamic>.from(json['roadmap'] ?? {}),
      goals: Map<String, dynamic>.from(json['goals'] ?? {}),
      stats: StatsInfo.fromJson(json['stats'] ?? {}),
      recommendations: List<String>.from(json['recommendations'] ?? []),
    );
  }
}

class ExamInfo {
  final String name;
  final String id;
  final DateTime targetDate;

  ExamInfo({
    required this.name,
    required this.id,
    required this.targetDate,
  });

  factory ExamInfo.fromJson(Map<String, dynamic> json) {
    return ExamInfo(
      name: json['name'] ?? '',
      id: json['id'] ?? '',
      targetDate: DateTime.parse(json['targetDate'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class ProgressInfo {
  final double overall;
  final String currentPhase;
  final double phaseProgress;
  final int daysElapsed;
  final int daysRemaining;

  ProgressInfo({
    required this.overall,
    required this.currentPhase,
    required this.phaseProgress,
    required this.daysElapsed,
    required this.daysRemaining,
  });

  factory ProgressInfo.fromJson(Map<String, dynamic> json) {
    return ProgressInfo(
      overall: (json['overall'] ?? 0).toDouble(),
      currentPhase: json['currentPhase'] ?? 'phase1',
      phaseProgress: (json['phaseProgress'] ?? 0).toDouble(),
      daysElapsed: json['daysElapsed'] ?? 0,
      daysRemaining: json['daysRemaining'] ?? 0,
    );
  }
}

class StatsInfo {
  final int totalTests;
  final double averageScore;
  final int studyTimePerDay;
  final List<String> preferredSubjects;

  StatsInfo({
    required this.totalTests,
    required this.averageScore,
    required this.studyTimePerDay,
    required this.preferredSubjects,
  });

  factory StatsInfo.fromJson(Map<String, dynamic> json) {
    return StatsInfo(
      totalTests: json['totalTests'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      studyTimePerDay: json['studyTimePerDay'] ?? 2,
      preferredSubjects: List<String>.from(json['preferredSubjects'] ?? []),
    );
  }
}

// Onboarding Widget Example
import 'package:flutter/material.dart';

class ExamSelectionWidget extends StatefulWidget {
  final Function(ExamData) onExamSelected;

  const ExamSelectionWidget({
    Key? key,
    required this.onExamSelected,
  }) : super(key: key);

  @override
  _ExamSelectionWidgetState createState() => _ExamSelectionWidgetState();
}

class _ExamSelectionWidgetState extends State<ExamSelectionWidget> {
  bool _isLoading = false;
  List<ExamData> _exams = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadExams();
  }

  Future<void> _loadExams() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final exams = await OnboardingService.getAvailableExams();
      setState(() {
        _exams = exams;
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Which exam are you preparing for?',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 16),
        
        if (_isLoading)
          Center(child: CircularProgressIndicator())
        else if (_error != null)
          Text(
            'Error: $_error',
            style: TextStyle(color: Colors.red),
          )
        else
          Expanded(
            child: GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.2,
              ),
              itemCount: _exams.length,
              itemBuilder: (context, index) {
                final exam = _exams[index];
                return GestureDetector(
                  onTap: () => widget.onExamSelected(exam),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[300]!),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          spreadRadius: 1,
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            exam.name,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 8),
                          Text(
                            '${exam.totalQuestions} Questions',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          Text(
                            '${exam.timeLimit} Minutes',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          Spacer(),
                          Text(
                            '${exam.subjects.length} Subjects',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

class OnboardingFormWidget extends StatefulWidget {
  final ExamData selectedExam;
  final Function(Map<String, dynamic>) onOnboardingComplete;

  const OnboardingFormWidget({
    Key? key,
    required this.selectedExam,
    required this.onOnboardingComplete,
  }) : super(key: key);

  @override
  _OnboardingFormWidgetState createState() => _OnboardingFormWidgetState();
}

class _OnboardingFormWidgetState extends State<OnboardingFormWidget> {
  final _formKey = GlobalKey<FormState>();
  int _preparationDays = 90;
  String _currentLevel = 'beginner';
  int _studyTimePerDay = 2;
  int _targetScore = 80;
  int _dailyQuestions = 30;
  int _weeklyTests = 3;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Personalize Your Study Plan',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          
          // Preparation Days
          Text(
            'How many days do you have for preparation?',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          SizedBox(height: 8),
          Slider(
            value: _preparationDays.toDouble(),
            min: 30,
            max: 365,
            divisions: 67,
            label: '$_preparationDays days',
            onChanged: (value) {
              setState(() {
                _preparationDays = value.round();
              });
            },
          ),
          
          SizedBox(height: 24),
          
          // Current Level
          Text(
            'What\'s your current preparation level?',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _currentLevel,
            decoration: InputDecoration(
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            items: [
              DropdownMenuItem(value: 'beginner', child: Text('Beginner')),
              DropdownMenuItem(value: 'intermediate', child: Text('Intermediate')),
              DropdownMenuItem(value: 'advanced', child: Text('Advanced')),
            ],
            onChanged: (value) {
              setState(() {
                _currentLevel = value!;
              });
            },
          ),
          
          SizedBox(height: 24),
          
          // Study Time
          Text(
            'How many hours can you study per day?',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          SizedBox(height: 8),
          Slider(
            value: _studyTimePerDay.toDouble(),
            min: 1,
            max: 8,
            divisions: 7,
            label: '$_studyTimePerDay hours',
            onChanged: (value) {
              setState(() {
                _studyTimePerDay = value.round();
              });
            },
          ),
          
          SizedBox(height: 24),
          
          // Goals
          Text(
            'Set Your Goals',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Target Score'),
                    Slider(
                      value: _targetScore.toDouble(),
                      min: 60,
                      max: 100,
                      divisions: 8,
                      label: '$_targetScore%',
                      onChanged: (value) {
                        setState(() {
                          _targetScore = value.round();
                        });
                      },
                    ),
                  ],
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Daily Questions'),
                    Slider(
                      value: _dailyQuestions.toDouble(),
                      min: 10,
                      max: 100,
                      divisions: 9,
                      label: '$_dailyQuestions',
                      onChanged: (value) {
                        setState(() {
                          _dailyQuestions = value.round();
                        });
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          SizedBox(height: 24),
          
          // Complete Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _completeOnboarding,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                padding: EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text(
                      'Create My Study Plan',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _completeOnboarding() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final result = await OnboardingService.saveOnboardingData(
        exam: widget.selectedExam.id,
        preparationDays: _preparationDays,
        currentLevel: _currentLevel,
        studyTimePerDay: _studyTimePerDay,
        targetScore: _targetScore,
        dailyQuestions: _dailyQuestions,
        weeklyTests: _weeklyTests,
      );

      if (result['success']) {
        widget.onOnboardingComplete(result['data']);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? 'Onboarding failed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
} 