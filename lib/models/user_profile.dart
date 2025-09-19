class UserProfile {
  final String? id;
  final String name;
  final String email;
  final String phone;
  final String exam;
  final String language;
  final String? referralCode;
  final bool onboardingCompleted;
  final String role;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  
  // Profiling data
  final String? preparationDuration;
  final String? preparationLevel;
  final List<String>? challengingSubjects;
  final DateTime? targetExamDate;
  
  // Diagnostic results
  final Map<String, dynamic>? diagnosticResults;
  final Map<String, String>? subjectLevels;
  
  // Learning pathway
  final Map<String, dynamic>? learningPathway;
  final List<String>? weakAreas;
  final List<String>? strongAreas;

  UserProfile({
    this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.exam,
    this.language = 'english',
    this.referralCode,
    this.onboardingCompleted = false,
    this.role = 'user',
    this.createdAt,
    this.updatedAt,
    this.preparationDuration,
    this.preparationLevel,
    this.challengingSubjects,
    this.targetExamDate,
    this.diagnosticResults,
    this.subjectLevels,
    this.learningPathway,
    this.weakAreas,
    this.strongAreas,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['_id'],
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      exam: json['exam'] ?? '',
      language: json['language'] ?? 'english',
      referralCode: json['referralCode'],
      onboardingCompleted: json['onboardingCompleted'] ?? false,
      role: json['role'] ?? 'user',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
      preparationDuration: json['preparationDuration'],
      preparationLevel: json['preparationLevel'],
      challengingSubjects: json['challengingSubjects'] != null 
          ? List<String>.from(json['challengingSubjects']) 
          : null,
      targetExamDate: json['targetExamDate'] != null 
          ? DateTime.parse(json['targetExamDate']) 
          : null,
      diagnosticResults: json['diagnosticResults'],
      subjectLevels: json['subjectLevels'] != null 
          ? Map<String, String>.from(json['subjectLevels']) 
          : null,
      learningPathway: json['learningPathway'],
      weakAreas: json['weakAreas'] != null 
          ? List<String>.from(json['weakAreas']) 
          : null,
      strongAreas: json['strongAreas'] != null 
          ? List<String>.from(json['strongAreas']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'exam': exam,
      'language': language,
      'referralCode': referralCode,
      'onboardingCompleted': onboardingCompleted,
      'role': role,
      'preparationDuration': preparationDuration,
      'preparationLevel': preparationLevel,
      'challengingSubjects': challengingSubjects,
      'targetExamDate': targetExamDate?.toIso8601String(),
      'diagnosticResults': diagnosticResults,
      'subjectLevels': subjectLevels,
      'learningPathway': learningPathway,
      'weakAreas': weakAreas,
      'strongAreas': strongAreas,
    };
  }

  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? exam,
    String? language,
    String? referralCode,
    bool? onboardingCompleted,
    String? role,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? preparationDuration,
    String? preparationLevel,
    List<String>? challengingSubjects,
    DateTime? targetExamDate,
    Map<String, dynamic>? diagnosticResults,
    Map<String, String>? subjectLevels,
    Map<String, dynamic>? learningPathway,
    List<String>? weakAreas,
    List<String>? strongAreas,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      exam: exam ?? this.exam,
      language: language ?? this.language,
      referralCode: referralCode ?? this.referralCode,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      preparationDuration: preparationDuration ?? this.preparationDuration,
      preparationLevel: preparationLevel ?? this.preparationLevel,
      challengingSubjects: challengingSubjects ?? this.challengingSubjects,
      targetExamDate: targetExamDate ?? this.targetExamDate,
      diagnosticResults: diagnosticResults ?? this.diagnosticResults,
      subjectLevels: subjectLevels ?? this.subjectLevels,
      learningPathway: learningPathway ?? this.learningPathway,
      weakAreas: weakAreas ?? this.weakAreas,
      strongAreas: strongAreas ?? this.strongAreas,
    );
  }
}