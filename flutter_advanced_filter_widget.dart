import 'package:flutter/material.dart';

// Advanced Filter Widget
class AdvancedFilterWidget extends StatefulWidget {
  final Map<String, List<String>> filterOptions;
  final Function(Map<String, dynamic>) onApplyFilters;
  final Map<String, dynamic> currentFilters;

  AdvancedFilterWidget({
    required this.filterOptions,
    required this.onApplyFilters,
    required this.currentFilters,
  });

  @override
  _AdvancedFilterWidgetState createState() => _AdvancedFilterWidgetState();
}

class _AdvancedFilterWidgetState extends State<AdvancedFilterWidget> {
  late String? selectedSubject;
  late String? selectedExam;
  late String? selectedDifficulty;
  late List<String> selectedTags;
  late String? selectedLanguage;
  late bool? selectedIsPremium;
  late String? selectedModuleType;
  late String? selectedCategory;
  late String? selectedTopic;

  @override
  void initState() {
    super.initState();
    // Initialize with current filters
    selectedSubject = widget.currentFilters['subject'];
    selectedExam = widget.currentFilters['exam'];
    selectedDifficulty = widget.currentFilters['difficulty'];
    selectedTags = List<String>.from(widget.currentFilters['tags'] ?? []);
    selectedLanguage = widget.currentFilters['language'];
    selectedIsPremium = widget.currentFilters['isPremium'];
    selectedModuleType = widget.currentFilters['moduleType'];
    selectedCategory = widget.currentFilters['category'];
    selectedTopic = widget.currentFilters['topic'];
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        height: MediaQuery.of(context).size.height * 0.8,
        child: Column(
          children: [
            // Header
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(8),
                  topRight: Radius.circular(8),
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.filter_list, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'Filter Questions',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Spacer(),
                  IconButton(
                    icon: Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            
            // Filter Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Subject Filter
                    _buildDropdownFilter(
                      'Subject',
                      selectedSubject,
                      widget.filterOptions['subjects'] ?? [],
                      (value) => setState(() => selectedSubject = value),
                    ),
                    
                    SizedBox(height: 16),
                    
                    // Exam Filter
                    _buildDropdownFilter(
                      'Exam',
                      selectedExam,
                      widget.filterOptions['exams'] ?? [],
                      (value) => setState(() => selectedExam = value),
                    ),
                    
                    SizedBox(height: 16),
                    
                    // Difficulty Filter
                    _buildDropdownFilter(
                      'Difficulty',
                      selectedDifficulty,
                      widget.filterOptions['difficulties'] ?? [],
                      (value) => setState(() => selectedDifficulty = value),
                    ),
                    
                    SizedBox(height: 16),
                    
                    // Language Filter
                    _buildDropdownFilter(
                      'Language',
                      selectedLanguage,
                      widget.filterOptions['languages'] ?? [],
                      (value) => setState(() => selectedLanguage = value),
                    ),
                    
                    SizedBox(height: 16),
                    
                    // Module Type Filter
                    _buildDropdownFilter(
                      'Module Type',
                      selectedModuleType,
                      widget.filterOptions['moduleTypes'] ?? [],
                      (value) => setState(() => selectedModuleType = value),
                    ),
                    
                    SizedBox(height: 16),
                    
                    // Category Filter
                    _buildDropdownFilter(
                      'Category',
                      selectedCategory,
                      widget.filterOptions['categories'] ?? [],
                      (value) => setState(() => selectedCategory = value),
                    ),
                    
                    SizedBox(height: 16),
                    
                    // Topic Filter
                    _buildDropdownFilter(
                      'Topic',
                      selectedTopic,
                      widget.filterOptions['topics'] ?? [],
                      (value) => setState(() => selectedTopic = value),
                    ),
                    
                    SizedBox(height: 16),
                    
                    // Tags Filter
                    _buildTagsFilter(),
                    
                    SizedBox(height: 16),
                    
                    // Premium Filter
                    _buildPremiumFilter(),
                    
                    SizedBox(height: 32),
                    
                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _clearAllFilters,
                            child: Text('Clear All'),
                          ),
                        ),
                        SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _applyFilters,
                            child: Text('Apply Filters'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdownFilter(
    String label,
    String? selectedValue,
    List<String> options,
    Function(String?) onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: selectedValue,
          decoration: InputDecoration(
            border: OutlineInputBorder(),
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          hint: Text('Select $label'),
          items: [
            DropdownMenuItem<String>(
              value: null,
              child: Text('All $label'),
            ),
            ...options.map((option) => DropdownMenuItem<String>(
              value: option,
              child: Text(option),
            )),
          ],
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildTagsFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tags',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Column(
            children: [
              Container(
                height: 200,
                child: ListView.builder(
                  itemCount: widget.filterOptions['tags']?.length ?? 0,
                  itemBuilder: (context, index) {
                    final tag = widget.filterOptions['tags']![index];
                    final isSelected = selectedTags.contains(tag);
                    
                    return CheckboxListTile(
                      title: Text(tag),
                      value: isSelected,
                      onChanged: (bool? value) {
                        setState(() {
                          if (value == true) {
                            selectedTags.add(tag);
                          } else {
                            selectedTags.remove(tag);
                          }
                        });
                      },
                    );
                  },
                ),
              ),
              if (selectedTags.isNotEmpty)
                Container(
                  padding: EdgeInsets.all(8),
                  child: Wrap(
                    spacing: 8,
                    children: selectedTags.map((tag) => Chip(
                      label: Text(tag),
                      onDeleted: () {
                        setState(() {
                          selectedTags.remove(tag);
                        });
                      },
                    )).toList(),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPremiumFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Premium Status',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: RadioListTile<bool?>(
                title: Text('All'),
                value: null,
                groupValue: selectedIsPremium,
                onChanged: (value) => setState(() => selectedIsPremium = value),
              ),
            ),
            Expanded(
              child: RadioListTile<bool?>(
                title: Text('Free'),
                value: false,
                groupValue: selectedIsPremium,
                onChanged: (value) => setState(() => selectedIsPremium = value),
              ),
            ),
            Expanded(
              child: RadioListTile<bool?>(
                title: Text('Premium'),
                value: true,
                groupValue: selectedIsPremium,
                onChanged: (value) => setState(() => selectedIsPremium = value),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _clearAllFilters() {
    setState(() {
      selectedSubject = null;
      selectedExam = null;
      selectedDifficulty = null;
      selectedTags.clear();
      selectedLanguage = null;
      selectedIsPremium = null;
      selectedModuleType = null;
      selectedCategory = null;
      selectedTopic = null;
    });
  }

  void _applyFilters() {
    final filters = <String, dynamic>{
      'subject': selectedSubject,
      'exam': selectedExam,
      'difficulty': selectedDifficulty,
      'tags': selectedTags,
      'language': selectedLanguage,
      'isPremium': selectedIsPremium,
      'moduleType': selectedModuleType,
      'category': selectedCategory,
      'topic': selectedTopic,
    };
    
    widget.onApplyFilters(filters);
    Navigator.pop(context);
  }
}

// Usage Example in QuestionsScreen
class QuestionsScreenWithAdvancedFilter extends StatefulWidget {
  @override
  _QuestionsScreenWithAdvancedFilterState createState() => _QuestionsScreenWithAdvancedFilterState();
}

class _QuestionsScreenWithAdvancedFilterState extends State<QuestionsScreenWithAdvancedFilter> {
  QuestionsResponse? questionsResponse;
  bool isLoading = false;
  String? error;
  Map<String, List<String>> filterOptions = {};
  Map<String, dynamic> currentFilters = {};

  @override
  void initState() {
    super.initState();
    _loadFilterOptions();
    _loadQuestions();
  }

  Future<void> _loadFilterOptions() async {
    try {
      final options = await QuestionService.getFilterOptions();
      setState(() {
        filterOptions = options;
      });
    } catch (e) {
      print('Error loading filter options: $e');
    }
  }

  Future<void> _loadQuestions() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final response = await QuestionService.getFilteredQuestions(
        subject: currentFilters['subject'],
        exam: currentFilters['exam'],
        difficulty: currentFilters['difficulty'],
        tags: currentFilters['tags']?.isNotEmpty == true ? currentFilters['tags'] : null,
        language: currentFilters['language'],
        isPremium: currentFilters['isPremium'],
        moduleType: currentFilters['moduleType'],
        category: currentFilters['category'],
        topic: currentFilters['topic'],
      );

      setState(() {
        questionsResponse = response;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  void _showAdvancedFilter() {
    showDialog(
      context: context,
      builder: (context) => AdvancedFilterWidget(
        filterOptions: filterOptions,
        currentFilters: currentFilters,
        onApplyFilters: (filters) {
          setState(() {
            currentFilters = filters;
          });
          _loadQuestions();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Questions'),
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: _showAdvancedFilter,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $error'),
            ElevatedButton(
              onPressed: _loadQuestions,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (questionsResponse == null || questionsResponse!.questions.isEmpty) {
      return Center(child: Text('No questions found'));
    }

    return Column(
      children: [
        // Active Filters Display
        if (currentFilters.isNotEmpty)
          Container(
            padding: EdgeInsets.all(8),
            child: Wrap(
              spacing: 8,
              children: currentFilters.entries
                  .where((entry) => entry.value != null && 
                      (entry.value is! List || (entry.value as List).isNotEmpty))
                  .map((entry) => Chip(
                    label: Text('${entry.key}: ${entry.value}'),
                    onDeleted: () {
                      setState(() {
                        if (entry.value is List) {
                          currentFilters[entry.key] = [];
                        } else {
                          currentFilters[entry.key] = null;
                        }
                      });
                      _loadQuestions();
                    },
                  ))
                  .toList(),
            ),
          ),
        
        // Questions List
        Expanded(
          child: ListView.builder(
            itemCount: questionsResponse!.questions.length,
            itemBuilder: (context, index) {
              final question = questionsResponse!.questions[index];
              return Card(
                margin: EdgeInsets.all(8),
                child: ListTile(
                  title: Text(
                    question.text,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Subject: ${question.subject}'),
                      Text('Exam: ${question.exam}'),
                      Text('Difficulty: ${question.difficulty}'),
                      if (question.tags.isNotEmpty)
                        Text('Tags: ${question.tags.join(', ')}'),
                    ],
                  ),
                  trailing: question.isPremium
                      ? Icon(Icons.star, color: Colors.amber)
                      : null,
                  onTap: () {
                    // Navigate to question detail screen
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }
} 