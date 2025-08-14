import 'dart:convert';
import 'package:http/http.dart' as http;

// Question Model
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
      marks: json['marks'] ?? 0,
      timeLimit: json['timeLimit'] ?? 0,
      blooms: json['blooms'] ?? '',
      publishStatus: json['publishStatus'] ?? '',
      category: json['category'] ?? '',
      topic: json['topic'] ?? '',
      solution: json['solution'] ?? '',
      moduleType: json['moduleType'] ?? '',
      isPremium: json['isPremium'] ?? false,
      language: json['language'] ?? '',
      hints: List<String>.from(json['hints'] ?? []),
      relatedQuestions: List<String>.from(json['relatedQuestions'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

// API Response Model
class QuestionsResponse {
  final List<Question> questions;
  final int totalPages;
  final int currentPage;
  final int total;

  QuestionsResponse({
    required this.questions,
    required this.totalPages,
    required this.currentPage,
    required this.total,
  });

  factory QuestionsResponse.fromJson(Map<String, dynamic> json) {
    return QuestionsResponse(
      questions: (json['questions'] as List)
          .map((question) => Question.fromJson(question))
          .toList(),
      totalPages: json['totalPages'] ?? 1,
      currentPage: json['currentPage'] ?? 1,
      total: json['total'] ?? 0,
    );
  }
}

// Question Service Class
class QuestionService {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';

  // Fetch all questions
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

  // Fetch questions with filters
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

  // Get distinct values for filters
  static Future<Map<String, List<String>>> getFilterOptions() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/questions'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        final questions = (jsonData['questions'] as List)
            .map((q) => Question.fromJson(q))
            .toList();

        // Extract unique values
        final subjects = questions.map((q) => q.subject).toSet().toList();
        final exams = questions.map((q) => q.exam).toSet().toList();
        final difficulties = questions.map((q) => q.difficulty).toSet().toList();
        final allTags = questions.expand((q) => q.tags).toSet().toList();
        final categories = questions.map((q) => q.category).where((c) => c.isNotEmpty).toSet().toList();
        final topics = questions.map((q) => q.topic).where((t) => t.isNotEmpty).toSet().toList();
        final languages = questions.map((q) => q.language).toSet().toList();
        final moduleTypes = questions.map((q) => q.moduleType).toSet().toList();

        return {
          'subjects': subjects,
          'exams': exams,
          'difficulties': difficulties,
          'tags': allTags,
          'categories': categories,
          'topics': topics,
          'languages': languages,
          'moduleTypes': moduleTypes,
        };
      } else {
        throw Exception('Failed to load filter options: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching filter options: $e');
    }
  }
}

// Example Usage in Flutter Widget
class QuestionsScreen extends StatefulWidget {
  @override
  _QuestionsScreenState createState() => _QuestionsScreenState();
}

class _QuestionsScreenState extends State<QuestionsScreen> {
  QuestionsResponse? questionsResponse;
  bool isLoading = false;
  String? error;

  // Filter variables
  String? selectedSubject;
  String? selectedExam;
  String? selectedDifficulty;
  List<String> selectedTags = [];
  String? selectedLanguage;
  bool? selectedIsPremium;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final response = await QuestionService.getFilteredQuestions(
        subject: selectedSubject,
        exam: selectedExam,
        difficulty: selectedDifficulty,
        tags: selectedTags.isNotEmpty ? selectedTags : null,
        language: selectedLanguage,
        isPremium: selectedIsPremium,
      );

      setState(() {
        questionsResponse = response;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Questions'),
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $error'),
            ElevatedButton(
              onPressed: _loadQuestions,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (questionsResponse == null || questionsResponse!.questions.isEmpty) {
      return Center(child: Text('No questions found'));
    }

    return ListView.builder(
      itemCount: questionsResponse!.questions.length,
      itemBuilder: (context, index) {
        final question = questionsResponse!.questions[index];
        return Card(
          margin: EdgeInsets.all(8),
          child: ListTile(
            title: Text(
              question.text,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Subject: ${question.subject}'),
                Text('Exam: ${question.exam}'),
                Text('Difficulty: ${question.difficulty}'),
                if (question.tags.isNotEmpty)
                  Text('Tags: ${question.tags.join(', ')}'),
              ],
            ),
            trailing: question.isPremium
                ? Icon(Icons.star, color: Colors.amber)
                : null,
            onTap: () {
              // Navigate to question detail screen
              _showQuestionDetail(question);
            },
          ),
        );
      },
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Filter Questions'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Add filter widgets here
              Text('Filter options will be implemented here'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _loadQuestions();
            },
            child: Text('Apply'),
          ),
        ],
      ),
    );
  }

  void _showQuestionDetail(Question question) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Question Detail'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(question.text, style: TextStyle(fontWeight: FontWeight.bold)),
              SizedBox(height: 16),
              Text('Options:'),
              ...question.options.map((option) => Text('• $option')),
              SizedBox(height: 16),
              Text('Answer: ${question.answer}'),
              SizedBox(height: 16),
              Text('Solution: ${question.solution}'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close'),
          ),
        ],
      ),
    );
  }
}

// Example of how to use the service
void main() async {
  // Example 1: Get all questions
  try {
    final allQuestions = await QuestionService.getAllQuestions(page: 1, limit: 10);
    print('Total questions: ${allQuestions.total}');
    print('Questions loaded: ${allQuestions.questions.length}');
  } catch (e) {
    print('Error: $e');
  }

  // Example 2: Get filtered questions
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

  // Example 3: Get filter options
  try {
    final filterOptions = await QuestionService.getFilterOptions();
    print('Available subjects: ${filterOptions['subjects']}');
    print('Available exams: ${filterOptions['exams']}');
    print('Available tags: ${filterOptions['tags']}');
  } catch (e) {
    print('Error: $e');
  }
} 