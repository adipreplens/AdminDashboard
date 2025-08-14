# User Registration & Onboarding API Documentation

## Overview
This document describes the new user registration and onboarding API endpoints that handle comprehensive user data including exam preferences, language settings, and personalized study plans.

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. User Registration
**POST** `/api/users/register`

Creates a new user account with basic information and initializes onboarding with default values.

#### Request Body
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+91-9876543210",
  "exam": "rrb-je",
  "language": "english",
  "referralCode": null
}
```

#### Field Descriptions
- **name** (required): User's full name
- **email** (required): Unique email address
- **password** (required): Minimum 6 characters
- **phone** (optional): Phone number with country code
- **exam** (required): One of the supported exam types
- **language** (optional): Preferred language (english/hindi), defaults to english
- **referralCode** (optional): Referral code if applicable

#### Supported Exam Types
- `rrb-je` - RRB Junior Engineer
- `rrb-alp` - RRB Assistant Loco Pilot
- `rrb-technician` - RRB Technician
- `rrb-ntpc` - RRB NTPC
- `ssc-cgl` - SSC CGL
- `ssc-chsl` - SSC CHSL
- `ssc-je` - SSC Junior Engineer
- `upsc` - UPSC Civil Services
- `bank-po` - Bank PO
- `cat` - CAT (Common Admission Test)

#### Response (Success - 201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+91-9876543210",
      "exam": "rrb-je",
      "language": "english",
      "onboardingCompleted": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "onboarding": {
      "exam": "rrb-je",
      "examName": "RRB Junior Engineer",
      "preparationDays": 90,
      "targetDate": "2024-01-15T10:30:00.000Z",
      "currentLevel": "beginner",
      "preferredSubjects": ["mathematics", "reasoning", "general-knowledge"],
      "studyTimePerDay": 2,
      "goals": {
        "targetScore": 80,
        "dailyQuestions": 30,
        "weeklyTests": 3
      }
    }
  }
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "error": "Missing required fields: name, email, password, exam"
}
```

#### Response (Error - 400 - Duplicate Email)
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

#### Response (Error - 400 - Invalid Exam)
```json
{
  "success": false,
  "error": "Invalid exam. Must be one of: rrb-je, rrb-alp, rrb-technician, rrb-ntpc, ssc-cgl, ssc-chsl, ssc-je, upsc, bank-po, cat"
}
```

### 2. Complete Onboarding
**POST** `/api/users/onboarding`

Completes the user onboarding process with detailed study preferences and goals.

#### Request Body
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "exam": "rrb-je",
  "preparationDays": 120,
  "currentLevel": "intermediate",
  "preferredSubjects": ["mathematics", "reasoning", "general-knowledge"],
  "studyTimePerDay": 3,
  "weakAreas": ["electrical-engineering"],
  "strongAreas": ["mathematics"],
  "targetScore": 85,
  "dailyQuestions": 40,
  "weeklyTests": 4
}
```

#### Field Descriptions
- **userId** (required): User's unique ID
- **exam** (required): Exam type (must match user's exam)
- **preparationDays** (required): Number of days to prepare (1-365)
- **currentLevel** (optional): Current knowledge level (beginner/intermediate/advanced)
- **preferredSubjects** (optional): Array of preferred subjects
- **studyTimePerDay** (optional): Hours of study per day (1-12)
- **weakAreas** (optional): Array of subjects/topics to focus on
- **strongAreas** (optional): Array of subjects/topics user is confident in
- **targetScore** (optional): Target score percentage (0-100)
- **dailyQuestions** (optional): Target questions per day (10-100)
- **weeklyTests** (optional): Target tests per week (1-10)

#### Supported Subjects
- `mathematics` - Mathematics
- `reasoning` - Logical Reasoning
- `general-knowledge` - General Knowledge
- `english` - English Language
- `civil-engineering` - Civil Engineering
- `mechanical-engineering` - Mechanical Engineering
- `electrical-engineering` - Electrical Engineering
- `computer-science` - Computer Science

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "exam": "rrb-je",
    "examName": "RRB Junior Engineer",
    "preparationDays": 120,
    "targetDate": "2024-02-15T10:30:00.000Z",
    "currentLevel": "intermediate",
    "preferredSubjects": ["mathematics", "reasoning", "general-knowledge"],
    "studyTimePerDay": 3,
    "weakAreas": ["electrical-engineering"],
    "strongAreas": ["mathematics"],
    "goals": {
      "targetScore": 85,
      "dailyQuestions": 40,
      "weeklyTests": 4
    },
    "roadmap": {
      "phase1": {
        "name": "Foundation Building",
        "duration": 30,
        "focus": ["mathematics", "reasoning"],
        "targetScore": 60
      },
      "phase2": {
        "name": "Concept Strengthening",
        "duration": 42,
        "focus": ["mathematics", "reasoning", "general-knowledge"],
        "targetScore": 75
      },
      "phase3": {
        "name": "Advanced Practice",
        "duration": 30,
        "focus": ["advanced-topics", "problem-solving"],
        "targetScore": 85
      },
      "phase4": {
        "name": "Mock Test Preparation",
        "duration": 18,
        "focus": ["mock-tests", "speed-accuracy"],
        "targetScore": 85
      }
    }
  }
}
```

