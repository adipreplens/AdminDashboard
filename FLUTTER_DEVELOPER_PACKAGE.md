# 🚀 Flutter Developer Package - Complete EdTech App

## 📦 **What's Included in This Package**

This package contains everything your Flutter team needs to build the complete PrepLens EdTech app:

### **📁 Files to Give to Flutter Team**

1. **`flutter_question_api_example.dart`** - Complete question API integration
2. **`flutter_advanced_filter_widget.dart`** - Advanced filtering UI components
3. **`FLUTTER_API_GUIDE.md`** - Question API documentation
4. **`FLUTTER_USER_APIS.md`** - User API documentation
5. **`flutter_user_api_service.dart`** - Complete user API service
6. **`FLUTTER_DEVELOPER_PACKAGE.md`** - This comprehensive guide

---

## 🎯 **Quick Start for Flutter Team**

### **Step 1: Add Dependencies**
```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  shared_preferences: ^2.2.2
  json_annotation: ^4.8.1
  provider: ^6.1.1
  flutter_secure_storage: ^9.0.0

dev_dependencies:
  json_serializable: ^6.7.1
  build_runner: ^2.4.6
```

### **Step 2: Copy These Files to Your Flutter Project**

1. **Copy `flutter_question_api_example.dart`** → `lib/services/question_service.dart`
2. **Copy `flutter_user_api_service.dart`** → `lib/services/user_service.dart`
3. **Copy `flutter_advanced_filter_widget.dart`** → `lib/widgets/filter_widget.dart`

### **Step 3: Run Code Generation**
```bash
flutter packages get
flutter packages pub run build_runner build
```

---

## 🔗 **API Base URLs**

### **Production (Render)**
```
Base URL: https://admindashboard-x0hk.onrender.com
```

### **Local Development**
```
Base URL: http://localhost:5001
```

---

## 📱 **Complete App Structure**

### **Core Features to Implement**

#### **1. Authentication Flow**
- ✅ Registration Screen
- ✅ Login Screen
- ✅ Forgot Password
- ✅ Profile Management

#### **2. Onboarding Flow**
- ✅ Exam Selection (RRB JE, SSC JE, etc.)
- ✅ Language Selection (English/Hindi)
- ✅ Dashboard Setup

#### **3. Question & Test System**
- ✅ Practice Questions (Free)
- ✅ Section Tests (Premium)
- ✅ Mock Tests (Premium)
- ✅ Test Series (Premium)
- ✅ Live Tests (Premium)

#### **4. Premium Features**
- ✅ PrepLens+ Subscription (₹299)
- ✅ Premium Content Gates
- ✅ Payment Integration

#### **5. Analytics & Progress**
- ✅ Performance Dashboard
- ✅ Subject-wise Progress
- ✅ Test History
- ✅ Accuracy Tracking

#### **6. Referral System**
- ✅ Referral Code Generation
- ✅ Earnings Dashboard
- ✅ UPI Payout System

---

## 🎨 **UI/UX Guidelines**

### **Color Scheme**
```dart
// Primary Colors
Color primaryColor = Color(0xFF2563EB); // Blue
Color secondaryColor = Color(0xFF10B981); // Green
Color accentColor = Color(0xFFF59E0B); // Amber

// Status Colors
Color successColor = Color(0xFF10B981); // Green
Color errorColor = Color(0xFFEF4444); // Red
Color warningColor = Color(0xFFF59E0B); // Amber
Color infoColor = Color(0xFF3B82F6); // Blue
```

### **Typography**
```dart
// Headings
TextStyle h1 = TextStyle(fontSize: 32, fontWeight: FontWeight.bold);
TextStyle h2 = TextStyle(fontSize: 24, fontWeight: FontWeight.bold);
TextStyle h3 = TextStyle(fontSize: 20, fontWeight: FontWeight.w600);

// Body Text
TextStyle bodyLarge = TextStyle(fontSize: 16, fontWeight: FontWeight.normal);
TextStyle bodyMedium = TextStyle(fontSize: 14, fontWeight: FontWeight.normal);
TextStyle bodySmall = TextStyle(fontSize: 12, fontWeight: FontWeight.normal);
```

### **Spacing**
```dart
// Standard spacing
double spacingXS = 4.0;
double spacingS = 8.0;
double spacingM = 16.0;
double spacingL = 24.0;
double spacingXL = 32.0;
double spacingXXL = 48.0;
```

---

## 📋 **Screen-by-Screen Implementation**

