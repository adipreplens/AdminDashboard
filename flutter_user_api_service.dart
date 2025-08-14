import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// User Model
class User {
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

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      exam: json['exam'] ?? '',
      language: json['language'] ?? 'english',
      isPremium: json['isPremium'] ?? false,
      premiumExpiry: json['premiumExpiry'] != null 
          ? DateTime.parse(json['premiumExpiry']) 
          : null,
      referralCode: json['referralCode'] ?? '',
      totalEarnings: (json['totalEarnings'] ?? 0).toDouble(),
      totalReferrals: json['totalReferrals'] ?? 0,
      stats: UserStats.fromJson(json['stats'] ?? {}),
      preferences: UserPreferences.fromJson(json['preferences'] ?? {}),
    );
  }
}

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

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      totalQuestionsAttempted: json['totalQuestionsAttempted'] ?? 0,
      totalCorrectAnswers: json['totalCorrectAnswers'] ?? 0,
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      averageAccuracy: (json['averageAccuracy'] ?? 0).toDouble(),
      totalTests: json['totalTests'] ?? 0,
      completedTests: json['completedTests'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
    );
  }
}

class UserPreferences {
  final bool notifications;
  final bool emailUpdates;

  UserPreferences({
    required this.notifications,
    required this.emailUpdates,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      notifications: json['notifications'] ?? true,
      emailUpdates: json['emailUpdates'] ?? true,
    );
  }
}

// Test Session Models
class TestSession {
  final String id;
  final String testType;
  final String subject;
  final String? level;
  final String? testId;
  final List<TestQuestion> questions;
  final int totalQuestions;
  final int correctAnswers;
  final int totalTime;
  final double accuracy;
  final double score;
  final String status;
  final DateTime startedAt;
  final DateTime? completedAt;

  TestSession({
    required this.id,
    required this.testType,
    required this.subject,
    this.level,
    this.testId,
    required this.questions,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.totalTime,
    required this.accuracy,
    required this.score,
    required this.status,
    required this.startedAt,
    this.completedAt,
  });

  factory TestSession.fromJson(Map<String, dynamic> json) {
    return TestSession(
      id: json['_id'] ?? '',
      testType: json['testType'] ?? '',
      subject: json['subject'] ?? '',
      level: json['level'],
      testId: json['testId'],
      questions: (json['questions'] as List?)
          ?.map((q) => TestQuestion.fromJson(q))
          .toList() ?? [],
      totalQuestions: json['totalQuestions'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      totalTime: json['totalTime'] ?? 0,
      accuracy: (json['accuracy'] ?? 0).toDouble(),
      score: (json['score'] ?? 0).toDouble(),
      status: json['status'] ?? 'in-progress',
      startedAt: DateTime.parse(json['startedAt']),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
    );
  }
}

class TestQuestion {
  final String questionId;
  final String? userAnswer;
  final bool? isCorrect;
  final int? timeSpent;
  final Question? question;

  TestQuestion({
    required this.questionId,
    this.userAnswer,
    this.isCorrect,
    this.timeSpent,
    this.question,
  });

  factory TestQuestion.fromJson(Map<String, dynamic> json) {
    return TestQuestion(
      questionId: json['questionId'] ?? '',
      userAnswer: json['userAnswer'],
      isCorrect: json['isCorrect'],
      timeSpent: json['timeSpent'],
      question: json['question'] != null 
          ? Question.fromJson(json['question']) 
          : null,
    );
  }
}

// Question Model (from previous file)
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
  final String solution;
  final bool isPremium;
  final String language;

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
    required this.solution,
    required this.isPremium,
    required this.language,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? json['_id'] ?? '',
      text: json['text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      answer: json['answer'] ?? '',
      subject: json['subject'] ?? '',
      exam: json['exam'] ?? '',
      difficulty: json['difficulty'] ?? '',
      tags: List<String>.from(json['tags'] ?? []),
      marks: json['marks'] ?? 0,
      timeLimit: json['timeLimit'] ?? 0,
      solution: json['solution'] ?? '',
      isPremium: json['isPremium'] ?? false,
      language: json['language'] ?? 'english',
    );
  }
}