### 3. Get User Profile
**GET** `/api/users/profile/:userId`

Retrieves user profile information and onboarding data.

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+91-9876543210",
      "exam": "rrb-je",
      "language": "english",
      "referralCode": null,
      "onboardingCompleted": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "onboarding": {
      // Complete onboarding data as shown above
    }
  }
}
```

## Testing

### Run the Test Script
```bash
cd backend
node test_user_registration.js
```

### Manual Testing with cURL

#### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+91-9876543210",
    "exam": "rrb-je",
    "language": "english",
    "referralCode": null
  }'
```

#### 2. Complete onboarding
```bash
curl -X POST http://localhost:3000/api/users/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_REGISTRATION",
    "exam": "rrb-je",
    "preparationDays": 120,
    "currentLevel": "intermediate",
    "preferredSubjects": ["mathematics", "reasoning", "general-knowledge"],
    "studyTimePerDay": 3,
    "targetScore": 85
  }'
```

#### 3. Get user profile
```bash
curl http://localhost:3000/api/users/profile/USER_ID_FROM_REGISTRATION
```

## Error Handling

### Common Error Codes
- **400 Bad Request**: Missing required fields, validation errors
- **401 Unauthorized**: Invalid or missing authentication token
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server-side errors

### Validation Rules
- **Password**: Minimum 6 characters
- **Email**: Must be unique and valid format
- **Exam**: Must be one of the supported exam types
- **Language**: Must be 'english' or 'hindi'
- **Preparation Days**: Must be between 1 and 365
- **Study Time**: Must be between 1 and 12 hours
- **Target Score**: Must be between 0 and 100

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens**: Authentication tokens with 7-day expiration
- **Input Validation**: Comprehensive validation of all input fields
- **SQL Injection Protection**: Using Mongoose ODM for database operations

## Integration Notes

### Frontend Integration
1. Use the registration endpoint to create user accounts
2. Store the returned JWT token for authenticated requests
3. Use the onboarding endpoint to collect detailed preferences
4. Use the profile endpoint to display user information

### Mobile App Integration
1. Implement the same API calls in your Flutter/Dart code
2. Store tokens securely using Flutter secure storage
3. Handle offline scenarios and retry failed requests

### Database Schema
The system automatically creates:
- **User document** with basic information
- **UserOnboarding document** with study preferences and roadmap
- **Automatic timestamps** for creation and updates

## Support

For questions or issues with the API:
1. Check the server logs for detailed error messages
2. Verify all required fields are provided
3. Ensure the server is running and accessible
4. Check database connectivity and schema validation 