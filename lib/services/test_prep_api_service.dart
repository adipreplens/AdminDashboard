import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class TestPrepApiService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com/api/v1/users';
  String? _accessToken;
  String? _refreshToken;

  // Store questions for detailed solutions
  Map<String, dynamic> _questionsForDetailedSolutions = {};

  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString('accessToken');
    _refreshToken = prefs.getString('refreshToken');
  }

  Future<void> _storeTokens(String accessToken, String refreshToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessToken', accessToken);
    await prefs.setString('refreshToken', refreshToken);
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  }

  Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
    _accessToken = null;
    _refreshToken = null;
  }

  Future<bool> refreshToken() async {
    if (_refreshToken == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'refreshToken': _refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          await _storeTokens(data['token'], data['refreshToken']);
          return true;
        }
      }
    } catch (e) {
      print('Token refresh error: $e');
    }
    return false;
  }

  Future<http.Response> _makeAuthenticatedRequest(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? queryParams,
  }) async {
    if (_accessToken == null) {
      throw Exception('No access token available');
    }

    final uri = Uri.parse('$baseUrl$endpoint').replace(queryParameters: queryParams);
    
    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $_accessToken',
    };

    http.Response response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await http.get(uri, headers: headers);
        break;
      case 'POST':
        response = await http.post(uri, headers: headers, body: body != null ? json.encode(body) : null);
        break;
      case 'PUT':
        response = await http.put(uri, headers: headers, body: body != null ? json.encode(body) : null);
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    // Handle token refresh if needed
    if (response.statusCode == 401) {
      final refreshed = await refreshToken();
      if (refreshed) {
        // Retry the request with new token
        headers['Authorization'] = 'Bearer $_accessToken';
        
        switch (method.toUpperCase()) {
          case 'GET':
            response = await http.get(uri, headers: headers);
            break;
          case 'POST':
            response = await http.post(uri, headers: headers, body: body != null ? json.encode(body) : null);
            break;
          case 'PUT':
            response = await http.put(uri, headers: headers, body: body != null ? json.encode(body) : null);
            break;
          case 'DELETE':
            response = await http.delete(uri, headers: headers);
            break;
        }
      }
    }

    return response;
  }

  // OTP AUTHENTICATION
  Future<Map<String, dynamic>> sendOTP(String mobileNumber) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'mobileNumber': mobileNumber}),
      );

      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> verifyOTP({
    required String mobileNumber,
    required String otp,
    String? exam,
    String? name,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'mobileNumber': mobileNumber,
          'otp': otp,
          if (exam != null) 'exam': exam,
          if (name != null) 'name': name,
        }),
      );

      final result = json.decode(response.body);
      
      if (result['success'] == true) {
        await _storeTokens(result['token'], result['refreshToken']);
      }
      
      return result;
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // TEST MANAGEMENT
  Future<Map<String, dynamic>> getDiagnosticTest({String? examType}) async {
    try {
      final response = await _makeAuthenticatedRequest(
        'GET',
        '/get-diagnostic-test',
        queryParams: {'examType': examType ?? 'rrb-je'},
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        
        // Store questions for detailed solutions
        if (result['success'] == true && result['questions'] != null) {
          _storeQuestionsForDetailedSolutions(result['questions']);
        }
        
        return result;
      } else {
        return {'success': false, 'error': 'Failed to get diagnostic test'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> getPracticeTest({
    String? examType,
    String? subject,
    String? difficulty,
    int? questionCount,
  }) async {
    try {
      final queryParams = <String, String>{
        'examType': examType ?? 'rrb-je',
        if (subject != null) 'subject': subject,
        if (difficulty != null) 'difficulty': difficulty,
        if (questionCount != null) 'questionCount': questionCount.toString(),
      };

      final response = await _makeAuthenticatedRequest(
        'GET',
        '/get-practice-test',
        queryParams: queryParams,
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        
        // Store questions for detailed solutions
        if (result['success'] == true && result['questions'] != null) {
          _storeQuestionsForDetailedSolutions(result['questions']);
        }
        
        return result;
      } else {
        return {'success': false, 'error': 'Failed to get practice test'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> submitTest({
    required String sessionId,
    required List<Map<String, dynamic>> answers,
    int? totalTime,
    String? testType,
  }) async {
    try {
      final response = await _makeAuthenticatedRequest(
        'POST',
        '/submit-test',
        body: {
          'sessionId': sessionId,
          'answers': answers,
          if (totalTime != null) 'totalTime': totalTime,
          if (testType != null) 'testType': testType,
        },
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        
        // Add question texts to detailed results
        if (result['success'] == true && result['detailedResults'] != null) {
          _addQuestionTextsToDetailedResults(result['detailedResults']);
        }
        
        return result;
      } else {
        return {'success': false, 'error': 'Failed to submit test'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // Store questions for detailed solutions
  void _storeQuestionsForDetailedSolutions(List<dynamic> questions) {
    for (var question in questions) {
      _questionsForDetailedSolutions[question['id']] = question;
    }
  }

  // Add question texts to detailed results
  void _addQuestionTextsToDetailedResults(List<dynamic> detailedResults) {
    for (var result in detailedResults) {
      final questionId = result['questionId'];
      final question = _questionsForDetailedSolutions[questionId];
      if (question != null) {
        result['questionText'] = question['text'];
      }
    }
  }

  // Get question text for detailed solutions
  String? getQuestionText(String questionId) {
    return _questionsForDetailedSolutions[questionId]?['text'];
  }

  // PROGRESS & ANALYTICS
  Future<Map<String, dynamic>> getProgress({String? examType}) async {
    try {
      final response = await _makeAuthenticatedRequest(
        'GET',
        '/get-progress',
        queryParams: examType != null ? {'examType': examType} : null,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to get progress'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> getStats({String? examType}) async {
    try {
      final response = await _makeAuthenticatedRequest(
        'GET',
        '/get-stats',
        queryParams: examType != null ? {'examType': examType} : null,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to get stats'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // GAMIFICATION
  Future<Map<String, dynamic>> getBadges() async {
    try {
      final response = await _makeAuthenticatedRequest('GET', '/get-badges');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to get badges'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> getRecommendations({String? examType}) async {
    try {
      final response = await _makeAuthenticatedRequest(
        'GET',
        '/get-recommendations',
        queryParams: examType != null ? {'examType': examType} : null,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to get recommendations'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  // USER MANAGEMENT
  Future<Map<String, dynamic>> logout() async {
    try {
      final response = await _makeAuthenticatedRequest('POST', '/logout');
      await clearTokens();
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to logout'};
      }
    } catch (e) {
      await clearTokens();
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final response = await _makeAuthenticatedRequest('GET', '/profile');

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {'success': false, 'error': 'Failed to get user profile'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }
} 