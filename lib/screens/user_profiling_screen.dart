import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/user_service.dart';
import '../services/question_service.dart';

class UserProfilingScreen extends StatefulWidget {
  const UserProfilingScreen({super.key});

  @override
  State<UserProfilingScreen> createState() => _UserProfilingScreenState();
}

class _UserProfilingScreenState extends State<UserProfilingScreen> {
  int _currentQuestionIndex = 0;
  String? _selectedPreparationDuration;
  String? _selectedPreparationLevel;
  List<String> _selectedChallengingSubjects = [];
  DateTime? _targetExamDate;

  final List<Map<String, dynamic>> _profilingQuestions = [
    {
      'question': 'How long have you been preparing?',
      'type': 'single_choice',
      'options': [
        'Just starting',
        'Few weeks',
        'Several months',
        'Over a year',
      ],
    },
    {
      'question': 'Self-assessed preparation level?',
      'type': 'single_choice',
      'options': [
        'Beginner',
        'Intermediate',
        'Advanced',
      ],
    },
    {
      'question': 'Which subjects are most challenging?',
      'type': 'multiple_choice',
      'options': [], // Will be populated based on selected exam
    },
    {
      'question': 'Target exam date? (Optional)',
      'type': 'date_picker',
      'options': [],
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadSubjectsForExam();
  }

  void _loadSubjectsForExam() {
    final questionService = Provider.of<QuestionService>(context, listen: false);
    final userService = Provider.of<UserService>(context, listen: false);
    
    // Get subjects based on selected exam
    if (userService.userProfile?.exam != null) {
      final subjects = questionService.getSubjectsForExam(userService.userProfile!.exam);
      _profilingQuestions[2]['options'] = subjects;
    }
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < _profilingQuestions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    } else {
      _submitProfiling();
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  Future<void> _submitProfiling() async {
    final userService = Provider.of<UserService>(context, listen: false);
    
    final profileData = {
      'preparationDuration': _selectedPreparationDuration,
      'preparationLevel': _selectedPreparationLevel,
      'challengingSubjects': _selectedChallengingSubjects,
      'targetExamDate': _targetExamDate?.toIso8601String(),
      'onboardingCompleted': true,
    };

    final success = await userService.updateUserProfile(profileData);
    
    if (success && mounted) {
      Navigator.pushReplacementNamed(context, '/diagnostic');
    }
  }

  Widget _buildQuestion() {
    final question = _profilingQuestions[_currentQuestionIndex];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Progress indicator
        LinearProgressIndicator(
          value: (_currentQuestionIndex + 1) / _profilingQuestions.length,
          backgroundColor: Colors.grey[300],
          valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
        ),
        
        SizedBox(height: 32.h),
        
        // Question
        Text(
          question['question'],
          style: TextStyle(
            fontSize: 24.sp,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        
        SizedBox(height: 24.h),
        
        // Answer options
        if (question['type'] == 'single_choice') ...[
          ...(question['options'] as List<String>).map((option) => 
            _buildSingleChoiceOption(option)
          ),
        ] else if (question['type'] == 'multiple_choice') ...[
          ...(question['options'] as List<String>).map((option) => 
            _buildMultipleChoiceOption(option)
          ),
        ] else if (question['type'] == 'date_picker') ...[
          _buildDatePicker(),
        ],
      ],
    );
  }

  Widget _buildSingleChoiceOption(String option) {
    final isSelected = _getSelectedValue() == option;
    
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
          title: Text(
            option,
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              color: isSelected ? Colors.blue[600] : Colors.grey[800],
            ),
          ),
          trailing: isSelected
              ? Icon(Icons.check_circle, color: Colors.blue[600])
              : Icon(Icons.radio_button_unchecked, color: Colors.grey[400]),
          onTap: () {
            setState(() {
              if (_currentQuestionIndex == 0) {
                _selectedPreparationDuration = option;
              } else if (_currentQuestionIndex == 1) {
                _selectedPreparationLevel = option;
              }
            });
          },
        ),
      ),
    );
  }

  Widget _buildMultipleChoiceOption(String option) {
    final isSelected = _selectedChallengingSubjects.contains(option);
    
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
          title: Text(
            option,
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              color: isSelected ? Colors.blue[600] : Colors.grey[800],
            ),
          ),
          trailing: isSelected
              ? Icon(Icons.check_circle, color: Colors.blue[600])
              : Icon(Icons.check_circle_outline, color: Colors.grey[400]),
          onTap: () {
            setState(() {
              if (isSelected) {
                _selectedChallengingSubjects.remove(option);
              } else {
                _selectedChallengingSubjects.add(option);
              }
            });
          },
        ),
      ),
    );
  }

  Widget _buildDatePicker() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(
        children: [
          if (_targetExamDate != null) ...[
            Text(
              'Selected: ${DateFormat('MMM dd, yyyy').format(_targetExamDate!)}',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: Colors.blue[600],
              ),
            ),
            SizedBox(height: 16.h),
          ],
          ElevatedButton.icon(
            onPressed: () async {
              final date = await showDatePicker(
                context: context,
                initialDate: _targetExamDate ?? DateTime.now().add(const Duration(days: 30)),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (date != null) {
                setState(() {
                  _targetExamDate = date;
                });
              }
            },
            icon: const Icon(Icons.calendar_today),
            label: Text(_targetExamDate == null ? 'Select Date' : 'Change Date'),
          ),
        ],
      ),
    );
  }

  String? _getSelectedValue() {
    switch (_currentQuestionIndex) {
      case 0:
        return _selectedPreparationDuration;
      case 1:
        return _selectedPreparationLevel;
      default:
        return null;
    }
  }

  bool _canProceed() {
    switch (_currentQuestionIndex) {
      case 0:
        return _selectedPreparationDuration != null;
      case 1:
        return _selectedPreparationLevel != null;
      case 2:
        return _selectedChallengingSubjects.isNotEmpty;
      case 3:
        return true; // Optional question
      default:
        return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tell Us About Yourself'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        leading: _currentQuestionIndex > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _previousQuestion,
              )
            : null,
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
                  child: _buildQuestion(),
                ),
                
                SizedBox(height: 32.h),
                
                // Navigation buttons
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
                        onPressed: _canProceed() ? _nextQuestion : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[600],
                          padding: EdgeInsets.symmetric(vertical: 16.h),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                        ),
                        child: Text(
                          _currentQuestionIndex == _profilingQuestions.length - 1
                              ? 'Complete'
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
            ),
          ),
        ),
      ),
    );
  }
}