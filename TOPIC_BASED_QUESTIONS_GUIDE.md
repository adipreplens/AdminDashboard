# 🎯 Topic-Based Question Filtering System Guide

## 🚀 **Overview**

The Topic-Based Question Filtering System allows users to select specific topics/chapters and get questions from those topics. This system works with your existing admin dashboard database and uses the `tags` field to filter questions by topics.

## 📊 **How It Works**

### **1. Admin Dashboard Integration**
- Questions are tagged with specific topics in the admin dashboard
- Tags are stored in the `tags` field of each question
- Topics are mapped to subjects and exams based on the Google Sheets syllabus

### **2. Topic Mapping**
Based on the [Google Sheets syllabus](https://docs.google.com/spreadsheets/d/1R15Y5DpUqi6V9dlB3G807mk7rO1G4prRMqKeASllLZ4/edit?gid=0#gid=0), the system includes:

**SSC CGL:**
- General Awareness → History, Geography, Polity, Economics, Science, Current Events
- Quantitative Aptitude → Number System, Algebra, Geometry, Trigonometry, Data Interpretation, Arithmetic
- English Comprehension → Grammar, Vocabulary, Comprehension, Synonyms, Antonyms
- General Intelligence and Reasoning → Analogies, Coding-Decoding, Blood Relations, Series, Syllogism, Venn Diagrams

**RRB JE:**
- Mathematics → Number System, Algebra, Geometry, Trigonometry, Statistics
- Reasoning → Analogies, Coding-Decoding, Blood Relations, Series, Syllogism
- General Knowledge → History, Geography, Polity, Economics, Science, Current Affairs
- Civil Engineering → Building Materials, Structural Analysis, Concrete Technology, Soil Mechanics, Hydraulics, Transportation
- Mechanical Engineering → Thermodynamics, Fluid Mechanics, Strength of Materials, Machine Design, Manufacturing
- Electrical Engineering → Electrical Machines, Power Systems, Electronics, Control Systems, Measurements

## 🚀 **API Endpoints**

### **1. Get All Exams with Topics**
```http
GET /topics/exams
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ssc-cgl": {
      "subjects": [
        {
          "id": "general-awareness",
          "name": "General Awareness",
          "topics": [
            {"id": "history", "name": "History"},
            {"id": "geography", "name": "Geography"}
          ]
        }
      ]
    }
  }
}
```

### **2. Get Subjects for Exam**
```http
GET /topics/:examId/subjects
```

**Example:**
```http
GET /topics/ssc-cgl/subjects
```

### **3. Get Topics for Subject**
```http
GET /topics/:examId/subjects/:subjectId/topics
```

**Example:**
```http
GET /topics/ssc-cgl/subjects/general-awareness/topics
```

### **4. Get Questions by Topic**
```http
GET /topics/:examId/questions?subject=general-awareness&topic=history&difficulty=easy&limit=20
```

**Query Parameters:**
- `subject` - Subject ID (optional)
- `topic` - Topic ID (optional)
- `difficulty` - easy, medium, hard (optional)
- `language` - english, hindi (optional)
- `limit` - Number of questions (default: 50)
- `skip` - Skip questions for pagination (default: 0)

### **5. Get Questions by Multiple Topics**
```http
POST /topics/:examId/questions/multiple
Content-Type: application/json

{
  "topics": ["history", "geography", "polity"],
  "difficulty": "easy",
  "language": "english",
  "limit": 30
}
```

### **6. Get Topic Question Count**
```http
GET /topics/:examId/count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "general-awareness": {
      "name": "General Awareness",
      "topics": {
        "history": {"name": "History", "count": 45},
        "geography": {"name": "Geography", "count": 32}
      }
    }
  }
}
```

## 📱 **Flutter Integration**

### **1. Add Dependencies**
```yaml
dependencies:
  http: ^1.1.0
```

### **2. Use Topic-Based Question Service**
```dart
import 'flutter_topic_based_questions.dart';

// Get subjects for an exam
final subjects = await TopicBasedQuestionService.getSubjectsForExam('ssc-cgl');

// Get topics for a subject
final topics = await TopicBasedQuestionService.getTopicsForSubject('ssc-cgl', 'general-awareness');

// Get questions by topic
final questions = await TopicBasedQuestionService.getQuestionsByTopic(
  examId: 'ssc-cgl',
  subject: 'general-awareness',
  topic: 'history',
  difficulty: 'easy',
  limit: 20,
);

// Get questions by multiple topics
final questions = await TopicBasedQuestionService.getQuestionsByTopics(
  examId: 'ssc-cgl',
  topics: ['history', 'geography', 'polity'],
  difficulty: 'easy',
  limit: 30,
);
```

### **3. Use UI Components**
```dart
// Topic selection widget
TopicSelectionWidget(
  examId: 'ssc-cgl',
  onTopicsSelected: (selectedTopics) {
    // Navigate to question screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TopicBasedQuestionScreen(
          examId: 'ssc-cgl',
          selectedTopics: selectedTopics,
        ),
      ),
    );
  },
)

// Question practice screen
TopicBasedQuestionScreen(
  examId: 'ssc-cgl',
  selectedTopics: ['history', 'geography'],
)
```

## 🎨 **UI Components**

### **Topic Selection Widget**
- **Expandable subject cards** with topic chips
- **Multi-selection** with visual feedback
- **Select All/Clear** functionality
- **Selection summary** with count
- **Start Practice** button

### **Question Practice Screen**
- **Question navigation** with progress
- **Answer selection** with radio buttons
- **Previous/Next** navigation
- **Real-time score** tracking
- **Results screen** with performance analysis

## 🔧 **Admin Dashboard Setup**

### **1. Question Tagging**
When creating questions in the admin dashboard, add appropriate tags:

**Example Tags:**
- `history` - For history questions
- `geography` - For geography questions
- `polity` - For polity questions
- `number-system` - For number system questions
- `algebra` - For algebra questions
- `building-materials` - For civil engineering questions

### **2. Tag Format**
- Use lowercase with hyphens: `building-materials`
- Multiple tags per question: `["history", "ancient-india"]`
- Be consistent with tag names

### **3. Bulk Upload with Tags**
When uploading questions via CSV, include a `tags` column:
```csv
text,options,answer,subject,exam,difficulty,tags
What is the capital of India?,"Delhi,Mumbai,Kolkata,Chennai",Delhi,general-knowledge,ssc-cgl,easy,"geography,current-affairs"
```

## 💡 **Use Cases**

### **1. Chapter-wise Practice**
- User selects "History" topic
- Gets 20 history questions
- Practices specific chapter

### **2. Subject-wise Practice**
- User selects all topics under "General Awareness"
- Gets mixed questions from History, Geography, Polity, etc.
- Practices entire subject

### **3. Multiple Topic Practice**
- User selects "History", "Geography", "Polity"
- Gets questions from all three topics
- Mixed practice session

### **4. Difficulty-based Practice**
- User selects "Algebra" with "easy" difficulty
- Gets only easy algebra questions
- Focused practice

## 🎯 **Features**

### **✅ Smart Topic Mapping**
- Based on official syllabus
- Covers all major exams
- Subject-wise organization

### **✅ Flexible Filtering**
- Single topic selection
- Multiple topic selection
- Subject-wise grouping
- Difficulty filtering
- Language filtering

### **✅ Beautiful UI**
- Expandable subject cards
- Topic chips for selection
- Progress tracking
- Real-time scoring

### **✅ Admin Integration**
- Works with existing database
- Uses existing tags field
- No database changes needed
- Easy to maintain

## 🚀 **Implementation Steps**

### **1. Backend Setup**
- ✅ Topic service created
- ✅ API endpoints implemented
- ✅ Topic mapping defined
- ✅ Database queries optimized

### **2. Flutter Integration**
- ✅ Service files created
- ✅ UI components built
- ✅ Data models defined
- ✅ Navigation flow ready

### **3. Admin Dashboard**
- ✅ Tag questions properly
- ✅ Use consistent tag names
- ✅ Upload questions with tags

## 🎉 **Your Flutter App Now Has Topic-Based Practice!**

**Users can:**
- ✅ **Select specific topics** from any subject
- ✅ **Practice chapter-wise** with focused questions
- ✅ **Mix multiple topics** for comprehensive practice
- ✅ **Filter by difficulty** for targeted learning
- ✅ **Track progress** with real-time scoring

**Your Flutter team can build:**
- ✅ **Topic selection screen** with beautiful UI
- ✅ **Question practice screen** with navigation
- ✅ **Results screen** with performance analysis
- ✅ **Progress tracking** by topic

**The system automatically:**
- ✅ **Fetches questions** from your admin dashboard
- ✅ **Filters by tags** for topic-based practice
- ✅ **Provides pagination** for large question sets
- ✅ **Handles errors** gracefully

**Your EdTech app now provides precise, topic-based learning!** 🚀✨ 