# Flutter User APIs - Complete Guide

## 🚀 **Base URL**
```
https://admindashboard-x0hk.onrender.com
```

## 📱 **API Endpoints Summary**

### **🔐 Authentication**
- `POST /users/register` - User registration
- `POST /users/login` - User login  
- `POST /users/forgot-password` - Forgot password
- `POST /users/reset-password` - Reset password

### **👤 User Profile**
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `PUT /users/change-password` - Change password

### **💎 Premium Features**
- `POST /users/purchase-premium` - Buy PrepLens+

### **📊 Analytics**
- `GET /users/stats` - Get user statistics
- `GET /users/referrals` - Get referral stats

### **📝 Test Sessions**
- `POST /users/test-session/start` - Start test
- `POST /users/test-session/{id}/answer` - Submit answer
- `POST /users/test-session/{id}/complete` - Complete test
- `GET /users/test-history` - Get test history

### **🗑️ Account**
- `DELETE /users/account` - Delete account

## 🎯 **Key Features Implemented**

✅ **User Registration & Login**  
✅ **Exam Selection** (RRB JE, SSC JE, etc.)  
✅ **Language Support** (English/Hindi)  
✅ **Premium Subscription** (₹299)  
✅ **Practice Tests** (Free)  
✅ **Section Tests** (Premium)  
✅ **Mock Tests** (Premium)  
✅ **Test Series** (Premium)  
✅ **Live Tests** (Premium)  
✅ **Progress Tracking**  
✅ **Performance Analytics**  
✅ **Referral System** (10% commission)  
✅ **Earn While You Learn**  

## 🔧 **Flutter Implementation**

### **Dependencies**
```yaml
dependencies:
  http: ^1.1.0
  shared_preferences: ^2.2.2
  json_annotation: ^4.8.1
```

### **User Registration Example**
```dart
final result = await UserApiService.register(
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  exam: 'ssc-je',
  language: 'english',
);
```

### **User Login Example**
```dart
final result = await UserApiService.login(
  email: 'john@example.com',
  password: 'password123',
);
```

### **Start Practice Test**
```dart
final result = await UserApiService.startTestSession(
  testType: 'practice',
  subject: 'civil-engineering',
  level: 'basic',
);
```

### **Purchase Premium**
```dart
final result = await UserApiService.purchasePremium(
  paymentMethod: 'razorpay',
  transactionId: 'txn_123456789',
);
```

## 🎯 **Available Exams**
- `rrb-je` - RRB Junior Engineer
- `rrb-alp` - RRB Assistant Loco Pilot  
- `rrb-technician` - RRB Technician
- `rrb-ntpc` - RRB NTPC
- `ssc-cgl` - SSC CGL
- `ssc-chsl` - SSC CHSL
- `ssc-je` - SSC Junior Engineer

## 🎯 **Test Types**
- `practice` - Practice Questions (Free)
- `section-test` - Section Tests (Premium)
- `mock-test` - Mock Tests (Premium)
- `test-series` - Test Series (Premium)
- `live-test` - Live Tests (Premium)

## 🎯 **Difficulty Levels**
- `basic` - Basic Level
- `intermediate` - Intermediate Level
- `advanced` - Advanced Level
- `expert` - Expert Level

## 🎯 **Languages**
- `english` - English
- `hindi` - Hindi

## 📊 **User Stats Tracking**
- Total questions attempted
- Correct answers
- Time spent
- Average accuracy
- Test completion rate
- Subject-wise progress
- Topic-wise performance

## 💰 **Monetization Features**
- **Premium Price**: ₹299 per exam
- **Referral Commission**: 10% of friend's purchase
- **UPI Payouts**: Direct earnings transfer
- **Earnings Dashboard**: Track referrals and earnings

## 🔒 **Premium Content Gates**
- Practice: 1 Basic Level (Free)
- Section Tests: 1 Basic Level (Free)
- Mock Tests: 1 Basic Test (Free)
- Test Series: 1 Test (Free)
- Live Tests: 1 Test (Free)
- **All other content requires PrepLens+**

## 📱 **App Flow**
1. **Onboarding**: Register → Select Exam → Dashboard
2. **Free Trial**: Try basic tests → See analysis → Upsell
3. **Premium**: Purchase → Unlock all content
4. **Practice**: Questions → Instant feedback → Solutions
5. **Tests**: Timed tests → Results → Analytics
6. **Referrals**: Share code → Earn commission

## 🚀 **Ready to Implement!**

Your backend now supports:
- ✅ Complete user authentication
- ✅ Premium subscription system
- ✅ Test session management
- ✅ Progress tracking
- ✅ Referral system
- ✅ Performance analytics
- ✅ Multi-language support
- ✅ Exam-specific content

**Next Steps:**
1. Add the user APIs to your backend
2. Implement the Flutter service
3. Build the UI components
4. Test the complete flow
5. Deploy and launch! 🎉

Your EdTech platform is ready to dominate government job exams! 🚀 