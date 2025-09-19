import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isConnected = false;
  bool _checkingConnection = true;

  @override
  void initState() {
    super.initState();
    _checkConnection();
  }

  Future<void> _checkConnection() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final isConnected = await apiService.checkHealth();
    setState(() {
      _isConnected = isConnected;
      _checkingConnection = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PrepLens Admin'),
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
                // Connection Status Card
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(20.w),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12.r),
                      gradient: LinearGradient(
                        colors: _isConnected 
                            ? [Colors.green[400]!, Colors.green[600]!]
                            : [Colors.red[400]!, Colors.red[600]!],
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _isConnected ? Icons.cloud_done : Icons.cloud_off,
                          size: 48.sp,
                          color: Colors.white,
                        ),
                        SizedBox(height: 12.h),
                        Text(
                          _checkingConnection 
                              ? 'Checking Connection...'
                              : _isConnected 
                                  ? 'Connected to Server'
                                  : 'Server Offline',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 8.h),
                        Text(
                          _isConnected 
                              ? 'https://admindashboard-x0hk.onrender.com'
                              : 'Unable to connect to backend server',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12.sp,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        if (!_checkingConnection)
                          Padding(
                            padding: EdgeInsets.only(top: 12.h),
                            child: ElevatedButton.icon(
                              onPressed: _checkConnection,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Retry'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: _isConnected 
                                    ? Colors.green[600] 
                                    : Colors.red[600],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                
                SizedBox(height: 30.h),
                
                // Quick Stats
                Text(
                  'Quick Stats',
                  style: TextStyle(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                
                SizedBox(height: 16.h),
                
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Questions',
                        '575',
                        Icons.quiz,
                        Colors.blue,
                      ),
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: _buildStatCard(
                        'Published',
                        '151',
                        Icons.published_with_changes,
                        Colors.green,
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: 16.h),
                
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Draft',
                        '418',
                        Icons.edit,
                        Colors.orange,
                      ),
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: _buildStatCard(
                        'Users',
                        'Active',
                        Icons.people,
                        Colors.purple,
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: 40.h),
                
                // Action Buttons
                Text(
                  'Quick Actions',
                  style: TextStyle(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                
                SizedBox(height: 20.h),
                
                _buildActionButton(
                  'Upload New Question',
                  'Create and upload a new question',
                  Icons.add_circle,
                  Colors.blue,
                  () => Navigator.pushNamed(context, '/upload'),
                ),
                
                SizedBox(height: 16.h),
                
                _buildActionButton(
                  'View All Questions',
                  'Browse and manage existing questions',
                  Icons.list,
                  Colors.green,
                  () => Navigator.pushNamed(context, '/questions'),
                ),
                
                SizedBox(height: 16.h),
                
                _buildActionButton(
                  'Bulk Upload',
                  'Upload multiple questions via CSV',
                  Icons.upload_file,
                  Colors.orange,
                  () => _showBulkUploadDialog(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          children: [
            Icon(icon, size: 32.sp, color: color),
            SizedBox(height: 8.h),
            Text(
              value,
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: TextStyle(
                fontSize: 12.sp,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16.sp,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 12.sp,
            color: Colors.grey[600],
          ),
        ),
        trailing: Icon(Icons.arrow_forward_ios, size: 16.sp),
        onTap: onTap,
      ),
    );
  }

  void _showBulkUploadDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bulk Upload'),
        content: const Text(
          'Bulk upload feature will be available soon. '
          'For now, you can upload questions one by one.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}