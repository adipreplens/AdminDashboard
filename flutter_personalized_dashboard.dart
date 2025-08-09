import 'package:flutter/material.dart';
import 'flutter_onboarding_service.dart';

// Personalized Dashboard Widget
class PersonalizedDashboardWidget extends StatefulWidget {
  @override
  _PersonalizedDashboardWidgetState createState() => _PersonalizedDashboardWidgetState();
}

class _PersonalizedDashboardWidgetState extends State<PersonalizedDashboardWidget> {
  bool _isLoading = false;
  DashboardData? _dashboardData;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await OnboardingService.getDashboardData();
      setState(() {
        _dashboardData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildErrorWidget()
              : _dashboardData != null
                  ? _buildDashboard()
                  : _buildNoOnboardingWidget(),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.red),
          SizedBox(height: 16),
          Text(
            'Error loading dashboard',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Text(_error!, style: TextStyle(color: Colors.grey[600])),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadDashboardData,
            child: Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildNoOnboardingWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.school, size: 64, color: Colors.blue),
          SizedBox(height: 16),
          Text(
            'Complete Your Profile',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Text(
            'Set up your exam preferences to get personalized recommendations',
            style: TextStyle(color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              // Navigate to onboarding
              // Navigator.pushNamed(context, '/onboarding');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              padding: EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            ),
            child: Text(
              'Start Onboarding',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboard() {
    final data = _dashboardData!;
    
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          _buildHeader(data),
          SizedBox(height: 24),
          
          // Progress Overview
          _buildProgressOverview(data),
          SizedBox(height: 24),
          
          // Current Phase
          _buildCurrentPhase(data),
          SizedBox(height: 24),
          
          // Stats Cards
          _buildStatsCards(data),
          SizedBox(height: 24),
          
          // Roadmap
          _buildRoadmap(data),
          SizedBox(height: 24),
          
          // Recommendations
          _buildRecommendations(data),
        ],
      ),
    );
  }

  Widget _buildHeader(DashboardData data) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue, Colors.blue.shade700],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.school, color: Colors.white, size: 32),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back!',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      data.exam.name,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Target Date',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    Text(
                      '${data.exam.targetDate.day}/${data.exam.targetDate.month}/${data.exam.targetDate.year}',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Days Remaining',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    Text(
                      '${data.progress.daysRemaining}',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressOverview(DashboardData data) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Overall Progress',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            LinearProgressIndicator(
              value: data.progress.overall / 100,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
              minHeight: 8,
            ),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${data.progress.overall.toStringAsFixed(1)}% Complete',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  '${data.progress.daysElapsed} days elapsed',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentPhase(DashboardData data) {
    final currentPhaseData = data.roadmap[data.progress.currentPhase];
    
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.timeline, color: Colors.blue),
                SizedBox(width: 8),
                Text(
                  'Current Phase',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 16),
            Text(
              currentPhaseData['name'] ?? 'Unknown Phase',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 8),
            LinearProgressIndicator(
              value: data.progress.phaseProgress / 100,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
              minHeight: 6,
            ),
            SizedBox(height: 8),
            Text(
              '${data.progress.phaseProgress.toStringAsFixed(1)}% Complete',
              style: TextStyle(color: Colors.grey[600]),
            ),
            SizedBox(height: 12),
            if (currentPhaseData['focus'] != null)
              Wrap(
                spacing: 8,
                children: (currentPhaseData['focus'] as List)
                    .map((focus) => Chip(
                          label: Text(focus),
                          backgroundColor: Colors.blue.withOpacity(0.1),
                        ))
                    .toList(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards(DashboardData data) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Tests Taken',
            '${data.stats.totalTests}',
            Icons.assignment,
            Colors.blue,
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Average Score',
            '${data.stats.averageScore.toStringAsFixed(1)}%',
            Icons.trending_up,
            Colors.green,
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Study Time',
            '${data.stats.studyTimePerDay}h/day',
            Icons.access_time,
            Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoadmap(DashboardData data) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.map, color: Colors.blue),
                SizedBox(width: 8),
                Text(
                  'Your Study Roadmap',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 16),
            ...['phase1', 'phase2', 'phase3', 'phase4'].map((phase) {
              final phaseData = data.roadmap[phase];
              final isCurrentPhase = data.progress.currentPhase == phase;
              final isCompleted = _isPhaseCompleted(data, phase);
              
              return Container(
                margin: EdgeInsets.only(bottom: 12),
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isCurrentPhase 
                      ? Colors.blue.withOpacity(0.1)
                      : isCompleted 
                          ? Colors.green.withOpacity(0.1)
                          : Colors.grey.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isCurrentPhase 
                        ? Colors.blue
                        : isCompleted 
                            ? Colors.green
                            : Colors.grey[300]!,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCurrentPhase 
                            ? Colors.blue
                            : isCompleted 
                                ? Colors.green
                                : Colors.grey,
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            phaseData['name'] ?? 'Unknown Phase',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isCurrentPhase ? Colors.blue : null,
                            ),
                          ),
                          Text(
                            '${phaseData['duration']} days • Target: ${phaseData['targetScore']}%',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isCurrentPhase)
                      Icon(Icons.play_arrow, color: Colors.blue, size: 20)
                    else if (isCompleted)
                      Icon(Icons.check_circle, color: Colors.green, size: 20),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendations(DashboardData data) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.lightbulb, color: Colors.orange),
                SizedBox(width: 8),
                Text(
                  'Today\'s Recommendations',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 16),
            ...data.recommendations.map((recommendation) => Container(
              margin: EdgeInsets.only(bottom: 8),
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.tips_and_updates, color: Colors.orange, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      recommendation,
                      style: TextStyle(fontSize: 14),
                    ),
                  ),
                ],
              ),
            )).toList(),
          ],
        ),
      ),
    );
  }

  bool _isPhaseCompleted(DashboardData data, String phase) {
    final phaseOrder = ['phase1', 'phase2', 'phase3', 'phase4'];
    final currentPhaseIndex = phaseOrder.indexOf(data.progress.currentPhase);
    final phaseIndex = phaseOrder.indexOf(phase);
    
    return phaseIndex < currentPhaseIndex;
  }
}

// Quick Actions Widget
class QuickActionsWidget extends StatelessWidget {
  final DashboardData dashboardData;

  const QuickActionsWidget({
    Key? key,
    required this.dashboardData,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    'Start Practice',
                    Icons.play_arrow,
                    Colors.blue,
                    () {
                      // Navigate to practice
                    },
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: _buildActionButton(
                    'Take Mock Test',
                    Icons.assignment,
                    Colors.green,
                    () {
                      // Navigate to mock test
                    },
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    'View Progress',
                    Icons.trending_up,
                    Colors.orange,
                    () {
                      // Navigate to progress
                    },
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: _buildActionButton(
                    'Study Plan',
                    Icons.schedule,
                    Colors.purple,
                    () {
                      // Navigate to study plan
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
} 