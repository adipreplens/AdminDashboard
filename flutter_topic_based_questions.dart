import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';

// Topic-based Question Service for Flutter
class TopicBasedQuestionService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';

  /// Get all exams with their subjects and topics
  static Future<Map<String, dynamic>> getAllExamsWithTopics() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/topics/exams'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to get exams with topics: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get exams with topics error: $e');
    }
  }

  /// Get subjects for an exam
  static Future<List<SubjectData>> getSubjectsForExam(String examId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/topics/$examId/subjects'),
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

  /// Get topics for a subject
  static Future<List<TopicData>> getTopicsForSubject(String examId, String subjectId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/topics/$examId/subjects/$subjectId/topics'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['data'] as List)
            .map((topic) => TopicData.fromJson(topic))
            .toList();
      } else {
        throw Exception('Failed to get topics: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get topics error: $e');
    }
  }

  /// Get questions by topic
  static Future<QuestionsResponse> getQuestionsByTopic({
    required String examId,
    String? subject,
    String? topic,
    String? difficulty,
    String? language,
    int limit = 50,
    int skip = 0,
  }) async {
    try {
      final queryParams = <String, String>{
        'limit': limit.toString(),
        'skip': skip.toString(),
      };

      if (subject != null) queryParams['subject'] = subject;
      if (topic != null) queryParams['topic'] = topic;
      if (difficulty != null) queryParams['difficulty'] = difficulty;
      if (language != null) queryParams['language'] = language;

      final uri = Uri.parse('$baseUrl/topics/$examId/questions').replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return QuestionsResponse.fromJson(data['data']);
      } else {
        throw Exception('Failed to get questions by topic: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get questions by topic error: $e');
    }
  }

  /// Get questions by multiple topics
  static Future<QuestionsResponse> getQuestionsByTopics({
    required String examId,
    required List<String> topics,
    String? difficulty,
    String? language,
    int limit = 50,
    int skip = 0,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/topics/$examId/questions/multiple'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'topics': topics,
          'difficulty': difficulty,
          'language': language,
          'limit': limit,
          'skip': skip,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return QuestionsResponse.fromJson(data['data']);
      } else {
        throw Exception('Failed to get questions by topics: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get questions by topics error: $e');
    }
  }

  /// Get topic question count
  static Future<Map<String, dynamic>> getTopicQuestionCount(String examId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/topics/$examId/count'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to get topic count: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Get topic count error: $e');
    }
  }
}

// Data Models
class SubjectData {
  final String id;
  final String name;
  final List<String> topics;

  SubjectData({
    required this.id,
    required this.name,
    required this.topics,
  });

  factory SubjectData.fromJson(Map<String, dynamic> json) {
    return SubjectData(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      topics: List<String>.from(json['topics'] ?? []),
    );
  }
}

class TopicData {
  final String id;
  final String name;

  TopicData({
    required this.id,
    required this.name,
  });

  factory TopicData.fromJson(Map<String, dynamic> json) {
    return TopicData(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
    );
  }
}

class QuestionsResponse {
  final List<Question> questions;
  final int total;
  final bool hasMore;

  QuestionsResponse({
    required this.questions,
    required this.total,
    required this.hasMore,
  });

  factory QuestionsResponse.fromJson(Map<String, dynamic> json) {
    return QuestionsResponse(
      questions: (json['questions'] as List)
          .map((q) => Question.fromJson(q))
          .toList(),
      total: json['total'] ?? 0,
      hasMore: json['hasMore'] ?? false,
    );
  }
}

class Question {
  final String id;
  final String text;
  final List<String> options;
  final String answer;
  final String subject;
  final String exam;
  final String difficulty;
  final List<String> tags;
  final int marks;
  final int timeLimit;
  final String publishStatus;

  Question({
    required this.id,
    required this.text,
    required this.options,
    required this.answer,
    required this.subject,
    required this.exam,
    required this.difficulty,
    required this.tags,
    required this.marks,
    required this.timeLimit,
    required this.publishStatus,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['_id'] ?? '',
      text: json['text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      answer: json['answer'] ?? '',
      subject: json['subject'] ?? '',
      exam: json['exam'] ?? '',
      difficulty: json['difficulty'] ?? '',
      tags: List<String>.from(json['tags'] ?? []),
      marks: json['marks'] ?? 1,
      timeLimit: json['timeLimit'] ?? 60,
      publishStatus: json['publishStatus'] ?? '',
    );
  }
}

// Flutter UI Components

class TopicSelectionWidget extends StatefulWidget {
  final String examId;
  final Function(List<String>) onTopicsSelected;

  const TopicSelectionWidget({
    Key? key,
    required this.examId,
    required this.onTopicsSelected,
  }) : super(key: key);

  @override
  _TopicSelectionWidgetState createState() => _TopicSelectionWidgetState();
}

class _TopicSelectionWidgetState extends State<TopicSelectionWidget> {
  bool _isLoading = false;
  List<SubjectData> _subjects = [];
  Map<String, List<TopicData>> _topicsBySubject = {};
  Set<String> _selectedTopics = {};
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
      final subjects = await TopicBasedQuestionService.getSubjectsForExam(widget.examId);
      setState(() {
        _subjects = subjects;
        _isLoading = false;
      });

