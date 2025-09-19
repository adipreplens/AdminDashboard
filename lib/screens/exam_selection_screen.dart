import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../services/user_service.dart';

class ExamSelectionScreen extends StatefulWidget {
  const ExamSelectionScreen({super.key});

  @override
  State<ExamSelectionScreen> createState() => _ExamSelectionScreenState();
}

class _ExamSelectionScreenState extends State<ExamSelectionScreen> {
  String? _selectedExam;

  final List<Map<String, dynamic>> _exams = [
    {
      'id': 'ssc-cgl',
      'name': 'SSC CGL',
      'description': 'Staff Selection Commission Combined Graduate Level',
      'icon': Icons.work,
      'color': Colors.blue,
    },
    {
      'id': 'ssc-chsl',
      'name': 'SSC CHSL',
      'description': 'Staff Selection Commission Combined Higher Secondary Level',
      'icon': Icons.school,
      'color': Colors.green,
    },
    {
      'id': 'ssc-je',
      'name': 'SSC JE',
      'description': 'Staff Selection Commission Junior Engineer',
      'icon': Icons.engineering,
      'color': Colors.orange,
    },
    {
      'id': 'rrb-je',
      'name': 'RRB JE',
      'description': 'Railway Recruitment Board Junior Engineer',
      'icon': Icons.train,
      'color': Colors.purple,
    },
    {
      'id': 'rrb-ntpc',
      'name': 'RRB NTPC',
      'description': 'Railway Recruitment Board Non-Technical Popular Categories',
      'icon': Icons.business,
      'color': Colors.red,
    },
    {
      'id': 'rrb-alp',
      'name': 'RRB ALP',
      'description': 'Railway Recruitment Board Assistant Loco Pilot',
      'icon': Icons.directions_train,
      'color': Colors.teal,
    },
    {
      'id': 'upsc',
      'name': 'UPSC',
      'description': 'Union Public Service Commission Civil Services',
      'icon': Icons.account_balance,
      'color': Colors.indigo,
    },
    {
      'id': 'bank-po',
      'name': 'Bank PO',
      'description': 'Bank Probationary Officer',
      'icon': Icons.account_balance_wallet,
      'color': Colors.brown,
    },
  ];

  Future<void> _selectExam(String examId) async {
    setState(() {
      _selectedExam = examId;
    });

    final userService = Provider.of<UserService>(context, listen: false);
    final success = await userService.updateUserExam(examId);
    
    if (success && mounted) {
      Navigator.pushReplacementNamed(context, '/profiling');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Your Exam'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Container(
                  padding: EdgeInsets.all(20.w),
                  decoration: BoxDecoration(
                    color: Colors.blue[600],
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Choose Your Target Exam',
                        style: TextStyle(
                          fontSize: 24.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        'Select the government exam you\'re preparing for. We\'ll customize your learning path accordingly.',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: 24.h),
                
                // Exam List
                Expanded(
                  child: ListView.builder(
                    itemCount: _exams.length,
                    itemBuilder: (context, index) {
                      final exam = _exams[index];
                      final isSelected = _selectedExam == exam['id'];
                      
                      return Container(
                        margin: EdgeInsets.only(bottom: 12.h),
                        child: Card(
                          elevation: isSelected ? 4 : 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            side: BorderSide(
                              color: isSelected 
                                  ? exam['color'] as Color
                                  : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: (exam['color'] as Color).withOpacity(0.1),
                              child: Icon(
                                exam['icon'] as IconData,
                                color: exam['color'] as Color,
                              ),
                            ),
                            title: Text(
                              exam['name'] as String,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 16.sp,
                                color: isSelected 
                                    ? exam['color'] as Color
                                    : Colors.grey[800],
                              ),
                            ),
                            subtitle: Text(
                              exam['description'] as String,
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: Colors.grey[600],
                              ),
                            ),
                            trailing: isSelected
                                ? Icon(
                                    Icons.check_circle,
                                    color: exam['color'] as Color,
                                  )
                                : Icon(
                                    Icons.radio_button_unchecked,
                                    color: Colors.grey[400],
                                  ),
                            onTap: () => _selectExam(exam['id'] as String),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                
                // Continue Button
                if (_selectedExam != null) ...[
                  SizedBox(height: 16.h),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _selectExam(_selectedExam!),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[600],
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                      child: Text(
                        'Continue',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
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