import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../services/question_service.dart';
import '../services/user_service.dart';
import '../models/question_model.dart';

class DiagnosticTestScreen extends StatefulWidget {
  const DiagnosticTestScreen({super.key});

  @override
  State<DiagnosticTestScreen> createState() => _DiagnosticTestScreenState();
}

class _DiagnosticTestScreenState extends State<DiagnosticTestScreen> {
  List<Question> _questions = [];
  int _currentQuestionIndex = 0;
  Map<int, String> _userAnswers = {};
  bool _isTestStarted = false;
  bool _isTestCompleted = false;
  int _timeRemaining = 0;
  late DateTime _testStartTime;

  @override
  void initState() {
    super.initState();
    _loadDiagnosticQuestions();
  }

  Future<void> _loadDiagnosticQuestions() async {
    final questionService = Provider.of<QuestionService>(context, listen: false);
    final userService = Provider.of<UserService>(context, listen: false);
    
    if (userService.userProfile?.exam != null) {
      // Get questions from different subjects and difficulty levels
      final exam = userService.userProfile!.exam;
      final subjects = questionService.getSubjectsForExam(exam);
      
      List<Question> diagnosticQuestions = [];
      
      // Get 2-3 questions from each subject with different difficulty levels
      for (String subject in subjects.take(3)) { // Limit to 3 subjects for diagnostic
        final questions = await questionService.getPracticeQuestions(
          exam: exam,
          subject: subject,
          level: 'Level 1', // Start with basic level
          limit: 2,
        );
        diagnosticQuestions.addAll(questions);
      }
      
      setState(() {
        _questions = diagnosticQuestions;
        _timeRemaining = diagnosticQuestions.length * 60; // 1 minute per question
      });
    }
  }

  void _startTest() {
    setState(() {
      _isTestStarted = true;
      _testStartTime = DateTime.now();
    });
    _startTimer();
  }

