import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService extends ChangeNotifier {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  bool _isLoading = false;
  String? _error;
  String? _currentUser;
  String? _authToken;

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get currentUser => _currentUser;
  String? get authToken => _authToken;
  bool get isLoggedIn => _authToken != null;

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set error state
  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  // Send OTP to phone number
  Future<bool> sendOTP(String phoneNumber) async {
    _setLoading(true);
    _setError(null);

    try {
      // For testing, always return success and show the test OTP
      await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
      
      Fluttertoast.showToast(
        msg: 'OTP sent to $phoneNumber\nTest OTP: 1234',
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
      _setLoading(false);
      return true;
    } catch (e) {
      _setError('Network error: $e');
      Fluttertoast.showToast(
        msg: 'Network error: $e',
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
      _setLoading(false);
      return false;
    }
  }

  // Verify OTP
  Future<bool> verifyOTP(String phoneNumber, String otp) async {
    _setLoading(true);
    _setError(null);

    try {
      // For testing, accept OTP "1234"
      if (otp == '1234') {
        // Simulate successful verification
        await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
        
        _authToken = 'test_token_${DateTime.now().millisecondsSinceEpoch}';
        _currentUser = phoneNumber;
        
        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _authToken!);
        await prefs.setString('current_user', _currentUser!);
        
        Fluttertoast.showToast(
          msg: 'Login successful!',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        _setLoading(false);
        return true;
      } else {
        _setError('Invalid OTP. Please enter 1234');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      Fluttertoast.showToast(
        msg: 'Network error: $e',
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
      _setLoading(false);
      return false;
    }
  }

  // Check if user is already logged in
  Future<bool> checkAuthStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _authToken = prefs.getString('auth_token');
      _currentUser = prefs.getString('current_user');
      
      if (_authToken != null && _currentUser != null) {
        // Verify token is still valid
        final response = await http.get(
          Uri.parse('$baseUrl/api/v1/users/profile'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_authToken',
          },
        );
        
        if (response.statusCode == 200) {
          notifyListeners();
          return true;
        } else {
          // Token is invalid, clear it
          await logout();
          return false;
        }
      }
      return false;
    } catch (e) {
      print('Auth check error: $e');
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    _authToken = null;
    _currentUser = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('current_user');
    
    notifyListeners();
    
    Fluttertoast.showToast(
      msg: 'Logged out successfully',
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  // Get user profile
  Future<Map<String, dynamic>?> getUserProfile() async {
    if (_authToken == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/users/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_authToken',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['user'];
      } else {
        print('Failed to get user profile: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Get user profile error: $e');
      return null;
    }
  }
}