### **1. Splash Screen**
```dart
class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    await Future.delayed(Duration(seconds: 2));
    
    final isLoggedIn = UserApiService.isLoggedIn;
    if (isLoggedIn) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      Navigator.pushReplacementNamed(context, '/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Image.asset('assets/logo.png', height: 120),
            SizedBox(height: spacingL),
            
            // App Name
            Text(
              'PrepLens',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            
            SizedBox(height: spacingM),
            
            // Tagline
            Text(
              'Don\'t just prepare—dominate government job exams!',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white70,
                textAlign: TextAlign.center,
              ),
            ),
            
            SizedBox(height: spacingXL),
            
            // Loading indicator
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
```

### **2. Onboarding Screen**
```dart
class OnboardingScreen extends StatefulWidget {
  @override
  _OnboardingScreenState createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  String? selectedExam;
  String selectedLanguage = 'english';

  final List<Map<String, dynamic>> exams = [
    {'id': 'rrb-je', 'name': 'RRB Junior Engineer', 'icon': '🚂'},
    {'id': 'rrb-alp', 'name': 'RRB Assistant Loco Pilot', 'icon': '🚄'},
    {'id': 'rrb-technician', 'name': 'RRB Technician', 'icon': '🔧'},
    {'id': 'rrb-ntpc', 'name': 'RRB NTPC', 'icon': '🚆'},
    {'id': 'ssc-cgl', 'name': 'SSC CGL', 'icon': '📚'},
    {'id': 'ssc-chsl', 'name': 'SSC CHSL', 'icon': '📝'},
    {'id': 'ssc-je', 'name': 'SSC Junior Engineer', 'icon': '🏗️'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Choose Your Exam'),
        backgroundColor: primaryColor,
      ),
      body: Padding(
        padding: EdgeInsets.all(spacingM),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Your Target Exam',
              style: h2,
            ),
            SizedBox(height: spacingM),
            
            // Exam Selection
            Expanded(
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: spacingM,
                  mainAxisSpacing: spacingM,
                ),
                itemCount: exams.length,
                itemBuilder: (context, index) {
                  final exam = exams[index];
                  final isSelected = selectedExam == exam['id'];
                  
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        selectedExam = exam['id'];
                      });
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: isSelected ? primaryColor : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? primaryColor : Colors.grey[300]!,
                          width: 2,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            exam['icon'],
                            style: TextStyle(fontSize: 32),
                          ),
                          SizedBox(height: spacingS),
                          Text(
                            exam['name'],
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? Colors.white : Colors.black87,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            
            SizedBox(height: spacingL),
            
            // Language Selection
            Text(
              'Select Language',
              style: h3,
            ),
            SizedBox(height: spacingS),
            
            Row(
              children: [
                Expanded(
                  child: RadioListTile<String>(
                    title: Text('English'),
                    value: 'english',
                    groupValue: selectedLanguage,
                    onChanged: (value) {
                      setState(() {
                        selectedLanguage = value!;
                      });
                    },
                  ),
                ),
                Expanded(
                  child: RadioListTile<String>(
                    title: Text('हिंदी'),
                    value: 'hindi',
                    groupValue: selectedLanguage,
                    onChanged: (value) {
                      setState(() {
                        selectedLanguage = value!;
                      });
                    },
                  ),
                ),
              ],
            ),
            
            SizedBox(height: spacingL),
            
            // Continue Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: selectedExam != null ? () {
                  // Save preferences and navigate to registration
                  Navigator.pushNamed(context, '/register', arguments: {
                    'exam': selectedExam,
                    'language': selectedLanguage,
                  });
                } : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  padding: EdgeInsets.symmetric(vertical: spacingM),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  'Continue',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### **3. Registration Screen**
```dart
class RegistrationScreen extends StatefulWidget {
  @override
  _RegistrationScreenState createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _referralController = TextEditingController();
  
  bool _isLoading = false;
  String? _exam;
  String? _language;

