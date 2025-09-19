# 📡 Complete API Endpoints List

## 🔐 **Authentication Endpoints**

### POST /auth/login
**Description**: User login
**Request**:
```json
{
  "email": "admin@preplens.com",
  "password": "admin123"
}
```
**Response**:
```json
{
  "message": "Login successful",
  "token": "demo-token-1756019561714",
  "user": {
    "email": "admin@preplens.com",
    "role": "admin"
  }
}
```

### POST /auth/register
**Description**: User registration
**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## 👤 **User Management Endpoints**

### POST /api/v1/users/register
**Description**: New user registration
**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "exam": "rrb-je",
  "language": "english"
}
```

### POST /api/v1/users/login
**Description**: New user login
**Request**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /api/v1/users/profile
**Description**: Get user profile
**Headers**: `Authorization: Bearer <token>`

### PUT /api/v1/users/profile
**Description**: Update user profile
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "language": "hindi"
}
```

### PUT /api/v1/users/change-password
**Description**: Change password
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### GET /api/v1/users/dashboard
**Description**: Get user dashboard
**Headers**: `Authorization: Bearer <token>`

### GET /api/v1/users/stats
**Description**: Get user statistics
**Headers**: `Authorization: Bearer <token>`

## 📚 **Questions Endpoints**

### GET /questions/all
**Description**: Get all questions with filters
**Query Parameters**:
- `page` (int): Page number
- `limit` (int): Items per page
- `subject` (string): Filter by subject
- `exam` (string): Filter by exam
- `difficulty` (string): Filter by difficulty
- `level` (string): Filter by level
- `blooms` (string): Filter by blooms taxonomy

### GET /questions/module/:moduleType
**Description**: Get questions by module type
**Module Types**: `practice`, `section_test`, `mock_test`, `test_series`, `live_test`, `pyq`

### POST /questions
**Description**: Create new question
**Request**:
```json
{
  "text": "What is 2+2?",
  "options": ["3", "4", "5", "6"],
  "answer": "4",
  "subject": "Mathematics",
  "exam": "rrb-je",
  "difficulty": "easy",
  "level": "Level 1",
  "marks": 1,
  "timeLimit": 60,
  "blooms": "Remember",
  "moduleType": "practice",
  "isPremium": false,
  "language": "english"
}
```

### PUT /questions/:id
**Description**: Update question
**Request**: Same as POST /questions

### DELETE /questions/:id
**Description**: Delete question

### PUT /questions/:id/publish
**Description**: Publish question

## 🎯 **Topic-Based Questions Endpoints**

### GET /topics/exams
**Description**: Get all exams with topics

### GET /topics/:examId/subjects
**Description**: Get subjects for specific exam

### GET /topics/:examId/subjects/:subjectId/topics
**Description**: Get topics for specific subject

### GET /topics/:examId/questions
**Description**: Get questions by topic
**Query Parameters**:
- `subjectId` (string): Subject ID
- `topicId` (string): Topic ID

### GET /topics/:examId/count
**Description**: Get question count by topic

## 📊 **Subject-Based Test Endpoints**

### GET /subjects/:examId
**Description**: Get subjects for exam

### GET /subjects/:examId/:subjectId
**Description**: Get subject details

### POST /subjects/:examId/:subjectId/start
**Description**: Start subject test
**Headers**: `Authorization: Bearer <token>`

### POST /subjects/test/:sessionId/answer
**Description**: Submit answer
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "questionId": "question_id",
  "selectedAnswer": "A",
  "timeSpent": 30
}
```

### POST /subjects/test/:sessionId/complete
**Description**: Complete test
**Headers**: `Authorization: Bearer <token>`

### GET /subjects/:examId/:subjectId/history
**Description**: Get test history
**Headers**: `Authorization: Bearer <token>`

### GET /subjects/:examId/:subjectId/performance
**Description**: Get performance analysis
**Headers**: `Authorization: Bearer <token>`

## 🤖 **AI Recommendation Endpoints**

### GET /api/v1/users/ai/next-test
**Description**: Get next test recommendation
**Headers**: `Authorization: Bearer <token>`

### GET /api/v1/users/ai/study-plan
**Description**: Get study plan
**Headers**: `Authorization: Bearer <token>`

### GET /api/v1/users/ai/performance-analysis
**Description**: Get performance analysis
**Headers**: `Authorization: Bearer <token>`

### POST /api/v1/users/ai/smart-test-session/start
**Description**: Start smart test session
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "examId": "rrb-je",
  "subjectId": "math",
  "difficulty": "medium"
}
```

### POST /api/v1/users/ai/analyze-attempt
**Description**: Analyze test attempt
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "testSessionId": "session_id",
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": "A",
      "timeSpent": 30,
      "isCorrect": true
    }
  ]
}
```

### POST /api/v1/users/ai/tutor
**Description**: Get AI tutor help
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "questionId": "question_id",
  "userAnswer": "A",
  "isCorrect": false
}
```