      // Load topics for each subject
      for (final subject in subjects) {
        await _loadTopicsForSubject(subject.id);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _loadTopicsForSubject(String subjectId) async {
    try {
      final topics = await TopicBasedQuestionService.getTopicsForSubject(widget.examId, subjectId);
      setState(() {
        _topicsBySubject[subjectId] = topics;
      });
    } catch (e) {
      print('Error loading topics for subject $subjectId: $e');
    }
  }

  void _toggleTopic(String topicId) {
    setState(() {
      if (_selectedTopics.contains(topicId)) {
        _selectedTopics.remove(topicId);
      } else {
        _selectedTopics.add(topicId);
      }
    });
  }

  void _selectAllTopics() {
    setState(() {
      _selectedTopics.clear();
      for (final topics in _topicsBySubject.values) {
        for (final topic in topics) {
          _selectedTopics.add(topic.id);
        }
      }
    });
  }

  void _clearSelection() {
    setState(() {
      _selectedTopics.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          children: [
            Expanded(
              child: Text(
                'Select Topics for Practice',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            TextButton(
              onPressed: _selectedTopics.isNotEmpty ? _clearSelection : null,
              child: Text('Clear'),
            ),
            TextButton(
              onPressed: _selectAllTopics,
              child: Text('Select All'),
            ),
          ],
        ),
        SizedBox(height: 16),

        // Selection summary
        if (_selectedTopics.isNotEmpty)
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.blue, size: 20),
                SizedBox(width: 8),
                Text(
                  '${_selectedTopics.length} topics selected',
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Spacer(),
                ElevatedButton(
                  onPressed: () => widget.onTopicsSelected(_selectedTopics.toList()),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: Text(
                    'Start Practice',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        SizedBox(height: 16),

        // Content
        if (_isLoading)
          Center(child: CircularProgressIndicator())
        else if (_error != null)
          Text(
            'Error: $_error',
            style: TextStyle(color: Colors.red),
          )
        else
          Expanded(
            child: ListView.builder(
              itemCount: _subjects.length,
              itemBuilder: (context, index) {
                final subject = _subjects[index];
                final topics = _topicsBySubject[subject.id] ?? [];

                return _buildSubjectCard(subject, topics);
              },
            ),
          ),
      ],
    );
  }

  Widget _buildSubjectCard(SubjectData subject, List<TopicData> topics) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      child: ExpansionTile(
        title: Text(
          subject.name,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Text('${topics.length} topics available'),
        children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: topics.map((topic) {
                final isSelected = _selectedTopics.contains(topic.id);
                return FilterChip(
                  label: Text(topic.name),
                  selected: isSelected,
                  onSelected: (selected) => _toggleTopic(topic.id),
                  selectedColor: Colors.blue.withOpacity(0.2),
                  checkmarkColor: Colors.blue,
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class TopicBasedQuestionScreen extends StatefulWidget {
  final String examId;
  final List<String> selectedTopics;

  const TopicBasedQuestionScreen({
    Key? key,
    required this.examId,
    required this.selectedTopics,
  }) : super(key: key);

  @override
  _TopicBasedQuestionScreenState createState() => _TopicBasedQuestionScreenState();
}

class _TopicBasedQuestionScreenState extends State<TopicBasedQuestionScreen> {
  bool _isLoading = false;
  QuestionsResponse? _questionsResponse;
  String? _error;
  int _currentQuestionIndex = 0;
  Map<int, String?> _userAnswers = {};
  bool _showResults = false;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await TopicBasedQuestionService.getQuestionsByTopics(
        examId: widget.examId,
        topics: widget.selectedTopics,
        limit: 20,
      );

      setState(() {
        _questionsResponse = response;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _selectAnswer(String answer) {
    setState(() {
      _userAnswers[_currentQuestionIndex] = answer;
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < (_questionsResponse?.questions.length ?? 0) - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  void _showResults() {
    setState(() {
      _showResults = true;
    });
  }

  int _getCorrectAnswers() {
    int correct = 0;
    for (int i = 0; i < (_questionsResponse?.questions.length ?? 0); i++) {
      final question = _questionsResponse!.questions[i];
      final userAnswer = _userAnswers[i];
      if (userAnswer == question.answer) {
        correct++;
      }
    }
    return correct;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('Topic Practice')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: Text('Topic Practice')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text('Error: $_error'),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadQuestions,
                child: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_questionsResponse == null || _questionsResponse!.questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text('Topic Practice')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.question_mark, size: 64, color: Colors.grey),
              SizedBox(height: 16),
              Text('No questions available for selected topics'),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    if (_showResults) {
      return _buildResultsScreen();
    }

    return _buildQuestionScreen();
  }

  Widget _buildQuestionScreen() {
    final question = _questionsResponse!.questions[_currentQuestionIndex];
    final userAnswer = _userAnswers[_currentQuestionIndex];

    return Scaffold(
      appBar: AppBar(
        title: Text('Question ${_currentQuestionIndex + 1}/${_questionsResponse!.questions.length}'),
        actions: [
          Center(
            child: Padding(
              padding: EdgeInsets.only(right: 16),
              child: Text(
                '${_getCorrectAnswers()}/${_questionsResponse!.questions.length}',
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
            Text(
              question.text,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 24),

            // Options
            Expanded(
              child: ListView.builder(
                itemCount: question.options.length,
                itemBuilder: (context, index) {
                  final option = question.options[index];
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
                                option,
                                style: TextStyle(fontSize: 16),
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
                    onPressed: _currentQuestionIndex < _questionsResponse!.questions.length - 1
                        ? _nextQuestion
                        : _showResults,
                    child: Text(_currentQuestionIndex < _questionsResponse!.questions.length - 1
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
    final totalQuestions = _questionsResponse!.questions.length;
    final correctAnswers = _getCorrectAnswers();
    final percentage = (correctAnswers / totalQuestions) * 100;

    return Scaffold(
      appBar: AppBar(title: Text('Results')),
      body: Padding(
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
                      '$correctAnswers out of $totalQuestions correct',
                      style: TextStyle(fontSize: 18),
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
                      });
                    },
                    child: Text('Try Again'),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Back to Topics'),
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