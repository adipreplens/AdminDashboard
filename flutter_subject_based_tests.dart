import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Subject-based Test Service for Flutter
class SubjectBasedTestService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  // Get auth token from shared preferences
  static Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  /// Get available subjects for an exam
  static Future<List<SubjectData>> getSubjectsForExam(String examId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/subjects/$examId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['data'] as List)
            .map((subject) => SubjectData.fromJson(subject))
            .toList();
      } else {
        throw Exception('Failed to get subjects: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get subjects error: $e');
    }
  }

  /// Get subject details
  static Future<SubjectData?> getSubjectDetails(String examId, String subjectId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/subjects/$examId/$subjectId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return SubjectData.fromJson(data['data']);
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('Failed to get subject details: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get subject details error: $e');
    }
  }

  /// Start a subject-based test
  static Future<TestSessionData> startSubjectTest({
    required String examId,
    required String subjectId,
    String? difficulty,
    String? language,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/subjects/$examId/$subjectId/start'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'difficulty': difficulty,
          'language': language,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return TestSessionData.fromJson(data['data']);
      } else {
        throw Exception('Failed to start subject test: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Start subject test error: $e');
    }
  }

  /// Submit answer for a question
  static Future<AnswerResult> submitAnswer({
    required String sessionId,
    required String questionId,
    required String userAnswer,
    required int timeSpent,
  }) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/subjects/test/$sessionId/answer'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'questionId': questionId,
          'userAnswer': userAnswer,
          'timeSpent': timeSpent,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return AnswerResult.fromJson(data['data']);
      } else {
        throw Exception('Failed to submit answer: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Submit answer error: $e');
    }
  }

  /// Complete subject test
  static Future<TestResult> completeSubjectTest(String sessionId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/subjects/test/$sessionId/complete'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return TestResult.fromJson(data['data']);
      } else {
        throw Exception('Failed to complete subject test: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Complete subject test error: $e');
    }
  }

  /// Get subject test history
  static Future<List<TestHistoryItem>> getSubjectTestHistory(String examId, String subjectId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/subjects/$examId/$subjectId/history'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['data'] as List)
            .map((item) => TestHistoryItem.fromJson(item))
            .toList();
      } else {
        throw Exception('Failed to get test history: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get test history error: $e');
    }
  }

  /// Get subject performance analytics
  static Future<SubjectPerformance> getSubjectPerformance(String examId, String subjectId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/subjects/$examId/$subjectId/performance'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return SubjectPerformance.fromJson(data['data']);
      } else {
        throw Exception('Failed to get performance: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get performance error: $e');
    }
  }
}

// Data Models
class SubjectData {
  final String id;
  final String name;
  final String description;
  final int totalQuestions;
  final int timeLimit;

  SubjectData({
    required this.id,
    required this.name,
    required this.description,
    required this.totalQuestions,
    required this.timeLimit,
  });

  factory SubjectData.fromJson(Map<String, dynamic> json) {
    return SubjectData(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      totalQuestions: json['totalQuestions'] ?? 0,
      timeLimit: json['timeLimit'] ?? 0,
    );
  }
}

class TestSessionData {
  final String sessionId;
  final SubjectData subject;
  final List<TestQuestion> questions;
  final int totalQuestions;
  final int timeLimit;

  TestSessionData({
    required this.sessionId,
    required this.subject,
    required this.questions,
    required this.totalQuestions,
    required this.timeLimit,
  });

  factory TestSessionData.fromJson(Map<String, dynamic> json) {
    return TestSessionData(
      sessionId: json['sessionId'] ?? '',
      subject: SubjectData.fromJson(json['subject'] ?? {}),
      questions: (json['questions'] as List)
          .map((q) => TestQuestion.fromJson(q))
          .toList(),
      totalQuestions: json['totalQuestions'] ?? 0,
      timeLimit: json['timeLimit'] ?? 0,
    );
  }
}

class TestQuestion {
  final String id;
  final String text;
  final List<String> options;
  final String subject;
  final String difficulty;
  final int marks;
  final int timeLimit;

  TestQuestion({
    required this.id,
    required this.text,
    required this.options,
    required this.subject,
    required this.difficulty,
    required this.marks,
    required this.timeLimit,
  });

  factory TestQuestion.fromJson(Map<String, dynamic> json) {
    return TestQuestion(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      subject: json['subject'] ?? '',
      difficulty: json['difficulty'] ?? '',
      marks: json['marks'] ?? 1,
      timeLimit: json['timeLimit'] ?? 60,
    );
  }
}

class AnswerResult {
  final bool isCorrect;
  final String correctAnswer;
  final String? solution;
  final String? explanation;

  AnswerResult({
    required this.isCorrect,
    required this.correctAnswer,
    this.solution,
    this.explanation,
  });

