# 🚀 Complete PrepLens API Documentation & Flutter Integration

## 📡 **Base URL**
```
https://admindashboard-x0hk.onrender.com
```

## 🔐 **Authentication**

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@preplens.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "demo-token-1756019561714",
  "user": {
    "email": "admin@preplens.com",
    "role": "admin"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 👤 **User Management APIs**

### User Registration (New System)
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "exam": "rrb-je",
  "language": "english"
}
```

### User Login (New System)
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "language": "hindi"
}
```

### Change Password
```http
PUT /api/v1/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### User Dashboard
```http
GET /api/v1/users/dashboard
Authorization: Bearer <token>
```

### User Statistics
```http
GET /api/v1/users/stats
Authorization: Bearer <token>
```

## 📚 **Question Management APIs**

### Get All Questions
```http
GET /questions/all?page=1&limit=20&subject=math&exam=rrb-je&difficulty=easy
```

### Get Questions by Module Type
```http
GET /questions/module/practice
GET /questions/module/mock_test
GET /questions/module/test_series
```

### Create Question
```http
POST /questions
Content-Type: application/json

{
  "text": "What is 2+2?",
  "options": ["3", "4", "5", "6"],
  "answer": "4",
  "subject": "Mathematics",
  "exam": "rrb-je",
  "difficulty": "easy",
  "level": "Level 1",
  "marks": 1,
  "timeLimit": 60,
  "blooms": "Remember",
  "moduleType": "practice",
  "isPremium": false,
  "language": "english"
}
```

### Update Question
```http
PUT /questions/:id
Content-Type: application/json

{
  "text": "Updated question text",
  "options": ["Updated option 1", "Updated option 2", "Updated option 3", "Updated option 4"],
  "answer": "Updated option 2"
}
```

### Delete Question
```http
DELETE /questions/:id
```

### Publish Question
```http
PUT /questions/:id/publish
```

## 🎯 **Topic-Based Questions APIs**

### Get Exams with Topics
```http
GET /topics/exams
```

### Get Subjects for Exam
```http
GET /topics/:examId/subjects
```

### Get Topics for Subject
```http
GET /topics/:examId/subjects/:subjectId/topics
```

### Get Questions by Topic
```http
GET /topics/:examId/questions?subjectId=math&topicId=algebra
```

### Get Topic Count
```http
GET /topics/:examId/count
```

## 📊 **Subject-Based Test APIs**

### Get Subjects for Exam
```http
GET /subjects/:examId
```

### Get Subject Details
```http
GET /subjects/:examId/:subjectId
```

### Start Subject Test
```http
POST /subjects/:examId/:subjectId/start
Authorization: Bearer <token>
```

### Submit Answer
```http
POST /subjects/test/:sessionId/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionId": "question_id",
  "selectedAnswer": "A",
  "timeSpent": 30
}
```

### Complete Test
```http
POST /subjects/test/:sessionId/complete
Authorization: Bearer <token>
```

### Get Test History
```http
GET /subjects/:examId/:subjectId/history
Authorization: Bearer <token>
```

### Get Performance Analysis
```http
GET /subjects/:examId/:subjectId/performance
Authorization: Bearer <token>
```

## 🤖 **AI Recommendation APIs**

### Get Next Test Recommendation
```http
GET /api/v1/users/ai/next-test
Authorization: Bearer <token>
```

### Get Study Plan
```http
GET /api/v1/users/ai/study-plan
Authorization: Bearer <token>
```

### Get Performance Analysis
```http
GET /api/v1/users/ai/performance-analysis
Authorization: Bearer <token>
```

### Start Smart Test Session
```http
POST /api/v1/users/ai/smart-test-session/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "examId": "rrb-je",
  "subjectId": "math",
  "difficulty": "medium"
}
```

### Analyze Attempt
```http
POST /api/v1/users/ai/analyze-attempt
Authorization: Bearer <token>
Content-Type: application/json

{
  "testSessionId": "session_id",
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": "A",
      "timeSpent": 30,
      "isCorrect": true
    }
  ]
}
```

### Get AI Tutor
```http
POST /api/v1/users/ai/tutor
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionId": "question_id",
  "userAnswer": "A",
  "isCorrect": false
}
```

### Get Weekly Plan
```http
POST /api/v1/users/ai/weekly-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "examId": "rrb-je",
  "currentWeek": 1
}
```

## 📱 **Onboarding APIs**

### Get Available Exams
```http
GET /api/v1/users/onboarding/exams
```

### Save Onboarding Data
```http
POST /api/v1/users/onboarding/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "exam": "rrb-je",
  "language": "english",
  "experience": "beginner"
}
```

### Complete Onboarding
```http
POST /api/v1/users/onboarding/complete
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "exam": "rrb-je",
  "language": "english",
  "experience": "beginner"
}
```

### Get Onboarding Data
```http
GET /api/v1/users/onboarding/data
Authorization: Bearer <token>
```

## 📈 **Progress & Analytics APIs**

### Get User Progress
```http
GET /api/v1/users/progress
Authorization: Bearer <token>
```

### Get Test Results
```http
GET /api/v1/users/test-results
Authorization: Bearer <token>
```

### Submit Test Results
```http
POST /api/v1/users/test-results
Authorization: Bearer <token>
Content-Type: application/json

