import 'package:flutter/material.dart';
import 'screens/otp_login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/diagnostic_test_screen.dart';
import 'screens/test_result_screen.dart';
import 'screens/badges_screen.dart';
import 'screens/detailed_solution_screen.dart';
import 'services/test_prep_api_service.dart';

void main() {
  runApp(TestPrepApp());
}

class TestPrepApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Test Prep App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            padding: EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          ),
        ),
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => OTPLoginScreen(),
        '/dashboard': (context) => DashboardScreen(),
        '/diagnostic-test': (context) => DiagnosticTestScreen(),
        '/badges': (context) => BadgesScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/test-result') {
          final result = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(
            builder: (context) => TestResultScreen(result: result),
          );
        }
        if (settings.name == '/detailed-solution') {
          final testResult = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(
            builder: (context) => DetailedSolutionScreen(testResult: testResult),
          );
        }
        return null;
      },
    );
  }
} 