# Flutter App API Integration Guide

## 🚀 **Base URL**
```
https://admindashboard-x0hk.onrender.com
```

## 📱 **API Endpoints for Flutter App**

### **1. Get All Questions**
```dart
GET /questions
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example:**
```dart
final response = await QuestionService.getAllQuestions(page: 1, limit: 10);
```

### **2. Get Filtered Questions**
```dart
GET /questions?subject=civil-engineering&exam=ssc-je&difficulty=easy&tags=stone,rock
```

**Available Filters:**
- `subject`: civil-engineering, general, etc.
- `exam`: ssc-je, rrb-je, etc.
- `difficulty`: easy, medium, hard
- `tags`: stone, rock, building, etc.
- `category`: Any category value
- `topic`: Any topic value
- `language`: english, hindi
- `isPremium`: true, false
- `moduleType`: practice, mock_test, pyq

**Example:**
```dart
final response = await QuestionService.getFilteredQuestions(
  subject: 'civil-engineering',
  exam: 'ssc-je',
  difficulty: 'easy',
  tags: ['stone', 'rock'],
  language: 'english',
);
```

### **3. Get Modules**
```dart
GET /modules
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### **4. Get Tags (for filter options)**
```dart
GET /tags
```

## 🔧 **Flutter Implementation**

### **Step 1: Add Dependencies**
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  json_annotation: ^4.8.1

dev_dependencies:
  json_serializable: ^6.7.1
  build_runner: ^2.4.6
```

### **Step 2: Create Question Model**
```dart
import 'dart:convert';
import 'package:json_annotation/json_annotation.dart';

part 'question.g.dart';

@JsonSerializable()
class Question {
  @JsonKey(name: '_id')
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
  final String blooms;
  final String publishStatus;
  final String category;
  final String topic;
  final String solution;
  final String moduleType;
  final bool isPremium;
  final String language;
  final List<String> hints;
  final List<String> relatedQuestions;
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
    required this.tags,
    required this.marks,
    required this.timeLimit,
    required this.blooms,
    required this.publishStatus,
    required this.category,
    required this.topic,
    required this.solution,
    required this.moduleType,
    required this.isPremium,
    required this.language,
    required this.hints,
    required this.relatedQuestions,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Question.fromJson(Map<String, dynamic> json) => _$QuestionFromJson(json);
  Map<String, dynamic> toJson() => _$QuestionToJson(this);
}
```

### **Step 3: Create API Service**
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class QuestionService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';

  // Get all questions
  static Future<QuestionsResponse> getAllQuestions({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/questions?page=$page&limit=$limit'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        return QuestionsResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load questions: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching questions: $e');
    }
  }

  // Get filtered questions
  static Future<QuestionsResponse> getFilteredQuestions({
    int page = 1,
    int limit = 20,
    String? subject,
    String? exam,
    String? difficulty,
    List<String>? tags,
    String? category,
    String? topic,
    String? language,
    bool? isPremium,
    String? moduleType,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      // Add filters if provided
      if (subject != null) queryParams['subject'] = subject;
      if (exam != null) queryParams['exam'] = exam;
      if (difficulty != null) queryParams['difficulty'] = difficulty;
      if (category != null) queryParams['category'] = category;
      if (topic != null) queryParams['topic'] = topic;
      if (language != null) queryParams['language'] = language;
      if (isPremium != null) queryParams['isPremium'] = isPremium.toString();
      if (moduleType != null) queryParams['moduleType'] = moduleType;
      if (tags != null && tags.isNotEmpty) {
        queryParams['tags'] = tags.join(',');
      }

      final uri = Uri.parse('$baseUrl/questions').replace(queryParameters: queryParams);
      
      final response = await http.get(
        uri,
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        return QuestionsResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load filtered questions: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching filtered questions: $e');
    }
  }
}
```

## 🎯 **Filter Examples**

### **Example 1: Get Civil Engineering Questions**
```dart
final civilQuestions = await QuestionService.getFilteredQuestions(
  subject: 'civil-engineering',
  page: 1,
  limit: 20,
);
```

