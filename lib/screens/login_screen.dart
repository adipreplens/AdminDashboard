import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isOTPSent = false;
  String _enteredOTP = '';

  @override
  void initState() {
    super.initState();
    // Check if user is already logged in
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuthStatus();
    });
  }

  Future<void> _checkAuthStatus() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final isLoggedIn = await authService.checkAuthStatus();
    if (isLoggedIn && mounted) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    }
  }

  Future<void> _sendOTP() async {
    if (!_formKey.currentState!.validate()) return;

    final authService = Provider.of<AuthService>(context, listen: false);
    final success = await authService.sendOTP(_phoneController.text);
    
    if (success && mounted) {
      setState(() {
        _isOTPSent = true;
      });
    }
  }

  Future<void> _verifyOTP() async {
    if (_enteredOTP.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter 6-digit OTP')),
      );
      return;
    }

    final authService = Provider.of<AuthService>(context, listen: false);
    final success = await authService.verifyOTP(_phoneController.text, _enteredOTP);
    
    if (success && mounted) {
      Navigator.pushReplacementNamed(context, '/exam-selection');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue[600]!,
              Colors.blue[400]!,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.all(24.w),
            child: Column(
              children: [
                SizedBox(height: 60.h),
                
                // Logo and Title
                Container(
                  padding: EdgeInsets.all(20.w),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.school,
                        size: 80.sp,
                        color: Colors.white,
                      ),
                      SizedBox(height: 16.h),
                      Text(
                        'PrepLens',
                        style: TextStyle(
                          fontSize: 32.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        'AI-Powered Learning Platform',
                        style: TextStyle(
                          fontSize: 16.sp,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                
                SizedBox(height: 60.h),
                
                // Login Form
                Container(
                  padding: EdgeInsets.all(24.w),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20.r),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isOTPSent ? 'Enter OTP' : 'Enter Mobile Number',
                          style: TextStyle(
                            fontSize: 24.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        
                        SizedBox(height: 8.h),
                        
                        Text(
                          _isOTPSent 
                              ? 'We sent a 6-digit code to ${_phoneController.text}'
                              : 'We\'ll send you a verification code',
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: Colors.grey[600],
                          ),
                        ),
                        
                        SizedBox(height: 32.h),
                        
                        if (!_isOTPSent) ...[
                          TextFormField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            decoration: InputDecoration(
                              labelText: 'Mobile Number',
                              hintText: '+91 9876543210',
                              prefixIcon: const Icon(Icons.phone),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.r),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter mobile number';
                              }
                              if (value.length < 10) {
                                return 'Please enter valid mobile number';
                              }
                              return null;
                            },
                          ),
                        ] else ...[
                          PinCodeTextField(
                            appContext: context,
                            length: 6,
                            onChanged: (value) {
                              _enteredOTP = value;
                            },
                            onCompleted: (value) {
                              _enteredOTP = value;
                            },
                            pinTheme: PinTheme(
                              shape: PinCodeFieldShape.box,
                              borderRadius: BorderRadius.circular(8.r),
                              fieldHeight: 50.h,
                              fieldWidth: 45.w,
                              activeFillColor: Colors.blue[50],
                              inactiveFillColor: Colors.grey[100],
                              selectedFillColor: Colors.blue[100],
                              activeColor: Colors.blue,
                              inactiveColor: Colors.grey,
                              selectedColor: Colors.blue,
                            ),
                            enableActiveFill: true,
                            keyboardType: TextInputType.number,
                          ),
                        ],
                        
                        SizedBox(height: 32.h),
                        
                        Consumer<AuthService>(
                          builder: (context, authService, child) {
                            return SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: authService.isLoading 
                                    ? null 
                                    : _isOTPSent ? _verifyOTP : _sendOTP,
                                child: authService.isLoading
                                    ? SizedBox(
                                        height: 20.h,
                                        width: 20.w,
                                        child: const CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                        ),
                                      )
                                    : Text(
                                        _isOTPSent ? 'Verify OTP' : 'Send OTP',
                                        style: TextStyle(fontSize: 16.sp),
                                      ),
                              ),
                            );
                          },
                        ),
                        
                        if (_isOTPSent) ...[
                          SizedBox(height: 16.h),
                          Center(
                            child: TextButton(
                              onPressed: () {
                                setState(() {
                                  _isOTPSent = false;
                                  _enteredOTP = '';
                                });
                              },
                              child: Text(
                                'Change Number',
                                style: TextStyle(
                                  color: Colors.blue[600],
                                  fontSize: 14.sp,
                                ),
                              ),
                            ),
                          ),
                        ],
                        
                                              Consumer<AuthService>(
                        builder: (context, authService, child) {
                          if (authService.error != null) {
                            return Container(
                              margin: EdgeInsets.only(top: 16.h),
                              padding: EdgeInsets.all(12.w),
                              decoration: BoxDecoration(
                                color: Colors.red[50],
                                borderRadius: BorderRadius.circular(8.r),
                                border: Border.all(color: Colors.red[200]!),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.error, color: Colors.red[600], size: 20.sp),
                                  SizedBox(width: 8.w),
                                  Expanded(
                                    child: Text(
                                      authService.error!,
                                      style: TextStyle(
                                        color: Colors.red[600],
                                        fontSize: 12.sp,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                      ],
                    ),
                  ),
                ),
                
                const Spacer(),
                
                // Footer
                Text(
                  'By continuing, you agree to our Terms of Service and Privacy Policy',
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: Colors.white70,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }
}