  factory AnswerResult.fromJson(Map<String, dynamic> json) {
    return AnswerResult(
      isCorrect: json['isCorrect'] ?? false,
      correctAnswer: json['correctAnswer'] ?? '',
      solution: json['solution'],
      explanation: json['explanation'],
    );
  }
}

class TestResult {
  final String sessionId;
  final double score;
  final int correctAnswers;
  final int totalQuestions;
  final int totalTimeSpent;
  final List<ResultQuestion> questions;

  TestResult({
    required this.sessionId,
    required this.score,
    required this.correctAnswers,
    required this.totalQuestions,
    required this.totalTimeSpent,
    required this.questions,
  });

  factory TestResult.fromJson(Map<String, dynamic> json) {
    return TestResult(
      sessionId: json['sessionId'] ?? '',
      score: (json['score'] ?? 0).toDouble(),
      correctAnswers: json['correctAnswers'] ?? 0,
      totalQuestions: json['totalQuestions'] ?? 0,
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      questions: (json['questions'] as List)
          .map((q) => ResultQuestion.fromJson(q))
          .toList(),
    );
  }
}

class ResultQuestion {
  final String id;
  final String text;
  final List<String> options;
  final String correctAnswer;
  final String? userAnswer;
  final bool isCorrect;
  final String? solution;
  final String? explanation;
  final int timeSpent;

  ResultQuestion({
    required this.id,
    required this.text,
    required this.options,
    required this.correctAnswer,
    this.userAnswer,
    required this.isCorrect,
    this.solution,
    this.explanation,
    required this.timeSpent,
  });

  factory ResultQuestion.fromJson(Map<String, dynamic> json) {
    return ResultQuestion(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctAnswer: json['correctAnswer'] ?? '',
      userAnswer: json['userAnswer'],
      isCorrect: json['isCorrect'] ?? false,
      solution: json['solution'],
      explanation: json['explanation'],
      timeSpent: json['timeSpent'] ?? 0,
    );
  }
}

class TestHistoryItem {
  final String id;
  final double score;
  final int correctAnswers;
  final int totalQuestions;
  final int totalTimeSpent;
  final DateTime completedAt;

  TestHistoryItem({
    required this.id,
    required this.score,
    required this.correctAnswers,
    required this.totalQuestions,
    required this.totalTimeSpent,
    required this.completedAt,
  });

  factory TestHistoryItem.fromJson(Map<String, dynamic> json) {
    return TestHistoryItem(
      id: json['id'] ?? '',
      score: (json['score'] ?? 0).toDouble(),
      correctAnswers: json['correctAnswers'] ?? 0,
      totalQuestions: json['totalQuestions'] ?? 0,
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      completedAt: DateTime.parse(json['completedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class SubjectPerformance {
  final int totalTests;
  final double averageScore;
  final double bestScore;
  final double improvement;
  final List<TestHistoryItem> recentSessions;
  final UserProgress? userProgress;

  SubjectPerformance({
    required this.totalTests,
    required this.averageScore,
    required this.bestScore,
    required this.improvement,
    required this.recentSessions,
    this.userProgress,
  });

  factory SubjectPerformance.fromJson(Map<String, dynamic> json) {
    return SubjectPerformance(
      totalTests: json['totalTests'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      bestScore: (json['bestScore'] ?? 0).toDouble(),
      improvement: (json['improvement'] ?? 0).toDouble(),
      recentSessions: (json['recentSessions'] as List)
          .map((item) => TestHistoryItem.fromJson(item))
          .toList(),
      userProgress: json['userProgress'] != null 
          ? UserProgress.fromJson(json['userProgress'])
          : null,
    );
  }
}

class UserProgress {
  final int totalQuestionsAttempted;
  final int totalCorrectAnswers;
  final double averageAccuracy;
  final DateTime? lastTestDate;

  UserProgress({
    required this.totalQuestionsAttempted,
    required this.totalCorrectAnswers,
    required this.averageAccuracy,
    this.lastTestDate,
  });

  factory UserProgress.fromJson(Map<String, dynamic> json) {
    return UserProgress(
      totalQuestionsAttempted: json['totalQuestionsAttempted'] ?? 0,
      totalCorrectAnswers: json['totalCorrectAnswers'] ?? 0,
      averageAccuracy: (json['averageAccuracy'] ?? 0).toDouble(),
      lastTestDate: json['lastTestDate'] != null 
          ? DateTime.parse(json['lastTestDate'])
          : null,
    );
  }
}

// Flutter UI Components

class SubjectSelectionWidget extends StatefulWidget {
  final String examId;
  final Function(SubjectData) onSubjectSelected;

  const SubjectSelectionWidget({
    Key? key,
    required this.examId,
    required this.onSubjectSelected,
  }) : super(key: key);

  @override
  _SubjectSelectionWidgetState createState() => _SubjectSelectionWidgetState();
}

class _SubjectSelectionWidgetState extends State<SubjectSelectionWidget> {
  bool _isLoading = false;
  List<SubjectData> _subjects = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSubjects();
  }

  Future<void> _loadSubjects() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final subjects = await SubjectBasedTestService.getSubjectsForExam(widget.examId);
      setState(() {
        _subjects = subjects;
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
          'Choose a Subject for Test',
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
                childAspectRatio: 1.1,
              ),
              itemCount: _subjects.length,
              itemBuilder: (context, index) {
                final subject = _subjects[index];
                return _buildSubjectCard(subject);
              },
            ),
          ),
      ],
    );
  }