  void _startTimer() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted && _isTestStarted && !_isTestCompleted) {
        setState(() {
          _timeRemaining--;
        });
        if (_timeRemaining > 0) {
          _startTimer();
        } else {
          _submitTest();
        }
      }
    });
  }

  void _selectAnswer(String answer) {
    setState(() {
      _userAnswers[_currentQuestionIndex] = answer;
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    } else {
      _submitTest();
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  Future<void> _submitTest() async {
    setState(() {
      _isTestCompleted = true;
      _isTestStarted = false;
    });

    // Calculate results
    int correctAnswers = 0;
    Map<String, int> subjectScores = {};
    Map<String, int> subjectTotals = {};

    for (int i = 0; i < _questions.length; i++) {
      final question = _questions[i];
      final userAnswer = _userAnswers[i];
      
      if (userAnswer == question.answer) {
        correctAnswers++;
        subjectScores[question.subject] = (subjectScores[question.subject] ?? 0) + 1;
      }
      subjectTotals[question.subject] = (subjectTotals[question.subject] ?? 0) + 1;
    }

    final accuracy = (_questions.isNotEmpty) ? (correctAnswers / _questions.length) * 100 : 0;
    final testDuration = DateTime.now().difference(_testStartTime);

    // Determine subject levels based on performance
    Map<String, String> subjectLevels = {};
    for (String subject in subjectScores.keys) {
      final score = subjectScores[subject]!;
      final total = subjectTotals[subject]!;
      final subjectAccuracy = (score / total) * 100;
      
      if (subjectAccuracy >= 80) {
        subjectLevels[subject] = 'Advanced';
      } else if (subjectAccuracy >= 60) {
        subjectLevels[subject] = 'Intermediate';
      } else {
        subjectLevels[subject] = 'Beginner';
      }
    }

    // Submit results to backend
    final userService = Provider.of<UserService>(context, listen: false);
    final results = {
      'totalQuestions': _questions.length,
      'correctAnswers': correctAnswers,
      'accuracy': accuracy,
      'testDuration': testDuration.inMinutes,
      'subjectScores': subjectScores,
      'subjectLevels': subjectLevels,
      'answers': _userAnswers,
    };

    final success = await userService.submitDiagnosticResults(results);
    
    if (success && mounted) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    }
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  Widget _buildTestIntro() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.quiz,
          size: 80.sp,
          color: Colors.blue[600],
        ),
        SizedBox(height: 24.h),
        Text(
          'Diagnostic Test',
          style: TextStyle(
            fontSize: 32.sp,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        SizedBox(height: 16.h),
        Text(
          'This test will help us understand your current level and create a personalized learning path for you.',
          style: TextStyle(
            fontSize: 16.sp,
            color: Colors.grey[600],
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 32.h),
        Container(
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Column(
            children: [
              Text(
                'Test Details',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[800],
                ),
              ),
              SizedBox(height: 12.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      Text(
                        '${_questions.length}',
                        style: TextStyle(
                          fontSize: 24.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[600],
                        ),
                      ),
                      Text(
                        'Questions',
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text(
                        '${_questions.length}',
                        style: TextStyle(
                          fontSize: 24.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[600],
                        ),
                      ),
                      Text(
                        'Minutes',
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
        SizedBox(height: 40.h),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _startTest,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[600],
              padding: EdgeInsets.symmetric(vertical: 16.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: Text(
              'Start Diagnostic Test',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuestion() {
    if (_questions.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    final question = _questions[_currentQuestionIndex];
    final userAnswer = _userAnswers[_currentQuestionIndex];

    return Column(
      children: [
        // Header with progress and timer
        Container(
          padding: EdgeInsets.all(16.w),
          decoration: BoxDecoration(
            color: Colors.blue[600],
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${_currentQuestionIndex + 1} of ${_questions.length}',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                _formatTime(_timeRemaining),
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        
        SizedBox(height: 24.h),
        
        // Progress bar
        LinearProgressIndicator(
          value: (_currentQuestionIndex + 1) / _questions.length,
          backgroundColor: Colors.grey[300],
          valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
        ),
        
        SizedBox(height: 32.h),
        
        // Question
        Container(
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Subject: ${question.subject}',
                style: TextStyle(
                  fontSize: 12.sp,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                question.text,
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[800],
                ),
              ),
            ],
          ),
        ),
        
        SizedBox(height: 24.h),
        
        // Options
        ...question.options.asMap().entries.map((entry) {
          final index = entry.key;
          final option = entry.value;
          final optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          final isSelected = userAnswer == option;
          
          return Container(
            margin: EdgeInsets.only(bottom: 12.h),
            child: Card(
              elevation: isSelected ? 4 : 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
                side: BorderSide(
                  color: isSelected ? Colors.blue : Colors.transparent,
                  width: 2,
                ),
              ),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: isSelected ? Colors.blue[600] : Colors.grey[300],
                  child: Text(
                    optionLetter,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.grey[600],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(
                  option,
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    color: isSelected ? Colors.blue[600] : Colors.grey[800],
                  ),
                ),
                onTap: () => _selectAnswer(option),
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Diagnostic Test'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue[50]!,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.all(20.w),
            child: Column(
              children: [
                Expanded(
                  child: _isTestStarted && !_isTestCompleted
                      ? _buildQuestion()
                      : _buildTestIntro(),
                ),
                
                if (_isTestStarted && !_isTestCompleted) ...[
                  SizedBox(height: 24.h),
                  Row(
                    children: [
                      if (_currentQuestionIndex > 0) ...[
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _previousQuestion,
                            style: OutlinedButton.styleFrom(
                              padding: EdgeInsets.symmetric(vertical: 16.h),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.r),
                              ),
                            ),
                            child: Text(
                              'Previous',
                              style: TextStyle(fontSize: 16.sp),
                            ),
                          ),
                        ),
                        SizedBox(width: 16.w),
                      ],
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _userAnswers[_currentQuestionIndex] != null
                              ? _nextQuestion
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue[600],
                            padding: EdgeInsets.symmetric(vertical: 16.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.r),
                            ),
                          ),
                          child: Text(
                            _currentQuestionIndex == _questions.length - 1
                                ? 'Submit Test'
                                : 'Next',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}