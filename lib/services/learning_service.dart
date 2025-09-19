import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LearningService extends ChangeNotifier {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  bool _isLoading = false;
  String? _error;
  Map<String, dynamic>? _learningPathway;
  List<Map<String, dynamic>> _practiceHistory = [];
  Map<String, dynamic>? _performanceStats;

  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get learningPathway => _learningPathway;
  List<Map<String, dynamic>> get practiceHistory => _practiceHistory;
  Map<String, dynamic>? get performanceStats => _performanceStats;

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

  // Get personalized learning pathway
  Future<Map<String, dynamic>?> getLearningPathway() async {
    _setLoading(true);
    _setError(null);

    try {
      final token = await _getAuthToken();
      if (token == null) {
        _setError('Not authenticated');
        _setLoading(false);
        return null;
      }

      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/learning-pathway'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _learningPathway = data['pathway'];
          _setLoading(false);
          return _learningPathway;
        } else {
          _setError(data['message'] ?? 'Failed to get learning pathway');
          _setLoading(false);
          return null;
        }
      } else {
        final errorData = json.decode(response.body);
        _setError(errorData['message'] ?? 'Failed to get learning pathway');
        _setLoading(false);
        return null;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return null;
    }
  }

  // Submit practice session results
  Future<bool> submitPracticeResults(Map<String, dynamic> results) async {
    _setLoading(true);
    _setError(null);

    try {
      final token = await _getAuthToken();
      if (token == null) {
        _setError('Not authenticated');
        _setLoading(false);
        return false;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/api/v1/users/practice-results'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(results),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          // Add to local history
          _practiceHistory.insert(0, results);
          Fluttertoast.showToast(
            msg: 'Practice session completed!',
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM,
          );
          _setLoading(false);
          return true;
        } else {
          _setError(data['message'] ?? 'Failed to submit results');
          _setLoading(false);
          return false;
        }
      } else {
        final errorData = json.decode(response.body);
        _setError(errorData['message'] ?? 'Failed to submit results');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Get practice history
  Future<void> getPracticeHistory() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return;

      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/practice-history'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _practiceHistory = List<Map<String, dynamic>>.from(data['history']);
          notifyListeners();
        }
      }
    } catch (e) {
      print('Get practice history error: $e');
    }
  }

  // Get performance statistics
  Future<Map<String, dynamic>?> getPerformanceStats() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/performance-stats'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _performanceStats = data['stats'];
          return _performanceStats;
        }
      }
      return null;
    } catch (e) {
      print('Get performance stats error: $e');
      return null;
    }
  }

  // Get recommended next actions
  Future<List<Map<String, dynamic>>> getRecommendedActions() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return [];

      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/recommended-actions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return List<Map<String, dynamic>>.from(data['actions']);
        }
      }
      return [];
    } catch (e) {
      print('Get recommended actions error: $e');
      return [];
    }
  }

  // Update learning pathway based on performance
  Future<bool> updateLearningPathway(Map<String, dynamic> performanceData) async {
    _setLoading(true);
    _setError(null);

    try {
      final token = await _getAuthToken();
      if (token == null) {
        _setError('Not authenticated');
        _setLoading(false);
        return false;
      }

      final response = await http.patch(
        Uri.parse('$baseUrl/api/v1/users/learning-pathway'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(performanceData),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _learningPathway = data['pathway'];
          Fluttertoast.showToast(
            msg: 'Learning pathway updated!',
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM,
          );
          _setLoading(false);
          return true;
        } else {
          _setError(data['message'] ?? 'Failed to update learning pathway');
          _setLoading(false);
          return false;
        }
      } else {
        final errorData = json.decode(response.body);
        _setError(errorData['message'] ?? 'Failed to update learning pathway');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Get daily study plan
  Future<Map<String, dynamic>?> getDailyStudyPlan() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/daily-study-plan'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['plan'];
        }
      }
      return null;
    } catch (e) {
      print('Get daily study plan error: $e');
      return null;
    }
  }

  // Mark task as completed
  Future<bool> markTaskCompleted(String taskId) async {
    try {
      final token = await _getAuthToken();
      if (token == null) return false;

      final response = await http.patch(
        Uri.parse('$baseUrl/api/v1/users/complete-task'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({'taskId': taskId}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      print('Mark task completed error: $e');
      return false;
    }
  }
}