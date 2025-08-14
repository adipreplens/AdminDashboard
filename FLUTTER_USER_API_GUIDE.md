# Flutter User API Integration Guide

## 🚀 **Base URL**
```
https://admindashboard-x0hk.onrender.com
```

## 📱 **Complete API Endpoints for Flutter App**

### **🔐 Authentication APIs**

#### **1. User Registration**
```dart
POST /users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+919876543210",
  "exam": "ssc-je",
  "language": "english",
  "referralCode": "ABC12345"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "exam": "ssc-je",
    "language": "english",
    "isPremium": false,
    "referralCode": "ABC12345"
  }
}
```

#### **2. User Login**
```dart
POST /users/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "exam": "ssc-je",
    "language": "english",
    "isPremium": false,
    "premiumExpiry": null,
    "referralCode": "ABC12345",
    "totalEarnings": 0,
    "totalReferrals": 0
  }
}
```

#### **3. Forgot Password**
```dart
POST /users/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### **4. Reset Password**
```dart
POST /users/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

### **👤 User Profile APIs**

#### **5. Get User Profile**
```dart
GET /users/profile
Authorization: Bearer <token>
```

#### **6. Update User Profile**
```dart
PUT /users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+919876543210",
  "exam": "rrb-je",
  "language": "hindi",
  "upiId": "john@upi",
  "preferences": {
    "notifications": true,
    "emailUpdates": false
  }
}
```