### POST /api/v1/users/ai/weekly-plan
**Description**: Get weekly study plan
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "examId": "rrb-je",
  "currentWeek": 1
}
```

## 📱 **Onboarding Endpoints**

### GET /api/v1/users/onboarding/exams
**Description**: Get available exams

### POST /api/v1/users/onboarding/save
**Description**: Save onboarding data
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "exam": "rrb-je",
  "language": "english",
  "experience": "beginner"
}
```

### POST /api/v1/users/onboarding/complete
**Description**: Complete onboarding
**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "exam": "rrb-je",
  "language": "english",
  "experience": "beginner"
}
```

### GET /api/v1/users/onboarding/data
**Description**: Get onboarding data
**Headers**: `Authorization: Bearer <token>`

## 📈 **Progress & Analytics Endpoints**

### GET /api/v1/users/progress
**Description**: Get user progress
**Headers**: `Authorization: Bearer <token>`

### GET /api/v1/users/test-results
**Description**: Get test results
**Headers**: `Authorization: Bearer <token>`

### POST /api/v1/users/test-results
**Description**: Submit test results
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "testId": "test_id",
  "score": 85,
  "totalQuestions": 50,
  "correctAnswers": 42,
  "timeSpent": 3600,
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": "A",
      "isCorrect": true,
      "timeSpent": 30
    }
  ]
}
```

### GET /api/v1/users/get-badges
**Description**: Get user badges
**Headers**: `Authorization: Bearer <token>`

### GET /api/v1/users/get-recommendations
**Description**: Get recommendations
**Headers**: `Authorization: Bearer <token>`

## 🔐 **Security Endpoints**

### POST /api/v1/users/send-otp
**Description**: Send OTP
**Request**:
```json
{
  "email": "john@example.com"
}
```

### POST /api/v1/users/verify-otp
**Description**: Verify OTP
**Request**:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### POST /api/v1/users/forgot-password
**Description**: Forgot password
**Request**:
```json
{
  "email": "john@example.com"
}
```

### POST /api/v1/users/reset-password
**Description**: Reset password
**Request**:
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### POST /api/v1/users/refresh
**Description**: Refresh token
**Request**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

## 📁 **File Upload Endpoints**

### POST /upload-image
**Description**: Upload image
**Content-Type**: `multipart/form-data`
**Form Data**:
- `image`: File

### DELETE /upload-image/:filename
**Description**: Delete image

## 📊 **Public Endpoints**

### GET /api/public/questions
**Description**: Get public questions
**Query Parameters**:
- `page` (int): Page number
- `limit` (int): Items per page
- `subject` (string): Filter by subject
- `exam` (string): Filter by exam
- `difficulty` (string): Filter by difficulty
- `moduleType` (string): Filter by module type
- `isPremium` (boolean): Filter by premium status
- `language` (string): Filter by language
- `search` (string): Search term

### GET /api/public/questions/:id
**Description**: Get specific question

### GET /api/public/filters
**Description**: Get available filters

### GET /api/public/statistics
**Description**: Get public statistics

## 🏗️ **Module Management Endpoints**

### GET /modules
**Description**: Get all modules

### GET /modules/:id
**Description**: Get specific module

### POST /modules
**Description**: Create module
**Request**:
```json
{
  "name": "Mathematics Module 1",
  "description": "Basic mathematics concepts",
  "exam": "rrb-je",
  "subject": "Mathematics",
  "difficulty": "easy",
  "questions": ["question_id_1", "question_id_2"],
  "totalMarks": 50,
  "totalTime": 60,
  "moduleType": "practice"
}
```

### PUT /modules/:id
**Description**: Update module

### DELETE /modules/:id
**Description**: Delete module

## 🏷️ **Utility Endpoints**

### GET /exams
**Description**: Get all exams

### GET /levels
**Description**: Get all levels

### GET /subjects
**Description**: Get all subjects

### GET /topics/:subject
**Description**: Get topics by subject

### GET /tags
**Description**: Get all tags

### GET /health
**Description**: Health check

### GET /ping
**Description**: Simple ping

### GET /statistics
**Description**: Get dashboard statistics

## 🔄 **Bulk Operations**

### POST /bulk-upload
**Description**: Bulk upload questions
**Content-Type**: `multipart/form-data`
**Form Data**:
- `file`: CSV/Excel file

## 📋 **Response Formats**

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## 🔐 **Authentication**

Most endpoints require authentication using Bearer token:
```
Authorization: Bearer <your_token_here>
```

## 📡 **Base URL**
```
https://admindashboard-x0hk.onrender.com
```

This complete API documentation provides all the endpoints you need to build your Flutter app! 🚀 