  Widget _buildSubjectCard(SubjectData subject) {
    return GestureDetector(
      onTap: () => widget.onSubjectSelected(subject),
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
              Icon(
                _getSubjectIcon(subject.name),
                color: Colors.blue,
                size: 32,
              ),
              SizedBox(height: 12),
              Text(
                subject.name,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: 8),
              Text(
                subject.description,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              Spacer(),
              Row(
                children: [
                  Icon(Icons.quiz, size: 16, color: Colors.green),
                  SizedBox(width: 4),
                  Text(
                    '${subject.totalQuestions} Questions',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.green,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Spacer(),
                  Icon(Icons.access_time, size: 16, color: Colors.orange),
                  SizedBox(width: 4),
                  Text(
                    '${subject.timeLimit} min',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.orange,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getSubjectIcon(String subjectName) {
    switch (subjectName.toLowerCase()) {
      case 'mathematics':
      case 'quantitative aptitude':
        return Icons.calculate;
      case 'english':
      case 'english comprehension':
      case 'english language':
        return Icons.language;
      case 'reasoning':
      case 'general intelligence':
      case 'general intelligence and reasoning':
        return Icons.psychology;
      case 'general awareness':
      case 'general knowledge':
        return Icons.public;
      case 'civil engineering':
        return Icons.architecture;
      case 'mechanical engineering':
        return Icons.precision_manufacturing;
      case 'electrical engineering':
        return Icons.electric_bolt;
      case 'general science':
        return Icons.science;
      default:
        return Icons.school;
    }
  }
}

class SubjectTestScreen extends StatefulWidget {
  final String examId;
  final SubjectData subject;

  const SubjectTestScreen({
    Key? key,
    required this.examId,
    required this.subject,
  }) : super(key: key);

  @override
  _SubjectTestScreenState createState() => _SubjectTestScreenState();
}

class _SubjectTestScreenState extends State<SubjectTestScreen> {
  bool _isLoading = false;
  TestSessionData? _testSession;
  String? _error;
  int _currentQuestionIndex = 0;
  Map<String, String?> _userAnswers = {};
  Map<String, int> _timeSpent = {};
  Map<String, DateTime> _questionStartTime = {};
  bool _showResults = false;
  TestResult? _testResult;

  @override
  void initState() {
    super.initState();
    _startTest();
  }

  Future<void> _startTest() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final testSession = await SubjectBasedTestService.startSubjectTest(
        examId: widget.examId,
        subjectId: widget.subject.id,
      );

      setState(() {
        _testSession = testSession;
        _isLoading = false;
      });

      // Start timer for first question
      _startQuestionTimer();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _startQuestionTimer() {
    if (_testSession != null && _currentQuestionIndex < _testSession!.questions.length) {
      final questionId = _testSession!.questions[_currentQuestionIndex].id;
      _questionStartTime[questionId] = DateTime.now();
    }
  }

  void _selectAnswer(String answer) {
    if (_testSession == null) return;

    final questionId = _testSession!.questions[_currentQuestionIndex].id;
    setState(() {
      _userAnswers[questionId] = answer;
    });
  }

  Future<void> _nextQuestion() async {
    if (_testSession == null) return;

    // Submit current answer
    await _submitCurrentAnswer();

    if (_currentQuestionIndex < _testSession!.questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
      _startQuestionTimer();
    } else {
      await _completeTest();
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  Future<void> _submitCurrentAnswer() async {
    if (_testSession == null) return;

    final question = _testSession!.questions[_currentQuestionIndex];
    final questionId = question.id;
    final userAnswer = _userAnswers[questionId];
    
    if (userAnswer != null) {
      final startTime = _questionStartTime[questionId];
      final timeSpent = startTime != null 
          ? DateTime.now().difference(startTime).inSeconds 
          : 0;

      try {
        await SubjectBasedTestService.submitAnswer(
          sessionId: _testSession!.sessionId,
          questionId: questionId,
          userAnswer: userAnswer,
          timeSpent: timeSpent,
        );
      } catch (e) {
        print('Error submitting answer: $e');
      }
    }
  }

  Future<void> _completeTest() async {
    try {
      final result = await SubjectBasedTestService.completeSubjectTest(_testSession!.sessionId);
      setState(() {
        _testResult = result;
        _showResults = true;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.subject.name)),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.subject.name)),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text('Error: $_error'),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _startTest,
                child: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_testSession == null) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.subject.name)),
        body: Center(child: Text('No test session available')),
      );
    }

    if (_showResults && _testResult != null) {
      return _buildResultsScreen();
    }

    return _buildQuestionScreen();
  }

  Widget _buildQuestionScreen() {
    final question = _testSession!.questions[_currentQuestionIndex];
    final userAnswer = _userAnswers[question.id];

    return Scaffold(
      appBar: AppBar(
        title: Text('Question ${_currentQuestionIndex + 1}/${_testSession!.questions.length}'),
        actions: [
          Center(
            child: Padding(
              padding: EdgeInsets.only(right: 16),
              child: Text(
                '${_userAnswers.length}/${_testSession!.questions.length}',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question text
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      question.text,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 24),

                    // Options
                    ...question.options.asMap().entries.map((entry) {
                      final index = entry.key;
                      final option = entry.value;
                      final isSelected = userAnswer == option;

                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        color: isSelected ? Colors.blue.withOpacity(0.1) : null,
                        child: InkWell(
                          onTap: () => _selectAnswer(option),
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: Row(
                              children: [
                                Radio<String>(
                                  value: option,
                                  groupValue: userAnswer,
                                  onChanged: (value) => _selectAnswer(value!),
                                ),
                                SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    '${String.fromCharCode(65 + index)}. $option',
                                    style: TextStyle(fontSize: 16),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
            ),

            // Navigation buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _currentQuestionIndex > 0 ? _previousQuestion : null,
                    child: Text('Previous'),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _nextQuestion,
                    child: Text(_currentQuestionIndex < _testSession!.questions.length - 1
                        ? 'Next'
                        : 'Finish'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsScreen() {
    final result = _testResult!;
    final percentage = result.score;

    return Scaffold(
      appBar: AppBar(title: Text('Test Results')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            // Score card
            Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Column(
                  children: [
                    Icon(
                      percentage >= 70 ? Icons.celebration : Icons.school,
                      size: 64,
                      color: percentage >= 70 ? Colors.green : Colors.orange,
                    ),
                    SizedBox(height: 16),
                    Text(
                      '${percentage.toStringAsFixed(1)}%',
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: percentage >= 70 ? Colors.green : Colors.orange,
                      ),
                    ),
                    Text(
                      '${result.correctAnswers} out of ${result.totalQuestions} correct',
                      style: TextStyle(fontSize: 18),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Time: ${(result.totalTimeSpent / 60).toStringAsFixed(1)} minutes',
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                    ),
                    SizedBox(height: 16),
                    Text(
                      percentage >= 70 ? 'Excellent! Keep it up!' : 'Good effort! Keep practicing!',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),

            // Detailed results
            Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Detailed Results',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 16),
                    ...result.questions.asMap().entries.map((entry) {
                      final index = entry.key;
                      final question = entry.value;
                      
                      return ExpansionTile(
                        title: Text(
                          'Question ${index + 1}',
                          style: TextStyle(
                            color: question.isCorrect ? Colors.green : Colors.red,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Text(
                          question.isCorrect ? 'Correct' : 'Incorrect',
                          style: TextStyle(
                            color: question.isCorrect ? Colors.green : Colors.red,
                          ),
                        ),
                        children: [
                          Padding(
                            padding: EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  question.text,
                                  style: TextStyle(fontSize: 16),
                                ),
                                SizedBox(height: 12),
                                Text(
                                  'Your Answer: ${question.userAnswer ?? 'Not answered'}',
                                  style: TextStyle(
                                    color: question.isCorrect ? Colors.green : Colors.red,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  'Correct Answer: ${question.correctAnswer}',
                                  style: TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                if (question.solution != null) ...[
                                  SizedBox(height: 12),
                                  Text(
                                    'Solution:',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(question.solution!),
                                ],
                                if (question.explanation != null) ...[
                                  SizedBox(height: 8),
                                  Text(
                                    'Explanation:',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(question.explanation!),
                                ],
                                SizedBox(height: 8),
                                Text(
                                  'Time spent: ${question.timeSpent} seconds',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _showResults = false;
                        _currentQuestionIndex = 0;
                        _userAnswers.clear();
                        _timeSpent.clear();
                        _questionStartTime.clear();
                      });
                      _startTest();
                    },
                    child: Text('Try Again'),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Back to Subjects'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
} 