# 🚀 Flutter API Integration Guide

## 📡 **Base URL**
```
https://admindashboard-x0hk.onrender.com
```

## 🔐 **Authentication APIs**

### Login
```dart
Future<Map<String, dynamic>> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({'email': email, 'password': password}),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    await saveToken(data['token']);
    return data;
  } else {
    throw Exception('Login failed: ${response.body}');
  }
}
```

### Register
```dart
Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/v1/users/register'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode(userData),
  );
  
  if (response.statusCode == 201) {
    return json.decode(response.body);
  } else {
    throw Exception('Registration failed: ${response.body}');
  }
}
```

## 👤 **User Management APIs**

### Get User Profile
```dart
Future<Map<String, dynamic>> getUserProfile() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/v1/users/profile'),
    headers: _headers, // Includes Authorization token
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get profile: ${response.body}');
  }
}
```

### Update Profile
```dart
Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
  final response = await http.put(
    Uri.parse('$baseUrl/api/v1/users/profile'),
    headers: _headers,
    body: json.encode(data),
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to update profile: ${response.body}');
  }
}
```

## 📚 **Questions APIs**

### Get All Questions
```dart
Future<Map<String, dynamic>> getQuestions({
  int page = 1,
  int limit = 20,
  String? subject,
  String? exam,
  String? difficulty,
}) async {
  final queryParams = <String, String>{
    'page': page.toString(),
    'limit': limit.toString(),
  };
  if (subject != null) queryParams['subject'] = subject;
  if (exam != null) queryParams['exam'] = exam;
  if (difficulty != null) queryParams['difficulty'] = difficulty;

  final uri = Uri.parse('$baseUrl/questions/all').replace(queryParameters: queryParams);
  final response = await http.get(uri, headers: _headers);

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get questions: ${response.body}');
  }
}
```

### Get Questions by Module
```dart
Future<Map<String, dynamic>> getQuestionsByModule(String moduleType) async {
  final response = await http.get(
    Uri.parse('$baseUrl/questions/module/$moduleType'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get questions: ${response.body}');
  }
}
```

## 🎯 **Topic-Based APIs**

### Get Exams with Topics
```dart
Future<Map<String, dynamic>> getExamsWithTopics() async {
  final response = await http.get(
    Uri.parse('$baseUrl/topics/exams'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get exams: ${response.body}');
  }
}
```

### Get Subjects for Exam
```dart
Future<Map<String, dynamic>> getSubjectsForExam(String examId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/topics/$examId/subjects'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get subjects: ${response.body}');
  }
}
```

### Get Topics for Subject
```dart
Future<Map<String, dynamic>> getTopicsForSubject(String examId, String subjectId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/topics/$examId/subjects/$subjectId/topics'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get topics: ${response.body}');
  }
}
```

## 📊 **Test Session APIs**

### Start Test Session
```dart
Future<Map<String, dynamic>> startTestSession(String examId, String subjectId) async {
  final response = await http.post(
    Uri.parse('$baseUrl/subjects/$examId/$subjectId/start'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to start test session: ${response.body}');
  }
}
```

### Submit Answer
```dart
Future<Map<String, dynamic>> submitAnswer(String sessionId, Map<String, dynamic> answerData) async {
  final response = await http.post(
    Uri.parse('$baseUrl/subjects/test/$sessionId/answer'),
    headers: _headers,
    body: json.encode(answerData),
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to submit answer: ${response.body}');
  }
}
```

### Complete Test
```dart
Future<Map<String, dynamic>> completeTest(String sessionId) async {
  final response = await http.post(
    Uri.parse('$baseUrl/subjects/test/$sessionId/complete'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to complete test: ${response.body}');
  }
}
```

## 🤖 **AI Recommendation APIs**

### Get Next Test Recommendation
```dart
Future<Map<String, dynamic>> getNextTestRecommendation() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/v1/users/ai/next-test'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get recommendation: ${response.body}');
  }
}
```

### Get Study Plan
```dart
Future<Map<String, dynamic>> getStudyPlan() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/v1/users/ai/study-plan'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get study plan: ${response.body}');
  }
}
```

## 📱 **Onboarding APIs**

### Get Available Exams
```dart
Future<Map<String, dynamic>> getAvailableExams() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/v1/users/onboarding/exams'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get exams: ${response.body}');
  }
}
```

### Complete Onboarding
```dart
Future<Map<String, dynamic>> completeOnboarding(Map<String, dynamic> data) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/v1/users/onboarding/complete'),
    headers: _headers,
    body: json.encode(data),
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to complete onboarding: ${response.body}');
  }
}
```

## 📈 **Progress APIs**

### Get User Progress
```dart
Future<Map<String, dynamic>> getUserProgress() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/v1/users/progress'),
    headers: _headers,
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to get progress: ${response.body}');
  }
}
```

### Submit Test Results
```dart
Future<Map<String, dynamic>> submitTestResults(Map<String, dynamic> results) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/v1/users/test-results'),
    headers: _headers,
    body: json.encode(results),
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to submit results: ${response.body}');
  }
}
```

## 🔐 **Security APIs**

### Send OTP
```dart
Future<Map<String, dynamic>> sendOTP(String email) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/v1/users/send-otp'),
    headers: _headers,
    body: json.encode({'email': email}),
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to send OTP: ${response.body}');
  }
}
```

### Verify OTP
```dart
Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/v1/users/verify-otp'),
    headers: _headers,
    body: json.encode({'email': email, 'otp': otp}),
  );
  
  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to verify OTP: ${response.body}');
  }
}
```

## 🏗️ **Complete API Service Class**

```dart
// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  static String? _token;

  // Initialize token from storage
  static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  // Save token to storage
  static Future<void> saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  // Clear token
  static Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Get headers with authentication
  static Map<String, String> get _headers {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // All the API methods from above go here...
  
  static Future<void> logout() async {
    await clearToken();
  }
}
```

## 📦 **Dependencies**

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  shared_preferences: ^2.2.2
  provider: ^6.1.1
  json_annotation: ^4.8.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  json_serializable: ^6.7.1
  build_runner: ^2.4.7
```

## 🎯 **Usage Examples**

```dart
// Login Example
Future<void> login() async {
  try {
    final result = await ApiService.login('admin@preplens.com', 'admin123');
    print('Login successful: ${result['message']}');
    // Navigate to home screen
  } catch (e) {
    print('Login failed: $e');
  }
}

// Get Questions Example
Future<void> getQuestions() async {
  try {
    final result = await ApiService.getQuestions(
      page: 1,
      limit: 20,
      subject: 'Mathematics',
      exam: 'rrb-je',
    );
    print('Questions: ${result['data']}');
  } catch (e) {
    print('Failed to get questions: $e');
  }
}

// Start Test Session Example
Future<void> startTest() async {
  try {
    final result = await ApiService.startTestSession('rrb-je', 'mathematics');
    print('Test session started: ${result['sessionId']}');
  } catch (e) {
    print('Failed to start test: $e');
  }
}
```

This provides you with all the APIs and Flutter integration code needed to build your new app! 🚀 