{
  "testId": "test_id",
  "score": 85,
  "totalQuestions": 50,
  "correctAnswers": 42,
  "timeSpent": 3600,
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": "A",
      "isCorrect": true,
      "timeSpent": 30
    }
  ]
}
```

### Get Badges
```http
GET /api/v1/users/get-badges
Authorization: Bearer <token>
```

### Get Recommendations
```http
GET /api/v1/users/get-recommendations
Authorization: Bearer <token>
```

## 🔐 **Security APIs**

### Send OTP
```http
POST /api/v1/users/send-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Verify OTP
```http
POST /api/v1/users/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Forgot Password
```http
POST /api/v1/users/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /api/v1/users/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### Refresh Token
```http
POST /api/v1/users/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

## 📁 **File Upload APIs**

### Upload Image
```http
POST /upload-image
Content-Type: multipart/form-data

Form Data:
- image: [file]
```

### Delete Image
```http
DELETE /upload-image/:filename
```

## 📊 **Public APIs**

### Get Public Questions
```http
GET /api/public/questions?page=1&limit=20&subject=math&exam=rrb-je
```

### Get Question by ID
```http
GET /api/public/questions/:id
```

### Get Filters
```http
GET /api/public/filters
```

### Get Public Statistics
```http
GET /api/public/statistics
```

## 🏗️ **Module Management APIs**

### Get All Modules
```http
GET /modules
```

### Get Module by ID
```http
GET /modules/:id
```

### Create Module
```http
POST /modules
Content-Type: application/json

{
  "name": "Mathematics Module 1",
  "description": "Basic mathematics concepts",
  "exam": "rrb-je",
  "subject": "Mathematics",
  "difficulty": "easy",
  "questions": ["question_id_1", "question_id_2"],
  "totalMarks": 50,
  "totalTime": 60,
  "moduleType": "practice"
}
```

### Update Module
```http
PUT /modules/:id
Content-Type: application/json

{
  "name": "Updated Module Name",
  "description": "Updated description"
}
```

### Delete Module
```http
DELETE /modules/:id
```

## 🏷️ **Utility APIs**

### Get Exams List
```http
GET /exams
```

### Get Levels
```http
GET /levels
```

### Get Subjects
```http
GET /subjects
```

### Get Topics by Subject
```http
GET /topics/:subject
```

### Get Tags
```http
GET /tags
```

### Health Check
```http
GET /health
```

### Ping
```http
GET /ping
```

## 📊 **Statistics APIs**

### Get Dashboard Statistics
```http
GET /statistics
```

## 🔄 **Bulk Operations**

### Bulk Upload Questions
```http
POST /bulk-upload
Content-Type: multipart/form-data

Form Data:
- file: [CSV/Excel file]
```

---

# 📱 **Flutter Integration Package**

## 🚀 **Complete Flutter API Service**

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

  // Authentication APIs
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/users/register'),
      headers: _headers,
      body: json.encode(userData),
    );

    if (response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Registration failed: ${response.body}');
    }
  }

  // User Profile APIs
  static Future<Map<String, dynamic>> getUserProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/users/profile'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to get profile: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> updateUserProfile(Map<String, dynamic> profileData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/v1/users/profile'),
      headers: _headers,
      body: json.encode(profileData),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to update profile: ${response.body}');
    }
  }

  // Questions APIs
  static Future<Map<String, dynamic>> getQuestions({
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

  // Topic-based Questions APIs
  static Future<Map<String, dynamic>> getExamsWithTopics() async {
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

  static Future<Map<String, dynamic>> getSubjectsForExam(String examId) async {
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

  static Future<Map<String, dynamic>> getTopicsForSubject(String examId, String subjectId) async {
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

  // Test Session APIs
  static Future<Map<String, dynamic>> startTestSession(String examId, String subjectId) async {
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

  static Future<Map<String, dynamic>> submitAnswer(String sessionId, Map<String, dynamic> answerData) async {
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

  static Future<Map<String, dynamic>> completeTest(String sessionId) async {
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

  // AI Recommendation APIs
  static Future<Map<String, dynamic>> getNextTestRecommendation() async {
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

  static Future<Map<String, dynamic>> getStudyPlan() async {
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

  // Progress APIs
  static Future<Map<String, dynamic>> getUserProgress() async {
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

  static Future<Map<String, dynamic>> submitTestResults(Map<String, dynamic> results) async {
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

  // Onboarding APIs
  static Future<Map<String, dynamic>> getAvailableExams() async {
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

  static Future<Map<String, dynamic>> completeOnboarding(Map<String, dynamic> onboardingData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/users/onboarding/complete'),
      headers: _headers,
      body: json.encode(onboardingData),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to complete onboarding: ${response.body}');
    }
  }

  // Utility APIs
  static Future<Map<String, dynamic>> getHealth() async {
    final response = await http.get(
      Uri.parse('$baseUrl/health'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Health check failed: ${response.body}');
    }
  }

  static Future<void> logout() async {
    await clearToken();
  }
}
```

