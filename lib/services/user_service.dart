import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_profile.dart';

class UserService extends ChangeNotifier {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  bool _isLoading = false;
  String? _error;
  UserProfile? _userProfile;
  String? _authToken;

  bool get isLoading => _isLoading;
  String? get error => _error;
  UserProfile? get userProfile => _userProfile;

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
    if (_authToken != null) return _authToken;
    
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
    return _authToken;
  }

  // Update user exam selection
  Future<bool> updateUserExam(String examId) async {
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
        Uri.parse('$baseUrl/api/v1/users/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({'exam': examId}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _userProfile = UserProfile.fromJson(data['user']);
          Fluttertoast.showToast(
            msg: 'Exam selection updated!',
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM,
          );
          _setLoading(false);
          return true;
        } else {
          _setError(data['message'] ?? 'Failed to update exam');
          _setLoading(false);
          return false;
        }
      } else {
        final errorData = json.decode(response.body);
        _setError(errorData['message'] ?? 'Failed to update exam');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      Fluttertoast.showToast(
        msg: 'Network error: $e',
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
      _setLoading(false);
      return false;
    }
  }

  // Update user profile (profiling questions)
  Future<bool> updateUserProfile(Map<String, dynamic> profileData) async {
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
        Uri.parse('$baseUrl/api/v1/users/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(profileData),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _userProfile = UserProfile.fromJson(data['user']);
          Fluttertoast.showToast(
            msg: 'Profile updated successfully!',
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM,
          );
          _setLoading(false);
          return true;
        } else {
          _setError(data['message'] ?? 'Failed to update profile');
          _setLoading(false);
          return false;
        }
      } else {
        final errorData = json.decode(response.body);
        _setError(errorData['message'] ?? 'Failed to update profile');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      Fluttertoast.showToast(
        msg: 'Network error: $e',
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
      _setLoading(false);
      return false;
    }
  }

  // Get user profile
  Future<UserProfile?> getUserProfile() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _userProfile = UserProfile.fromJson(data['user']);
          return _userProfile;
        }
      }
      return null;
    } catch (e) {
      print('Get user profile error: $e');
      return null;
    }
  }

  // Get personalized questions
  Future<List<Map<String, dynamic>>?> getPersonalizedQuestions() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/personalized-questions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return List<Map<String, dynamic>>.from(data['questions']);
        }
      }
      return null;
    } catch (e) {
      print('Get personalized questions error: $e');
      return null;
    }
  }

  // Submit diagnostic test results
  Future<bool> submitDiagnosticResults(Map<String, dynamic> results) async {
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
        Uri.parse('$baseUrl/api/v1/users/diagnostic-results'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(results),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          Fluttertoast.showToast(
            msg: 'Diagnostic test completed!',
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
      Fluttertoast.showToast(
        msg: 'Network error: $e',
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
      _setLoading(false);
      return false;
    }
  }

  // Get learning pathway
  Future<Map<String, dynamic>?> getLearningPathway() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;

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
          return data['pathway'];
        }
      }
      return null;
    } catch (e) {
      print('Get learning pathway error: $e');
      return null;
    }
  }
}