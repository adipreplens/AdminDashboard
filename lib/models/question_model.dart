class Question {
  final String? id;
  final String text;
  final List<String> options;
  final String answer;
  final String subject;
  final String exam;
  final String difficulty;
  final String level;
  final List<String> tags;
  final int marks;
  final int timeLimit;
  final String blooms;
  final String? imageUrl;
  final String? solutionImageUrl;
  final Map<String, String>? optionImages;
  final String publishStatus;
  final String? category;
  final String? topic;
  final String? solution;
  final String? questionMath;
  final String? solutionMath;
  final String? explanation;
  final List<String> hints;
  final String moduleType;
  final String? testSeriesId;
  final String? testSeriesName;
  final int? testNumber;
  final bool isPremium;
  final String language;
  final List<String> relatedQuestions;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Question({
    this.id,
    required this.text,
    required this.options,
    required this.answer,
    required this.subject,
    required this.exam,
    required this.difficulty,
    required this.level,
    this.tags = const [],
    required this.marks,
    required this.timeLimit,
    required this.blooms,
    this.imageUrl,
    this.solutionImageUrl,
    this.optionImages,
    this.publishStatus = 'draft',
    this.category,
    this.topic,
    this.solution,
    this.questionMath,
    this.solutionMath,
    this.explanation,
    this.hints = const [],
    this.moduleType = 'practice',
    this.testSeriesId,
    this.testSeriesName,
    this.testNumber,
    this.isPremium = false,
    this.language = 'english',
    this.relatedQuestions = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['_id'],
      text: json['text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      answer: json['answer'] ?? '',
      subject: json['subject'] ?? '',
      exam: json['exam'] ?? '',
      difficulty: json['difficulty'] ?? '',
      level: json['level'] ?? 'Level 1',
      tags: List<String>.from(json['tags'] ?? []),
      marks: json['marks'] ?? 0,
      timeLimit: json['timeLimit'] ?? 0,
      blooms: json['blooms'] ?? '',
      imageUrl: json['imageUrl'],
      solutionImageUrl: json['solutionImageUrl'],
      optionImages: json['optionImages'] != null 
          ? Map<String, String>.from(json['optionImages']) 
          : null,
      publishStatus: json['publishStatus'] ?? 'draft',
      category: json['category'],
      topic: json['topic'],
      solution: json['solution'],
      questionMath: json['questionMath'],
      solutionMath: json['solutionMath'],
      explanation: json['explanation'],
      hints: List<String>.from(json['hints'] ?? []),
      moduleType: json['moduleType'] ?? 'practice',
      testSeriesId: json['testSeriesId'],
      testSeriesName: json['testSeriesName'],
      testNumber: json['testNumber'],
      isPremium: json['isPremium'] ?? false,
      language: json['language'] ?? 'english',
      relatedQuestions: List<String>.from(json['relatedQuestions'] ?? []),
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'text': text,
      'options': options,
      'answer': answer,
      'subject': subject,
      'exam': exam,
      'difficulty': difficulty,
      'level': level,
      'tags': tags,
      'marks': marks,
      'timeLimit': timeLimit,
      'blooms': blooms,
      'imageUrl': imageUrl,
      'solutionImageUrl': solutionImageUrl,
      'optionImages': optionImages,
      'publishStatus': publishStatus,
      'category': category,
      'topic': topic,
      'solution': solution,
      'questionMath': questionMath,
      'solutionMath': solutionMath,
      'explanation': explanation,
      'hints': hints,
      'moduleType': moduleType,
      'testSeriesId': testSeriesId,
      'testSeriesName': testSeriesName,
      'testNumber': testNumber,
      'isPremium': isPremium,
      'language': language,
      'explanation': explanation,
      'hints': hints,
      'relatedQuestions': relatedQuestions,
    };
  }

  Question copyWith({
    String? id,
    String? text,
    List<String>? options,
    String? answer,
    String? subject,
    String? exam,
    String? difficulty,
    String? level,
    List<String>? tags,
    int? marks,
    int? timeLimit,
    String? blooms,
    String? imageUrl,
    String? solutionImageUrl,
    Map<String, String>? optionImages,
    String? publishStatus,
    String? category,
    String? topic,
    String? solution,
    String? questionMath,
    String? solutionMath,
    String? explanation,
    List<String>? hints,
    String? moduleType,
    String? testSeriesId,
    String? testSeriesName,
    int? testNumber,
    bool? isPremium,
    String? language,
    List<String>? relatedQuestions,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Question(
      id: id ?? this.id,
      text: text ?? this.text,
      options: options ?? this.options,
      answer: answer ?? this.answer,
      subject: subject ?? this.subject,
      exam: exam ?? this.exam,
      difficulty: difficulty ?? this.difficulty,
      level: level ?? this.level,
      tags: tags ?? this.tags,
      marks: marks ?? this.marks,
      timeLimit: timeLimit ?? this.timeLimit,
      blooms: blooms ?? this.blooms,
      imageUrl: imageUrl ?? this.imageUrl,
      solutionImageUrl: solutionImageUrl ?? this.solutionImageUrl,
      optionImages: optionImages ?? this.optionImages,
      publishStatus: publishStatus ?? this.publishStatus,
      category: category ?? this.category,
      topic: topic ?? this.topic,
      solution: solution ?? this.solution,
      questionMath: questionMath ?? this.questionMath,
      solutionMath: solutionMath ?? this.solutionMath,
      explanation: explanation ?? this.explanation,
      hints: hints ?? this.hints,
      moduleType: moduleType ?? this.moduleType,
      testSeriesId: testSeriesId ?? this.testSeriesId,
      testSeriesName: testSeriesName ?? this.testSeriesName,
      testNumber: testNumber ?? this.testNumber,
      isPremium: isPremium ?? this.isPremium,
      language: language ?? this.language,
      relatedQuestions: relatedQuestions ?? this.relatedQuestions,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}