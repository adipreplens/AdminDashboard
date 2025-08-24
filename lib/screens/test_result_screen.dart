import 'package:flutter/material.dart';
import 'detailed_solution_screen.dart';

class TestResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;

  const TestResultScreen({Key? key, required this.result}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final score = result['score'] ?? 0;
    final totalQuestions = result['totalQuestions'] ?? 0;
    final correctAnswers = result['correctAnswers'] ?? 0;
    final totalTime = result['totalTime'] ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: Text('Test Results'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(Icons.share),
            onPressed: () {
              // Share results functionality
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Share functionality coming soon!')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Score Card
            Container(
              width: double.infinity,
              margin: EdgeInsets.all(16),
              padding: EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.blue.shade400, Colors.blue.shade600],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.blue.withOpacity(0.3),
                    spreadRadius: 2,
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    'Your Score',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    '$score%',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    '$correctAnswers out of $totalQuestions correct',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                  SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildResultItem('Time', _formatTime(totalTime), Icons.timer),
                      _buildResultItem('Accuracy', '${((correctAnswers / totalQuestions) * 100).toStringAsFixed(1)}%', Icons.target),
                    ],
                  ),
                ],
              ),
            ),

            // Subject Performance
            if (result['subjectPerformance'] != null)
              Container(
                width: double.infinity,
                margin: EdgeInsets.all(16),
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      spreadRadius: 1,
                      blurRadius: 5,
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.analytics, color: Colors.green.shade600),
                        SizedBox(width: 8),
                        Text(
                          'Subject Performance',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.green.shade600,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16),
                    ...(result['subjectPerformance'] as Map<String, dynamic>).entries.map((entry) {
                      final subject = entry.key;
                      final performance = entry.value as Map<String, dynamic>;
                      final correct = performance['correct'] ?? 0;
                      final total = performance['total'] ?? 1;
                      final percentage = ((correct / total) * 100).toStringAsFixed(1);
                      
                      return Container(
                        margin: EdgeInsets.only(bottom: 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _formatSubjectName(subject),
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  '$percentage%',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: _getPerformanceColor(double.parse(percentage)),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 8),
                            LinearProgressIndicator(
                              value: correct / total,
                              backgroundColor: Colors.grey.shade200,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                _getPerformanceColor(double.parse(percentage)),
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              '$correct/$total questions correct',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),

            // Difficulty Performance
            if (result['difficultyPerformance'] != null)
              Container(
                width: double.infinity,
                margin: EdgeInsets.all(16),
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      spreadRadius: 1,
                      blurRadius: 5,
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.trending_up, color: Colors.orange.shade600),
                        SizedBox(width: 8),
                        Text(
                          'Difficulty Performance',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.orange.shade600,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16),
                    ...(result['difficultyPerformance'] as Map<String, dynamic>).entries.map((entry) {
                      final difficulty = entry.key;
                      final performance = entry.value as Map<String, dynamic>;
                      final correct = performance['correct'] ?? 0;
                      final total = performance['total'] ?? 1;
                      final percentage = ((correct / total) * 100).toStringAsFixed(1);
                      
                      return Container(
                        margin: EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            Container(
                              width: 80,
                              child: Text(
                                difficulty.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: _getDifficultyColor(difficulty),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: LinearProgressIndicator(
                                          value: correct / total,
                                          backgroundColor: Colors.grey.shade200,
                                          valueColor: AlwaysStoppedAnimation<Color>(
                                            _getDifficultyColor(difficulty),
                                          ),
                                        ),
                                      ),
                                      SizedBox(width: 12),
                                      Text(
                                        '$percentage%',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: _getDifficultyColor(difficulty),
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    '$correct/$total',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),

            // Recommendations
            if (result['recommendations'] != null && (result['recommendations'] as List).isNotEmpty)
              Container(
                width: double.infinity,
                margin: EdgeInsets.all(16),
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.lightbulb_outline, color: Colors.orange.shade700),
                        SizedBox(width: 8),
                        Text(
                          'Recommendations',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.orange.shade700,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 12),
                    ...(result['recommendations'] as List).map((rec) => Padding(
                      padding: EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.arrow_right, color: Colors.orange.shade600, size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              rec,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.orange.shade800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )).toList(),
                  ],
                ),
              ),

            // Detailed Solutions Button
            Container(
              width: double.infinity,
              margin: EdgeInsets.all(16),
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DetailedSolutionScreen(testResult: result),
                    ),
                  );
                },
                icon: Icon(Icons.analytics),
                label: Text('View Detailed Solutions'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.purple,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),

            // Action Buttons
            Container(
              width: double.infinity,
              margin: EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      icon: Icon(Icons.home),
                      label: Text('Dashboard'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey.shade300,
                        foregroundColor: Colors.grey.shade700,
                        padding: EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // Navigate to practice test
                        Navigator.pop(context);
                        // You can add navigation to practice test here
                      },
                      icon: Icon(Icons.play_arrow),
                      label: Text('Practice More'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes}m ${remainingSeconds}s';
  }

  String _formatSubjectName(String subject) {
    return subject.split('-').map((word) => 
      word[0].toUpperCase() + word.substring(1)
    ).join(' ');
  }

  Color _getPerformanceColor(double percentage) {
    if (percentage >= 80) return Colors.green;
    if (percentage >= 60) return Colors.orange;
    return Colors.red;
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
} 