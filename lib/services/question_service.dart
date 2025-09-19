import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/question_model.dart';

class QuestionService extends ChangeNotifier {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  bool _isLoading = false;
  String? _error;
  List<Question> _questions = [];
  List<Question> _filteredQuestions = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Question> get questions => _filteredQuestions;

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set error state
  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  // Get auth token from storage
  Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Fetch all questions from admin dashboard
  Future<void> fetchAllQuestions() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/questions'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _questions = (data['questions'] as List)
            .map((json) => Question.fromJson(json))
            .toList();
        _filteredQuestions = _questions;
        _setLoading(false);
      } else {
        _setError('Failed to fetch questions');
        _setLoading(false);
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
    }
  }

  // Filter questions by exam
  void filterByExam(String exam) {
    _filteredQuestions = _questions.where((q) => q.exam == exam).toList();
    notifyListeners();
  }

  // Filter questions by subject
  void filterBySubject(String subject) {
    _filteredQuestions = _questions.where((q) => q.subject == subject).toList();
    notifyListeners();
  }

  // Filter questions by difficulty
  void filterByDifficulty(String difficulty) {
    _filteredQuestions = _questions.where((q) => q.difficulty == difficulty).toList();
    notifyListeners();
  }

  // Filter questions by level
  void filterByLevel(String level) {
    _filteredQuestions = _questions.where((q) => q.level == level).toList();
    notifyListeners();
  }

  // Get practice questions for a specific exam and subject
  Future<List<Question>> getPracticeQuestions({
    required String exam,
    required String subject,
    required String level,
    int limit = 25,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/questions?exam=$exam&subject=$subject&level=$level&limit=$limit'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['questions'] as List)
            .map((json) => Question.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching practice questions: $e');
      return [];
    }
  }

  // Get section test questions
  Future<List<Question>> getSectionTestQuestions({
    required String exam,
    required String subject,
    required String testType,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/questions?exam=$exam&subject=$subject&moduleType=$testType'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['questions'] as List)
            .map((json) => Question.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching section test questions: $e');
      return [];
    }
  }

  // Get mock test questions
  Future<List<Question>> getMockTestQuestions({
    required String exam,
    required String testSeriesId,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/questions?exam=$exam&testSeriesId=$testSeriesId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['questions'] as List)
            .map((json) => Question.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching mock test questions: $e');
      return [];
    }
  }

  // Get available subjects for an exam
  List<String> getSubjectsForExam(String exam) {
    return _questions
        .where((q) => q.exam == exam)
        .map((q) => q.subject)
        .toSet()
        .toList();
  }

  // Get available difficulty levels
  List<String> getDifficultyLevels() {
    return _questions
        .map((q) => q.difficulty)
        .toSet()
        .toList();
  }

  // Get available levels
  List<String> getLevels() {
    return _questions
        .map((q) => q.level)
        .toSet()
        .toList();
  }

  // Get statistics
  Map<String, int> getQuestionStats() {
    return {
      'total': _questions.length,
      'published': _questions.where((q) => q.publishStatus == 'published').length,
      'draft': _questions.where((q) => q.publishStatus == 'draft').length,
    };
  }

  // Get exam-wise statistics
  Map<String, int> getExamStats() {
    Map<String, int> stats = {};
    for (var question in _questions) {
      stats[question.exam] = (stats[question.exam] ?? 0) + 1;
    }
    return stats;
  }

  // Get subject-wise statistics for an exam
  Map<String, int> getSubjectStats(String exam) {
    Map<String, int> stats = {};
    for (var question in _questions.where((q) => q.exam == exam)) {
      stats[question.subject] = (stats[question.subject] ?? 0) + 1;
    }
    return stats;
  }

  // Clear filters
  void clearFilters() {
    _filteredQuestions = _questions;
    notifyListeners();
  }
}