## 📱 **Flutter Models**

```dart
// lib/models/user.dart
class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String exam;
  final String language;
  final bool isPremium;
  final DateTime? premiumExpiry;
  final UserStats stats;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.exam,
    required this.language,
    required this.isPremium,
    this.premiumExpiry,
    required this.stats,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'] ?? '',
      exam: json['exam'],
      language: json['language'],
      isPremium: json['isPremium'] ?? false,
      premiumExpiry: json['premiumExpiry'] != null 
          ? DateTime.parse(json['premiumExpiry']) 
          : null,
      stats: UserStats.fromJson(json['stats'] ?? {}),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'exam': exam,
      'language': language,
      'isPremium': isPremium,
      'premiumExpiry': premiumExpiry?.toIso8601String(),
      'stats': stats.toJson(),
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class UserStats {
  final int totalQuestionsAttempted;
  final int totalCorrectAnswers;
  final int totalTimeSpent;
  final double averageAccuracy;

  UserStats({
    required this.totalQuestionsAttempted,
    required this.totalCorrectAnswers,
    required this.totalTimeSpent,
    required this.averageAccuracy,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      totalQuestionsAttempted: json['totalQuestionsAttempted'] ?? 0,
      totalCorrectAnswers: json['totalCorrectAnswers'] ?? 0,
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      averageAccuracy: (json['averageAccuracy'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalQuestionsAttempted': totalQuestionsAttempted,
      'totalCorrectAnswers': totalCorrectAnswers,
      'totalTimeSpent': totalTimeSpent,
      'averageAccuracy': averageAccuracy,
    };
  }
}
```

```dart
// lib/models/question.dart
class Question {
  final String id;
  final String text;
  final List<String> options;
  final String answer;
  final String subject;
  final String exam;
  final String difficulty;
  final String level;
  final List<String> tags;
  final int marks;
  final int timeLimit;
  final String blooms;
  final String? imageUrl;
  final String? solutionImageUrl;
  final Map<String, String>? optionImages;
  final String publishStatus;
  final String? category;
  final String? topic;
  final String? solution;
  final String? questionMath;
  final String? solutionMath;
  final String moduleType;
  final bool isPremium;
  final String language;
  final String? explanation;
  final List<String> hints;
  final DateTime createdAt;
  final DateTime updatedAt;

  Question({
    required this.id,
    required this.text,
    required this.options,
    required this.answer,
    required this.subject,
    required this.exam,
    required this.difficulty,
    required this.level,
    required this.tags,
    required this.marks,
    required this.timeLimit,
    required this.blooms,
    this.imageUrl,
    this.solutionImageUrl,
    this.optionImages,
    required this.publishStatus,
    this.category,
    this.topic,
    this.solution,
    this.questionMath,
    this.solutionMath,
    required this.moduleType,
    required this.isPremium,
    required this.language,
    this.explanation,
    required this.hints,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['_id'],
      text: json['text'],
      options: List<String>.from(json['options']),
      answer: json['answer'],
      subject: json['subject'],
      exam: json['exam'],
      difficulty: json['difficulty'],
      level: json['level'],
      tags: List<String>.from(json['tags'] ?? []),
      marks: json['marks'],
      timeLimit: json['timeLimit'],
      blooms: json['blooms'],
      imageUrl: json['imageUrl'],
      solutionImageUrl: json['solutionImageUrl'],
      optionImages: json['optionImages'] != null 
          ? Map<String, String>.from(json['optionImages'])
          : null,
      publishStatus: json['publishStatus'],
      category: json['category'],
      topic: json['topic'],
      solution: json['solution'],
      questionMath: json['questionMath'],
      solutionMath: json['solutionMath'],
      moduleType: json['moduleType'],
      isPremium: json['isPremium'] ?? false,
      language: json['language'],
      explanation: json['explanation'],
      hints: List<String>.from(json['hints'] ?? []),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'text': text,
      'options': options,
      'answer': answer,
      'subject': subject,
      'exam': exam,
      'difficulty': difficulty,
      'level': level,
      'tags': tags,
      'marks': marks,
      'timeLimit': timeLimit,
      'blooms': blooms,
      'imageUrl': imageUrl,
      'solutionImageUrl': solutionImageUrl,
      'optionImages': optionImages,
      'publishStatus': publishStatus,
      'category': category,
      'topic': topic,
      'solution': solution,
      'questionMath': questionMath,
      'solutionMath': solutionMath,
      'moduleType': moduleType,
      'isPremium': isPremium,
      'language': language,
      'explanation': explanation,
      'hints': hints,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
```

## 🔧 **Flutter Dependencies**

Add these to your `pubspec.yaml`:

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

This complete API documentation and Flutter integration package will help you build a new app with all the features from the PrepLens system! 🚀 