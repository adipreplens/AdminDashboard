import 'package:flutter/material.dart';

class DetailedSolutionScreen extends StatefulWidget {
  final Map<String, dynamic> testResult;

  const DetailedSolutionScreen({Key? key, required this.testResult}) : super(key: key);

  @override
  _DetailedSolutionScreenState createState() => _DetailedSolutionScreenState();
}

class _DetailedSolutionScreenState extends State<DetailedSolutionScreen> {
  int currentQuestionIndex = 0;

  @override
  Widget build(BuildContext context) {
    final detailedResults = widget.testResult['detailedResults'] as List<dynamic>;
    final totalQuestions = detailedResults.length;
    final correctAnswers = detailedResults.where((result) => result['isCorrect'] == true).length;
    final score = widget.testResult['score'] ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: Text('Detailed Solutions'),
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
      body: Column(
        children: [
          // Score Summary Card
          Container(
            width: double.infinity,
            margin: EdgeInsets.all(16),
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue.shade50, Colors.blue.shade100],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
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
              children: [
                Text(
                  'Test Summary',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade800,
                  ),
                ),
                SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildSummaryItem('Score', '$score%', Colors.green),
                    _buildSummaryItem('Correct', '$correctAnswers/$totalQuestions', Colors.blue),
                    _buildSummaryItem('Time', _formatTime(widget.testResult['totalTime'] ?? 0), Colors.orange),
                  ],
                ),
              ],
            ),
          ),

          // Question Navigation
          Container(
            height: 60,
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: totalQuestions,
              itemBuilder: (context, index) {
                final result = detailedResults[index];
                final isCorrect = result['isCorrect'] == true;
                final isSelected = index == currentQuestionIndex;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      currentQuestionIndex = index;
                    });
                  },
                  child: Container(
                    width: 50,
                    height: 50,
                    margin: EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      color: isSelected 
                          ? Colors.blue 
                          : (isCorrect ? Colors.green : Colors.red),
                      borderRadius: BorderRadius.circular(25),
                      border: isSelected 
                          ? Border.all(color: Colors.blue.shade800, width: 3)
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Question Details
          Expanded(
            child: Container(
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
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question Header
                    Row(
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getSubjectColor(detailedResults[currentQuestionIndex]['subject']),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            detailedResults[currentQuestionIndex]['subject'].toString().toUpperCase(),
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        SizedBox(width: 8),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getDifficultyColor(detailedResults[currentQuestionIndex]['difficulty']),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            detailedResults[currentQuestionIndex]['difficulty'].toString().toUpperCase(),
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Spacer(),
                        Icon(
                          detailedResults[currentQuestionIndex]['isCorrect'] == true 
                              ? Icons.check_circle 
                              : Icons.cancel,
                          color: detailedResults[currentQuestionIndex]['isCorrect'] == true 
                              ? Colors.green 
                              : Colors.red,
                          size: 24,
                        ),
                      ],
                    ),
                    SizedBox(height: 16),

                    // Question Text
                    Text(
                      'Question ${currentQuestionIndex + 1}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      detailedResults[currentQuestionIndex]['questionText'] ?? 'Question text not available',
                      style: TextStyle(
                        fontSize: 16,
                        height: 1.5,
                      ),
                    ),
                    SizedBox(height: 24),

                    // Your Answer
                    _buildAnswerSection(
                      'Your Answer',
                      detailedResults[currentQuestionIndex]['selectedAnswer'],
                      Colors.red.shade100,
                      Colors.red.shade800,
                    ),
                    SizedBox(height: 16),

                    // Correct Answer
                    _buildAnswerSection(
                      'Correct Answer',
                      detailedResults[currentQuestionIndex]['correctAnswer'],
                      Colors.green.shade100,
                      Colors.green.shade800,
                    ),
                    SizedBox(height: 24),

                    // Explanation
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue.shade200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.lightbulb_outline, color: Colors.blue.shade700),
                              SizedBox(width: 8),
                              Text(
                                'Explanation',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue.shade700,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 12),
                          Text(
                            detailedResults[currentQuestionIndex]['explanation'] ?? 'No explanation available',
                            style: TextStyle(
                              fontSize: 14,
                              height: 1.5,
                              color: Colors.blue.shade800,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 24),

                    // Tips
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.orange.shade200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.tips_and_updates, color: Colors.orange.shade700),
                              SizedBox(width: 8),
                              Text(
                                'Study Tip',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.orange.shade700,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 12),
                          Text(
                            _getStudyTip(detailedResults[currentQuestionIndex]['subject'], detailedResults[currentQuestionIndex]['difficulty']),
                            style: TextStyle(
                              fontSize: 14,
                              height: 1.5,
                              color: Colors.orange.shade800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 5,
            ),
          ],
        ),
        child: Row(
          children: [
            if (currentQuestionIndex > 0)
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      currentQuestionIndex--;
                    });
                  },
                  icon: Icon(Icons.arrow_back),
                  label: Text('Previous'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey.shade300,
                    foregroundColor: Colors.grey.shade700,
                  ),
                ),
              ),
            if (currentQuestionIndex > 0) SizedBox(width: 16),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  if (currentQuestionIndex < totalQuestions - 1) {
                    setState(() {
                      currentQuestionIndex++;
                    });
                  } else {
                    // Navigate back to dashboard or show completion
                    Navigator.pop(context);
                  }
                },
                icon: Icon(currentQuestionIndex < totalQuestions - 1 ? Icons.arrow_forward : Icons.home),
                label: Text(currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildAnswerSection(String title, String answer, Color bgColor, Color textColor) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: textColor.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            answer,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  Color _getSubjectColor(String subject) {
    switch (subject.toLowerCase()) {
      case 'civil-engineering':
        return Colors.blue;
      case 'mechanical-engineering':
        return Colors.orange;
      case 'electrical-engineering':
        return Colors.purple;
      default:
        return Colors.grey;
    }
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

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes}m ${remainingSeconds}s';
  }

  String _getStudyTip(String subject, String difficulty) {
    if (subject.toLowerCase() == 'civil-engineering') {
      return 'Focus on understanding the fundamental properties and applications of building materials. Practice with real-world examples to strengthen your conceptual understanding.';
    }
    return 'Review the basic concepts and practice similar questions to improve your understanding of this topic.';
  }
} 