// User API Service
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

  // Clear auth token
  static Future<void> clearAuthToken() async {
    _authToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Get auth headers
  static Map<String, String> get _authHeaders {
    return {
      'Content-Type': 'application/json',
      if (_authToken != null) 'Authorization': 'Bearer $_authToken',
    };
  }

  // 1. User Registration
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
        Uri.parse('$baseUrl/api/v1/users/register'), // Correct endpoint
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
        await saveAuthToken(data['data']['token']); // Updated token path
        return {
          'success': true,
          'message': data['message'],
          'user': User.fromJson(data['data']['user']), // Updated user path
          'token': data['data']['token'], // Updated token path
          'onboarding': data['data']['onboarding'], // New onboarding data
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

  // 2. User Login
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

  // 3. Get User Profile
  static Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/profile'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'user': User.fromJson(data['user']),
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to fetch profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 4. Update User Profile
  static Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? phone,
    String? exam,
    String? language,
    String? upiId,
    Map<String, dynamic>? preferences,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (name != null) body['name'] = name;
      if (phone != null) body['phone'] = phone;
      if (exam != null) body['exam'] = exam;
      if (language != null) body['language'] = language;
      if (upiId != null) body['upiId'] = upiId;
      if (preferences != null) body['preferences'] = preferences;

      final response = await http.put(
        Uri.parse('$baseUrl/users/profile'),
        headers: _authHeaders,
        body: json.encode(body),
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
          'message': data['error'] ?? 'Failed to update profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 5. Change Password
  static Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/users/change-password'),
        headers: _authHeaders,
        body: json.encode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to change password',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 6. Purchase Premium
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

  // 7. Get User Stats
  static Future<Map<String, dynamic>> getUserStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/stats'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'stats': UserStats.fromJson(data['stats']),
          'progress': data['progress'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to fetch stats',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 8. Start Test Session
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
          'questions': (data['questions'] as List)
              .map((q) => Question.fromJson(q))
              .toList(),
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

  // 9. Submit Test Answer
  static Future<Map<String, dynamic>> submitAnswer({
    required String sessionId,
    required String questionId,
    required String answer,
    required int timeSpent,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/test-session/$sessionId/answer'),
        headers: _authHeaders,
        body: json.encode({
          'questionId': questionId,
          'answer': answer,
          'timeSpent': timeSpent,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'isCorrect': data['isCorrect'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to submit answer',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 10. Complete Test Session
  static Future<Map<String, dynamic>> completeTestSession({
    required String sessionId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/test-session/$sessionId/complete'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'results': data['results'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to complete test',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 11. Get Test History
  static Future<Map<String, dynamic>> getTestHistory({
    int page = 1,
    int limit = 10,
    String? testType,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (testType != null) queryParams['testType'] = testType;

      final uri = Uri.parse('$baseUrl/users/test-history')
          .replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: _authHeaders);
      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'testSessions': (data['testSessions'] as List)
              .map((s) => TestSession.fromJson(s))
              .toList(),
          'totalPages': data['totalPages'],
          'currentPage': data['currentPage'],
          'total': data['total'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to fetch test history',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 12. Get Referral Stats
  static Future<Map<String, dynamic>> getReferralStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/referrals'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'referrals': data['referrals'],
          'totalEarnings': data['totalEarnings'],
          'totalReferrals': data['totalReferrals'],
          'referralCode': data['referralCode'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to fetch referral stats',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 13. Forgot Password
  static Future<Map<String, dynamic>> forgotPassword({
    required String email,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to process request',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 14. Reset Password
  static Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'token': token,
          'newPassword': newPassword,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to reset password',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 15. Delete Account
  static Future<Map<String, dynamic>> deleteAccount() async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/users/account'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        await clearAuthToken();
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to delete account',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 16. Logout
  static Future<void> logout() async {
    await clearAuthToken();
  }

  // 17. Check if user is logged in
  static bool get isLoggedIn => _authToken != null;

  // 18. Get current auth token
  static String? get authToken => _authToken;

  // 19. Complete User Onboarding
  static Future<Map<String, dynamic>> completeOnboarding({
    required String userId,
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
      final response = await http.post(
        Uri.parse('$baseUrl/api/users/onboarding'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'exam': exam,
          'preparationDays': preparationDays,
          'currentLevel': currentLevel,
          'preferredSubjects': preferredSubjects,
          'studyTimePerDay': studyTimePerDay,
          'weakAreas': weakAreas,
          'strongAreas': strongAreas,
          'targetScore': targetScore,
          'dailyQuestions': dailyQuestions,
          'weeklyTests': weeklyTests,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'onboarding': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to complete onboarding',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 20. Get User Profile with Onboarding Data
  static Future<Map<String, dynamic>> getUserProfile(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/users/profile/$userId'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'user': User.fromJson(data['data']['user']),
          'onboarding': data['data']['onboarding'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to fetch profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 21. Get Available Exams
  static Future<Map<String, dynamic>> getAvailableExams() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/exams'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'exams': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to fetch exams',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 22. Complete Onboarding
  static Future<Map<String, dynamic>> completeOnboarding({
    required String userId,
    required int preparationDays,
    String? currentLevel,
    List<String>? preferredSubjects,
    int? studyTimePerDay,
    List<String>? weakAreas,
    List<String>? strongAreas,
    int? targetScore,
    int? dailyQuestions,
    int? weeklyTests,
    required String exam,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/v1/users/onboarding/complete'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'preparationDays': preparationDays,
          'currentLevel': currentLevel,
          'preferredSubjects': preferredSubjects,
          'studyTimePerDay': studyTimePerDay,
          'weakAreas': weakAreas,
          'strongAreas': strongAreas,
          'targetScore': targetScore,
          'dailyQuestions': dailyQuestions,
          'weeklyTests': weeklyTests,
          'exam': exam,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
          'data': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to complete onboarding',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // 23. Get User Profile with Onboarding
  static Future<Map<String, dynamic>> getUserProfile(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/profile/$userId'),
        headers: _authHeaders,
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['error'] ?? 'Failed to fetch user profile',
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

// Example Usage
void main() async {
  // Initialize the service
  await UserApiService.initialize();

  // Example 1: Register a new user
  final registerResult = await UserApiService.register(
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    exam: 'rrb-je',
    language: 'english',
  );

  if (registerResult['success']) {
    print('Registration successful: ${registerResult['message']}');
    final user = registerResult['user'] as User;
    print('User ID: ${user.id}');
    print('Referral Code: ${user.referralCode}');
  } else {
    print('Registration failed: ${registerResult['message']}');
  }

  // Example 2: Login
  final loginResult = await UserApiService.login(
    email: 'john@example.com',
    password: 'password123',
  );

  if (loginResult['success']) {
    print('Login successful');
    final user = loginResult['user'] as User;
    print('Welcome back, ${user.name}!');
  }

  // Example 3: Start a practice test
  final testResult = await UserApiService.startTestSession(
    testType: 'practice',
    subject: 'civil-engineering',
    level: 'basic',
  );

  if (testResult['success']) {
    print('Test started successfully');
    final questions = testResult['questions'] as List<Question>;
    print('Number of questions: ${questions.length}');
  } else if (testResult['requiresPremium']) {
    print('This test requires PrepLens+ subscription');
  }

  // Example 4: Get user stats
  final statsResult = await UserApiService.getUserStats();
  if (statsResult['success']) {
    final stats = statsResult['stats'] as UserStats;
    print('Total questions attempted: ${stats.totalQuestionsAttempted}');
    print('Average accuracy: ${stats.averageAccuracy}%');
  }
} 