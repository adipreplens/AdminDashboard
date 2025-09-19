import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';
import '../models/question_model.dart';

class ApiService extends ChangeNotifier {
  static const String baseUrl = 'https://admindashboard-x0hk.onrender.com';
  
  bool _isLoading = false;
  List<Question> _questions = [];
  String? _error;

  bool get isLoading => _isLoading;
  List<Question> get questions => _questions;
  String? get error => _error;

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

  // Health check
  Future<bool> checkHealth() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['status'] == 'OK';
      }
      return false;
    } catch (e) {
      print('Health check error: $e');
      return false;
    }
  }

  // Upload question
  Future<bool> uploadQuestion(Question question) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/questions'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(question.toJson()),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        print('Question uploaded successfully: ${data['message']}');
        Fluttertoast.showToast(
          msg: 'Question uploaded successfully!',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        _setLoading(false);
        return true;
      } else {
        final errorData = json.decode(response.body);
        _setError(errorData['error'] ?? 'Failed to upload question');
        Fluttertoast.showToast(
          msg: errorData['error'] ?? 'Failed to upload question',
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.BOTTOM,
        );
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

  // Upload image
  Future<String?> uploadImage(File imageFile) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/upload-image'),
      );
      
      request.files.add(
        await http.MultipartFile.fromPath('image', imageFile.path),
      );

      var response = await request.send();
      
      if (response.statusCode == 200) {
        final responseData = await response.stream.bytesToString();
        final data = json.decode(responseData);
        return data['url'];
      } else {
        print('Image upload failed: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Image upload error: $e');
      return null;
    }
  }

  // Get all questions
  Future<void> fetchQuestions() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/questions'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _questions = (data['questions'] as List)
            .map((json) => Question.fromJson(json))
            .toList();
        _setLoading(false);
      } else {
        _setError('Failed to fetch questions');
        _setLoading(false);
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
    }
  }

  // Delete question
  Future<bool> deleteQuestion(String questionId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/questions/$questionId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: 'Question deleted successfully!',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        return true;
      } else {
        Fluttertoast.showToast(
          msg: 'Failed to delete question',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        return false;
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Network error: $e',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return false;
    }
  }

  // Publish/Unpublish question
  Future<bool> toggleQuestionStatus(String questionId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/questions/$questionId/publish'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'publishStatus': status}),
      );

      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: 'Question status updated!',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        return true;
      } else {
        Fluttertoast.showToast(
          msg: 'Failed to update question status',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        return false;
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Network error: $e',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return false;
    }
  }
}