### **Example 2: Get Easy SSC JE Questions**
```dart
final easySSCQuestions = await QuestionService.getFilteredQuestions(
  subject: 'civil-engineering',
  exam: 'ssc-je',
  difficulty: 'easy',
  language: 'english',
);
```

### **Example 3: Get Questions by Tags**
```dart
final stoneQuestions = await QuestionService.getFilteredQuestions(
  tags: ['stone', 'rock', 'building'],
  difficulty: 'medium',
);
```

### **Example 4: Get Premium Questions**
```dart
final premiumQuestions = await QuestionService.getFilteredQuestions(
  isPremium: true,
  moduleType: 'mock_test',
);
```

## 📊 **Response Format**

```json
{
  "questions": [
    {
      "_id": "689614f7a34c56aaaab1fed3",
      "text": "What is the range of specific gravity of granite rock aggregates?",
      "options": ["1.6–2.0", "2.0–2.5", "2.6–2.9", "1.0–1.6"],
      "answer": "2.6–2.9",
      "subject": "civil-engineering",
      "exam": "ssc-je",
      "difficulty": "easy",
      "tags": ["stone", "rock", "granite"],
      "marks": 1,
      "timeLimit": 60,
      "blooms": "remember",
      "publishStatus": "draft",
      "category": "",
      "topic": "",
      "solution": "Granite aggregates normally have a specific gravity of 2.6–2.9...",
      "moduleType": "practice",
      "isPremium": false,
      "language": "english",
      "hints": [],
      "relatedQuestions": [],
      "createdAt": "2025-08-08T15:17:11.800Z",
      "updatedAt": "2025-08-08T15:17:11.800Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 101
}
```

## 🔍 **Available Filter Values**

### **Subjects:**
- civil-engineering
- general

### **Exams:**
- ssc-je
- rrb-je

### **Difficulties:**
- easy
- medium
- hard

### **Languages:**
- english
- hindi

### **Module Types:**
- practice
- mock_test
- pyq

### **Popular Tags:**
- stone
- rock
- building
- construction
- material
- strength
- test

## 🚀 **Quick Start Example**

```dart
void main() async {
  // Get all questions
  try {
    final allQuestions = await QuestionService.getAllQuestions(page: 1, limit: 10);
    print('Total questions: ${allQuestions.total}');
    print('Questions loaded: ${allQuestions.questions.length}');
  } catch (e) {
    print('Error: $e');
  }

  // Get filtered questions
  try {
    final filteredQuestions = await QuestionService.getFilteredQuestions(
      subject: 'civil-engineering',
      exam: 'ssc-je',
      difficulty: 'easy',
      tags: ['stone', 'rock'],
      language: 'english',
    );
    print('Filtered questions: ${filteredQuestions.questions.length}');
  } catch (e) {
    print('Error: $e');
  }
}
```

## 📱 **UI Implementation Tips**

1. **Loading States**: Always show loading indicators while fetching data
2. **Error Handling**: Display user-friendly error messages
3. **Pagination**: Implement infinite scroll or pagination controls
4. **Caching**: Consider caching frequently accessed data
5. **Offline Support**: Handle network connectivity issues gracefully

## 🔧 **Advanced Features**

### **Search Functionality**
```dart
// You can implement search by filtering questions based on text content
final searchResults = questions.where((q) => 
  q.text.toLowerCase().contains(searchTerm.toLowerCase()) ||
  q.tags.any((tag) => tag.toLowerCase().contains(searchTerm.toLowerCase()))
).toList();
```

### **Favorites System**
```dart
// Store favorite question IDs locally
class FavoritesService {
  static const String _key = 'favorite_questions';
  
  static Future<void> addFavorite(String questionId) async {
    final prefs = await SharedPreferences.getInstance();
    final favorites = prefs.getStringList(_key) ?? [];
    if (!favorites.contains(questionId)) {
      favorites.add(questionId);
      await prefs.setStringList(_key, favorites);
    }
  }
  
  static Future<List<String>> getFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_key) ?? [];
  }
}
```

This guide provides everything you need to integrate your Flutter app with the backend API! 🎯 