#### **7. Change Password**
```dart
PUT /users/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### **💎 Premium Features**

#### **8. Purchase Premium**
```dart
POST /users/purchase-premium
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentMethod": "razorpay",
  "transactionId": "txn_123456789"
}
```

**Response:**
```json
{
  "message": "Premium purchased successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "isPremium": true,
    "premiumExpiry": "2026-08-09T15:57:21.745Z"
  }
}
```

### **📊 Analytics & Stats**

#### **9. Get User Stats**
```dart
GET /users/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "totalQuestionsAttempted": 150,
    "totalCorrectAnswers": 120,
    "totalTimeSpent": 7200,
    "averageAccuracy": 80.0,
    "totalTests": 10,
    "completedTests": 8,
    "averageScore": 75.5
  },
  "progress": [
    {
      "subject": "civil-engineering",
      "topic": "stone",
      "questionsAttempted": 25,
      "correctAnswers": 20,
      "totalTime": 1200,
      "accuracy": 80.0,
      "lastAttempted": "2025-08-09T15:57:21.745Z"
    }
  ]
}
```

### **📝 Test Session APIs**

#### **10. Start Test Session**
```dart
POST /users/test-session/start
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "testType": "practice",
  "subject": "civil-engineering",
  "level": "basic",
  "testId": "test_123"
}
```

**Response:**
```json
{
  "message": "Test session started",
  "sessionId": "session_id",
  "questions": [
    {
      "id": "question_id",
      "text": "What is the range of specific gravity of granite?",
      "options": ["1.6–2.0", "2.0–2.5", "2.6–2.9", "1.0–1.6"],
      "marks": 1,
      "timeLimit": 60
    }
  ]
}
```

#### **11. Submit Answer**
```dart
POST /users/test-session/{sessionId}/answer
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "questionId": "question_id",
  "answer": "2.6–2.9",
  "timeSpent": 45
}
```

**Response:**
```json
{
  "message": "Answer submitted successfully",
  "isCorrect": true
}
```

#### **12. Complete Test Session**
```dart
POST /users/test-session/{sessionId}/complete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Test completed successfully",
  "results": {
    "totalQuestions": 25,
    "correctAnswers": 20,
    "accuracy": 80.0,
    "score": 80,
    "totalTime": 1200,
    "timePerQuestion": 48
  }
}
```

#### **13. Get Test History**
```dart
GET /users/test-history?page=1&limit=10&testType=practice
Authorization: Bearer <token>
```

**Response:**
```json
{
  "testSessions": [
    {
      "_id": "session_id",
      "testType": "practice",
      "subject": "civil-engineering",
      "level": "basic",
      "totalQuestions": 25,
      "correctAnswers": 20,
      "accuracy": 80.0,
      "score": 80,
      "status": "completed",
      "startedAt": "2025-08-09T15:57:21.745Z",
      "completedAt": "2025-08-09T16:17:21.745Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 15
}
```

### **🎯 Referral System**

#### **14. Get Referral Stats**
```dart
GET /users/referrals
Authorization: Bearer <token>
```

**Response:**
```json
{
  "referrals": [
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "exam": "rrb-je",
      "isPremium": true,
      "createdAt": "2025-08-09T15:57:21.745Z"
    }
  ],
  "totalEarnings": 29.9,
  "totalReferrals": 1,
  "referralCode": "ABC12345"
}
```

### **🗑️ Account Management**

#### **15. Delete Account**
```dart
DELETE /users/account
Authorization: Bearer <token>
```

## 🔧 **Flutter Implementation**

### **Step 1: Add Dependencies**
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  shared_preferences: ^2.2.2
  json_annotation: ^4.8.1

dev_dependencies:
  json_serializable: ^6.7.1
  build_runner: ^2.4.6
```

### **Step 2: Create User Models**
```dart
import 'package:json_annotation/json_annotation.dart';

part 'user_models.g.dart';

@JsonSerializable()
class User {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String exam;
  final String language;
  final bool isPremium;
  final DateTime? premiumExpiry;
  final String referralCode;
  final double totalEarnings;
  final int totalReferrals;
  final UserStats stats;
  final UserPreferences preferences;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.exam,
    required this.language,
    required this.isPremium,
    this.premiumExpiry,
    required this.referralCode,
    required this.totalEarnings,
    required this.totalReferrals,
    required this.stats,
    required this.preferences,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
class UserStats {
  final int totalQuestionsAttempted;
  final int totalCorrectAnswers;
  final int totalTimeSpent;
  final double averageAccuracy;
  final int totalTests;
  final int completedTests;
  final double averageScore;

  UserStats({
    required this.totalQuestionsAttempted,
    required this.totalCorrectAnswers,
    required this.totalTimeSpent,
    required this.averageAccuracy,
    required this.totalTests,
    required this.completedTests,
    required this.averageScore,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) => _$UserStatsFromJson(json);
  Map<String, dynamic> toJson() => _$UserStatsToJson(this);
}

@JsonSerializable()
class UserPreferences {
  final bool notifications;
  final bool emailUpdates;

  UserPreferences({
    required this.notifications,
    required this.emailUpdates,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);
}
```

### **Step 3: Create API Service**
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class UserApiService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  static String? _authToken;

  // Initialize auth token
  static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
  }

  // Save auth token
  static Future<void> saveAuthToken(String token) async {
    _authToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  // Get auth headers
  static Map<String, String> get _authHeaders {
    return {
      'Content-Type': 'application/json',
      if (_authToken != null) 'Authorization': 'Bearer $_authToken',
    };
  }

  // User Registration
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? phone,
    required String exam,
    String language = 'english',
    String? referralCode,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'password': password,
          'phone': phone,
          'exam': exam,
          'language': language,
          'referralCode': referralCode,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 201) {
        await saveAuthToken(data['token']);
        return {
          'success': true,
          'message': data['message'],
          'user': User.fromJson(data['user']),
          'token': data['token'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // User Login
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        await saveAuthToken(data['token']);
        return {
          'success': true,
          'message': data['message'],
          'user': User.fromJson(data['user']),
          'token': data['token'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Login failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // Start Test Session
  static Future<Map<String, dynamic>> startTestSession({
    required String testType,
    required String subject,
    String? level,
    String? testId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/test-session/start'),
        headers: _authHeaders,
        body: json.encode({
          'testType': testType,
          'subject': subject,
          'level': level,
          'testId': testId,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'sessionId': data['sessionId'],
          'questions': data['questions'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? data['message'] ?? 'Failed to start test',
          'requiresPremium': response.statusCode == 403,
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // Purchase Premium
  static Future<Map<String, dynamic>> purchasePremium({
    required String paymentMethod,
    required String transactionId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/purchase-premium'),
        headers: _authHeaders,
        body: json.encode({
          'paymentMethod': paymentMethod,
          'transactionId': transactionId,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'user': User.fromJson(data['user']),
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to purchase premium',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }
}
```

## 🎯 **Available Exam Types**
- `rrb-je` - RRB Junior Engineer
- `rrb-alp` - RRB Assistant Loco Pilot
- `rrb-technician` - RRB Technician
- `rrb-ntpc` - RRB NTPC
- `ssc-cgl` - SSC CGL
- `ssc-chsl` - SSC CHSL
- `ssc-je` - SSC Junior Engineer

## 🎯 **Available Test Types**
- `practice` - Practice Questions
- `section-test` - Section Tests
- `mock-test` - Full-Length Mock Tests
- `test-series` - Test Series
- `live-test` - All-India Live Tests

## 🎯 **Available Difficulty Levels**
- `basic` - Basic Level
- `intermediate` - Intermediate Level
- `advanced` - Advanced Level
- `expert` - Expert Level

## 🎯 **Available Languages**
- `english` - English
- `hindi` - Hindi

## 🚀 **Quick Start Examples**

### **Example 1: User Registration**
```dart
final result = await UserApiService.register(
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  exam: 'ssc-je',
  language: 'english',
);

if (result['success']) {
  print('Registration successful!');
  final user = result['user'] as User;
  print('User ID: ${user.id}');
  print('Referral Code: ${user.referralCode}');
}
```

### **Example 2: User Login**
```dart
final result = await UserApiService.login(
  email: 'john@example.com',
  password: 'password123',
);

if (result['success']) {
  print('Login successful!');
  final user = result['user'] as User;
  print('Welcome back, ${user.name}!');
}
```

### **Example 3: Start Practice Test**
```dart
final result = await UserApiService.startTestSession(
  testType: 'practice',
  subject: 'civil-engineering',
  level: 'basic',
);

if (result['success']) {
  print('Test started successfully!');
  final questions = result['questions'] as List;
  print('Number of questions: ${questions.length}');
} else if (result['requiresPremium']) {
  print('This test requires PrepLens+ subscription');
}
```

### **Example 4: Purchase Premium**
```dart
final result = await UserApiService.purchasePremium(
  paymentMethod: 'razorpay',
  transactionId: 'txn_123456789',
);

if (result['success']) {
  print('Premium purchased successfully!');
  final user = result['user'] as User;
  print('Premium expiry: ${user.premiumExpiry}');
}
```

## 📱 **UI Implementation Tips**

1. **Loading States**: Show loading indicators for all API calls
2. **Error Handling**: Display user-friendly error messages
3. **Token Management**: Automatically handle token refresh and logout
4. **Offline Support**: Cache user data and test results
5. **Premium Gates**: Show premium prompts for locked content
6. **Progress Tracking**: Update UI based on user progress
7. **Referral System**: Display referral code and earnings prominently

## 🔧 **Advanced Features**

### **Auto-login on App Start**
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await UserApiService.initialize();
  
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: UserApiService.isLoggedIn ? HomeScreen() : LoginScreen(),
    );
  }
}
```

### **Premium Content Gate**
```dart
Widget buildPremiumGate({
  required Widget child,
  required String message,
}) {
  return UserApiService.isLoggedIn && user.isPremium
      ? child
      : PremiumPromptWidget(message: message);
}
```

This comprehensive API guide provides everything you need to build your complete Flutter EdTech app! 🎯 