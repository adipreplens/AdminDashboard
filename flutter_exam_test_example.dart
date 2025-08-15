import 'package:flutter/material.dart';
import 'flutter_user_api_service.dart';

class ExamQuestionsTest extends StatefulWidget {
  @override
  _ExamQuestionsTestState createState() => _ExamQuestionsTestState();
}

class _ExamQuestionsTestState extends State<ExamQuestionsTest> {
  String selectedExam = 'rrb-je';
  List<dynamic> questions = [];
  List<String> subjects = [];
  List<String> difficulties = [];
  bool isLoading = false;
  String statusMessage = '';

  @override
  void initState() {
    super.initState();
    _loadExamData();
  }

  Future<void> _loadExamData() async {
    setState(() {
      isLoading = true;
      statusMessage = 'Loading exam data...';
    });

    try {
      // 1. Load subjects for selected exam
      final subjectsResult = await UserApiService.getSubjectsByExam(selectedExam);
      if (subjectsResult['success']) {
        setState(() {
          subjects = List<String>.from(subjectsResult['data']);
        });
      }

      // 2. Load difficulties for selected exam
      final difficultiesResult = await UserApiService.getDifficultiesByExam(selectedExam);
      if (difficultiesResult['success']) {
        setState(() {
          difficulties = List<String>.from(difficultiesResult['data']);
        });
      }

      // 3. Load questions for selected exam
      await _loadQuestions();

    } catch (e) {
      setState(() {
        statusMessage = 'Error: $e';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _loadQuestions() async {
    try {
      final result = await UserApiService.getQuestionsByExam(
        exam: selectedExam,
        page: 1,
        limit: 10,
      );

      if (result['success']) {
        setState(() {
          questions = result['data']['questions'];
          statusMessage = 'Loaded ${questions.length} questions for $selectedExam';
        });
      } else {
        setState(() {
          statusMessage = 'Failed to load questions: ${result['message']}';
        });
      }
    } catch (e) {
      setState(() {
        statusMessage = 'Error loading questions: $e';
      });
    }
  }

  void _changeExam(String newExam) {
    setState(() {
      selectedExam = newExam;
      questions = [];
      subjects = [];
      difficulties = [];
    });
    _loadExamData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Exam Questions Test'),
        backgroundColor: Colors.blue,
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Exam Selector
            Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Select Exam:',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    DropdownButton<String>(
                      value: selectedExam,
                      isExpanded: true,
                      items: [
                        'rrb-je',
                        'ssc-je',
                        'upsc',
                        'bank-po',
                        'cat'
                      ].map((String exam) {
                        return DropdownMenuItem<String>(
                          value: exam,
                          child: Text(exam.toUpperCase()),
                        );
                      }).toList(),
                      onChanged: (String? newExam) {
                        if (newExam != null) {
                          _changeExam(newExam);
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 16),

            // Status Message
            if (statusMessage.isNotEmpty)
              Card(
                color: statusMessage.contains('Error') ? Colors.red[100] : Colors.green[100],
                child: Padding(
                  padding: EdgeInsets.all(12.0),
                  child: Text(
                    statusMessage,
                    style: TextStyle(fontSize: 14),
                  ),
                ),
              ),

            SizedBox(height: 16),

            // Exam Info
            if (subjects.isNotEmpty || difficulties.isNotEmpty)
              Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Exam Information:',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 8),
                      if (subjects.isNotEmpty)
                        Text('📚 Subjects: ${subjects.join(', ')}'),
                      if (difficulties.isNotEmpty)
                        Text('📊 Difficulties: ${difficulties.join(', ')}'),
                    ],
                  ),
                ),
              ),

            SizedBox(height: 16),

            // Questions List
            Expanded(
              child: Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text(
                        'Questions (${questions.length}):',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Expanded(
                      child: isLoading
                          ? Center(child: CircularProgressIndicator())
                          : questions.isEmpty
                              ? Center(child: Text('No questions found'))
                              : ListView.builder(
                                  itemCount: questions.length,
                                  itemBuilder: (context, index) {
                                    final question = questions[index];
                                    return ListTile(
                                      title: Text(
                                        question['text'] ?? 'No text',
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      subtitle: Text(
                                        '${question['subject'] ?? 'Unknown'} - ${question['difficulty'] ?? 'Unknown'}',
                                        style: TextStyle(fontSize: 12),
                                      ),
                                      trailing: Icon(Icons.question_answer),
                                    );
                                  },
                                ),
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 16),

            // Refresh Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : _loadQuestions,
                child: Text('Refresh Questions'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Usage in your main app:
void main() {
  runApp(MaterialApp(
    home: ExamQuestionsTest(),
  ));
} 