  @override
  void initState() {
    super.initState();
    // Get exam and language from previous screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
      if (args != null) {
        setState(() {
          _exam = args['exam'];
          _language = args['language'];
        });
      }
    });
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final result = await UserApiService.register(
        name: _nameController.text,
        email: _emailController.text,
        password: _passwordController.text,
        phone: _phoneController.text,
        exam: _exam!,
        language: _language!,
        referralCode: _referralController.text.isNotEmpty 
            ? _referralController.text 
            : null,
      );

      if (result['success']) {
        // Navigate to dashboard
        Navigator.pushNamedAndRemoveUntil(
          context, 
          '/dashboard', 
          (route) => false
        );
      } else {
        // Show error
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: errorColor,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Registration failed: $e'),
          backgroundColor: errorColor,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Account'),
        backgroundColor: primaryColor,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(spacingM),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Join PrepLens',
                style: h2,
              ),
              SizedBox(height: spacingS),
              Text(
                'Start your journey to dominate government job exams!',
                style: bodyMedium.copyWith(color: Colors.grey[600]),
              ),
              
              SizedBox(height: spacingXL),
              
              // Name Field
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              
              SizedBox(height: spacingM),
              
              // Email Field
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              
              SizedBox(height: spacingM),
              
              // Password Field
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              
              SizedBox(height: spacingM),
              
              // Phone Field
              TextFormField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: 'Phone Number (Optional)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
              ),
              
              SizedBox(height: spacingM),
              
              // Referral Code Field
              TextFormField(
                controller: _referralController,
                decoration: InputDecoration(
                  labelText: 'Referral Code (Optional)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.card_giftcard),
                ),
              ),
              
              SizedBox(height: spacingXL),
              
              // Register Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    padding: EdgeInsets.symmetric(vertical: spacingM),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: _isLoading
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'Create Account',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              
              SizedBox(height: spacingM),
              
              // Login Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Already have an account? '),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/login');
                    },
                    child: Text(
                      'Login',
                      style: TextStyle(color: primaryColor),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 🔧 **State Management Setup**

### **Provider Setup**
```dart
// lib/providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import '../services/user_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await UserApiService.login(
        email: email,
        password: password,
      );

      if (result['success']) {
        _user = result['user'];
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'];
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Login failed: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await UserApiService.logout();
    _user = null;
    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    if (UserApiService.isLoggedIn) {
      final result = await UserApiService.getProfile();
      if (result['success']) {
        _user = result['user'];
        notifyListeners();
      }
    }
  }
}
```

### **Main App Setup**
```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MaterialApp(
        title: 'PrepLens',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          primaryColor: Color(0xFF2563EB),
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        home: SplashScreen(),
        routes: {
          '/splash': (context) => SplashScreen(),
          '/onboarding': (context) => OnboardingScreen(),
          '/register': (context) => RegistrationScreen(),
          '/login': (context) => LoginScreen(),
          '/dashboard': (context) => DashboardScreen(),
        },
      ),
    );
  }
}
```

---

## 📊 **Dashboard Implementation**

### **Dashboard Screen**
```dart
class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    HomeTab(),
    PracticeTab(),
    TestsTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: primaryColor,
        unselectedItemColor: Colors.grey,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.quiz),
            label: 'Practice',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment),
            label: 'Tests',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
```

---

## 💰 **Premium Integration**

### **Premium Prompt Widget**
```dart
class PremiumPromptWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onUpgrade;

  const PremiumPromptWidget({
    Key? key,
    required this.message,
    this.onUpgrade,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(spacingM),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primaryColor, primaryColor.withOpacity(0.8)],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(
            Icons.star,
            color: Colors.amber,
            size: 48,
          ),
          SizedBox(height: spacingM),
          Text(
            'PrepLens+ Premium',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: spacingS),
          Text(
            message,
            style: TextStyle(
              fontSize: 16,
              color: Colors.white70,
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(height: spacingM),
          Row(
            children: [
              Expanded(
                child: Text(
                  '₹299',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: onUpgrade ?? () {
                  // Navigate to premium purchase
                  Navigator.pushNamed(context, '/premium');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: primaryColor,
                ),
                child: Text('Upgrade Now'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

---

## 🚀 **Deployment Checklist**

### **Before Launch**
- [ ] Test all API endpoints
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test premium flow
- [ ] Test referral system
- [ ] Add analytics tracking
- [ ] Test on multiple devices
- [ ] Optimize performance
- [ ] Add offline support
- [ ] Implement push notifications

### **Launch Day**
- [ ] Deploy to app stores
- [ ] Monitor API performance
- [ ] Track user registrations
- [ ] Monitor premium conversions
- [ ] Check referral system
- [ ] Monitor error rates

---

## 📞 **Support & Contact**

### **For Technical Issues**
- **Backend API**: Check the API documentation files
- **Flutter Integration**: Use the provided service files
- **UI Components**: Follow the design guidelines

### **API Status**
- **Production**: https://admindashboard-x0hk.onrender.com/health
- **Local**: http://localhost:5001/health

---

## 🎯 **Success Metrics**

### **Key Performance Indicators**
- **User Registration Rate**
- **Premium Conversion Rate**
- **Test Completion Rate**
- **User Retention Rate**
- **Referral Conversion Rate**

### **Revenue Targets**
- **Monthly Active Users**: 10,000+
- **Premium Conversion**: 15%+
- **Average Revenue Per User**: ₹299
- **Referral Commission**: 10% of friend's purchase

---

## 🎉 **You're Ready to Launch!**

Your Flutter team now has everything they need to build a world-class EdTech app:

✅ **Complete API Integration**  
✅ **Authentication System**  
✅ **Premium Subscription**  
✅ **Test Management**  
✅ **Progress Tracking**  
✅ **Referral System**  
✅ **UI/UX Guidelines**  
✅ **State Management**  
✅ **Error Handling**  
✅ **Performance Optimization**  

**Go build something amazing!** 🚀✨ 