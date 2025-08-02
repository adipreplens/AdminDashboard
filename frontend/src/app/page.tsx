'use client';

import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admindashboard-x0hk.onrender.com';

// Hardcoded login credentials
const VALID_CREDENTIALS = [
  { email: 'admin@preplens.com', password: 'admin123' },
  { email: 'admin', password: 'admin' },
  { email: 'test@test.com', password: 'test' },
  { email: 'user', password: 'user' }
];

interface Statistics {
  totalQuestions: number;
  totalUsers: number;
  totalExams: number;
  recentUploads: number;
}

interface Question {
  _id: string;
  text: string;
  options: string[];
  answer: string;
  subject: string;
  exam: string;
  difficulty: string;
  tags: string[];
  marks: number;
  timeLimit: number;
  blooms: string;
  imageUrl?: string;
  solution?: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'upload' | 'questions' | 'exams' | 'analytics' | 'users' | 'monetization'>('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState<Statistics>({
    totalQuestions: 0,
    totalUsers: 0,
    totalExams: 0,
    recentUploads: 0
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    exam: '',
    difficulty: '',
    blooms: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    options: '',
    answer: '',
    subject: '',
    exam: '',
    difficulty: '',
    tags: '',
    marks: '',
    timeLimit: '',
    blooms: '',
    category: '',
    topic: '',
    publishStatus: 'draft'
  });
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [questionImages, setQuestionImages] = useState<string[]>([]);
  const [latexPreview, setLatexPreview] = useState('');
  const [showLatexEditor, setShowLatexEditor] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      fetchStatistics();
      fetchQuestions();
    }
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Accept any file format - let the backend handle validation
      setSelectedFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/bulk-upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully uploaded ${data.uploaded} questions!`);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchQuestions(); // Refresh the questions list
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingQuestion(true);

    try {
      // Get the selected correct answer from radio buttons
      const formData = new FormData(e.target as HTMLFormElement);
      const correctAnswer = formData.get('correctAnswer') as string;
      
      // Get options from the individual option fields
      const options = questionForm.options.split('\n').filter(option => option.trim());
      
      // Find the correct answer text based on the selected radio button
      const answerIndex = correctAnswer ? correctAnswer.charCodeAt(0) - 65 : 0; // A=0, B=1, C=2, D=3
      const answerText = options[answerIndex] || options[0] || '';
      
      const questionData = {
        text: questionForm.text,
        options: options,
        answer: answerText,
        subject: questionForm.subject,
        exam: questionForm.exam || 'general',
        difficulty: questionForm.difficulty,
        tags: questionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        marks: parseInt(questionForm.marks) || 1,
        timeLimit: parseInt(questionForm.timeLimit) || 60,
        blooms: questionForm.blooms
      };

      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Question created successfully!');
        setQuestionForm({
          text: '',
          options: '',
          answer: '',
          subject: '',
          exam: '',
          difficulty: '',
          tags: '',
          marks: '',
          timeLimit: '',
          blooms: '',
          category: '',
          topic: '',
          publishStatus: 'draft'
        });
        fetchQuestions(); // Refresh the questions list
      } else {
        const error = await response.json();
        alert(`Failed to create question: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);
      setIsLoggedIn(true);
        fetchStatistics();
        fetchQuestions();
    } else {
      setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  // Image handling functions
  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.imageUrl;
        setQuestionImages([...questionImages, imageUrl]);
        
        // Insert image into question text
        const imageTag = `\n![Image](${imageUrl})\n`;
        setQuestionForm({...questionForm, text: questionForm.text + imageTag});
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handlePasteImage = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageUpload(file);
            event.preventDefault();
            break;
          }
        }
      }
    }
  };

  const handleDropImage = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  // LaTeX handling functions
  const insertLatex = (latexCode: string) => {
    const latexTag = `$${latexCode}$`;
    setQuestionForm({...questionForm, text: questionForm.text + latexTag});
    setLatexPreview(latexCode);
  };

  const handleLatexButton = () => {
    setShowLatexEditor(!showLatexEditor);
  };

  // Text formatting functions
  const formatText = (format: string) => {
    const textarea = document.querySelector('textarea[name="questionText"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = questionForm.text.substring(start, end);
      
      let formattedText = '';
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
        case 'bullet':
          formattedText = `\n• ${selectedText}`;
          break;
        case 'numbered':
          formattedText = `\n1. ${selectedText}`;
          break;
      }
      
      const newText = questionForm.text.substring(0, start) + formattedText + questionForm.text.substring(end);
      setQuestionForm({...questionForm, text: newText});
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !filters.subject || question.subject === filters.subject;
    const matchesExam = !filters.exam || question.exam === filters.exam;
    const matchesDifficulty = !filters.difficulty || question.difficulty === filters.difficulty;
    const matchesBlooms = !filters.blooms || question.blooms === filters.blooms;

    return matchesSearch && matchesSubject && matchesExam && matchesDifficulty && matchesBlooms;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PrepLens Admin</h1>
            <p className="text-gray-600">Educational Platform Administration</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo Credentials:
            </p>
            <p className="text-xs text-gray-500 mt-1">
              admin@preplens.com / admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">PrepLens Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {localStorage.getItem('userEmail')}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ➕ Create Question
            </button>
            <button
              onClick={() => setCurrentView('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📤 Bulk Upload
            </button>
            <button
              onClick={() => setCurrentView('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Questions
            </button>
            <button
              onClick={() => setCurrentView('exams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'exams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎯 Exams
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => setCurrentView('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setCurrentView('monetization')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'monetization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💰 Monetization
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Questions</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.totalQuestions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Exams</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.totalExams}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recent Uploads</p>
                    <p className="text-2xl font-semibold text-gray-900">{statistics.recentUploads}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentView === 'create' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Question</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleCreateQuestion} className="space-y-6">
                {/* Question Input Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    {/* Enhanced Rich Text Toolbar */}
                    <div className="bg-gray-50 border-b border-gray-300 p-3 flex items-center space-x-2 flex-wrap">
                      {/* Text Formatting */}
                      <div className="flex items-center space-x-1">
                        <button type="button" onClick={() => formatText('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
                          <strong className="text-sm">B</strong>
                        </button>
                        <button type="button" onClick={() => formatText('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
                          <em className="text-sm">I</em>
                        </button>
                        <button type="button" onClick={() => formatText('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline">
                          <u className="text-sm">U</u>
                        </button>
                      </div>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      {/* Lists */}
                      <div className="flex items-center space-x-1">
                        <button type="button" onClick={() => formatText('bullet')} className="p-2 hover:bg-gray-200 rounded" title="Bullet List">
                          <span className="text-sm">•</span>
                        </button>
                        <button type="button" onClick={() => formatText('numbered')} className="p-2 hover:bg-gray-200 rounded" title="Numbered List">
                          <span className="text-sm">1.</span>
                        </button>
                      </div>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      {/* Images & Media */}
                      <div className="flex items-center space-x-1">
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                          className="hidden"
                        />
                        <button type="button" onClick={() => document.getElementById('imageUpload')?.click()} className="p-2 hover:bg-gray-200 rounded" title="Upload Image">
                          <span className="text-sm">📷</span>
                        </button>
                        <button type="button" onClick={() => navigator.clipboard.read().then(items => {
                          for (const item of items) {
                            if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                              item.getType('image/png').then(blob => {
                                const file = new File([blob], 'pasted-image.png', { type: 'image/png' });
                                handleImageUpload(file);
                              });
                            }
                          }
                        })} className="p-2 hover:bg-gray-200 rounded" title="Paste Image">
                          <span className="text-sm">📋</span>
                        </button>
                        <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Drag & Drop (Active)">
                          <span className="text-sm">📁</span>
                        </button>
                      </div>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      {/* Math & Symbols */}
                      <div className="flex items-center space-x-1">
                        <button type="button" onClick={handleLatexButton} className="p-2 hover:bg-gray-200 rounded" title="LaTeX Math">
                          <span className="text-sm">Σ</span>
                        </button>
                        <button type="button" onClick={() => insertLatex('\\frac{a}{b}')} className="p-2 hover:bg-gray-200 rounded" title="Fractions">
                          <span className="text-sm">⅟</span>
                        </button>
                        <button type="button" onClick={() => insertLatex('\\sqrt{x}')} className="p-2 hover:bg-gray-200 rounded" title="Square Root">
                          <span className="text-sm">√</span>
                        </button>
                        <button type="button" onClick={() => insertLatex('x^2')} className="p-2 hover:bg-gray-200 rounded" title="Power">
                          <span className="text-sm">x²</span>
                        </button>
                      </div>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      {/* Special Symbols for Government Exams */}
                      <div className="flex items-center space-x-1">
                        <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Arrow">
                          <span className="text-sm">→</span>
                        </button>
                        <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Checkmark">
                          <span className="text-sm">✓</span>
                        </button>
                        <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Cross">
                          <span className="text-sm">✗</span>
                        </button>
                        <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Star">
                          <span className="text-sm">★</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Enhanced Question Text Area with Image Support */}
                    <div className="relative">
                      <textarea
                        name="questionText"
                        className="w-full p-4 border-0 focus:ring-0 resize-none text-gray-900 bg-white"
                        rows={8}
                        placeholder="Type your question here... You can paste images directly or use the toolbar above to insert them."
                        value={questionForm.text}
                        onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                        onPaste={handlePasteImage}
                        onDrop={handleDropImage}
                        onDragOver={(e) => e.preventDefault()}
                        required
                        style={{ color: '#171717', backgroundColor: '#ffffff' }}
                      />
                      
                      {/* Image Upload Zone */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg m-2 h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="text-center text-gray-500">
                            <div className="text-2xl mb-2">📷</div>
                            <div className="text-sm">Drop images here or paste from clipboard</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                                         {/* LaTeX Preview */}
                     {questionForm.text.includes('\\') && (
                       <div className="bg-blue-50 border-t border-blue-200 p-3">
                         <div className="text-sm font-medium text-blue-800 mb-2">LaTeX Preview:</div>
                         <div className="bg-white p-2 rounded border">
                           <code className="text-sm text-blue-600">{questionForm.text}</code>
                         </div>
                       </div>
                     )}
                     
                     {/* LaTeX Editor Modal */}
                     {showLatexEditor && (
                       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                         <div className="bg-white rounded-lg p-6 w-full max-w-md">
                           <h3 className="text-lg font-semibold mb-4">Insert LaTeX Formula</h3>
                           <div className="space-y-4">
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">LaTeX Code:</label>
                               <input
                                 type="text"
                                 placeholder="e.g., \\frac{a}{b}, \\sqrt{x}, x^2"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                 onChange={(e) => setLatexPreview(e.target.value)}
                               />
                             </div>
                             <div className="flex space-x-2">
                               <button
                                 type="button"
                                 onClick={() => {
                                   insertLatex(latexPreview);
                                   setShowLatexEditor(false);
                                   setLatexPreview('');
                                 }}
                                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                               >
                                 Insert
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setShowLatexEditor(false)}
                                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                               >
                                 Cancel
                               </button>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                  </div>
                </div>

                {/* Exam Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    value={questionForm.exam}
                    onChange={(e) => setQuestionForm({...questionForm, exam: e.target.value})}
                    required
                    style={{ color: '#171717', backgroundColor: '#ffffff' }}
                  >
                    <option value="">Select Exam</option>
                    <option value="rrb-alp">RRB ALP</option>
                    <option value="rrb-je">RRB JE</option>
                    <option value="rrb-technician">RRB Technician</option>
                    <option value="rrb-ntpc">RRB NTPC</option>
                    <option value="ssc-cgl">SSC CGL</option>
                    <option value="ssc-chsl">SSC CHSL</option>
                    <option value="bank-po">Bank PO</option>
                    <option value="bank-clerk">Bank Clerk</option>
                    <option value="upsc">UPSC</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* Question Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="questionType"
                        value="multiple-choice"
                        defaultChecked
                        className="mr-2"
                      />
                      <div>
                        <div className="font-medium text-sm">Multiple Choice</div>
                        <div className="text-xs text-gray-500">A, B, C, D options</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="questionType"
                        value="true-false"
                        className="mr-2"
                      />
                      <div>
                        <div className="font-medium text-sm">True/False</div>
                        <div className="text-xs text-gray-500">True or False</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="questionType"
                        value="fill-blank"
                        className="mr-2"
                      />
                      <div>
                        <div className="font-medium text-sm">Fill in Blank</div>
                        <div className="text-xs text-gray-500">Short answer</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="questionType"
                        value="match-columns"
                        className="mr-2"
                      />
                      <div>
                        <div className="font-medium text-sm">Match Columns</div>
                        <div className="text-xs text-gray-500">A-B matching</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Options Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options *
                  </label>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">⋮⋮</span>
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={option}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1 border border-gray-300 rounded-lg">
                          <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-2">
                            <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Bold">
                              <strong className="text-sm">B</strong>
                            </button>
                            <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Italic">
                              <em className="text-sm">I</em>
                            </button>
                            <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Insert Image">
                              <span className="text-sm">📷</span>
                            </button>
                            <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Math">
                              <span className="text-sm">Σ</span>
                            </button>
                          </div>
                          <textarea
                            className="w-full p-3 border-0 focus:ring-0 resize-none text-gray-900 bg-white"
                            rows={2}
                            placeholder={`Option ${option}`}
                            value={questionForm.options.split('\n')[index] || ''}
                            onChange={(e) => {
                              const options = questionForm.options.split('\n');
                              options[index] = e.target.value;
                              setQuestionForm({...questionForm, options: options.join('\n')});
                            }}
                            required
                            style={{ color: '#171717', backgroundColor: '#ffffff' }}
                          />
                        </div>
                        <input
                          type="number"
                          className="w-16 p-2 border border-gray-300 rounded text-center text-gray-500"
                          placeholder="00"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button type="button" className="text-blue-600 hover:text-blue-700 text-sm">
                      + Add more option
                    </button>
                  </div>
                </div>

                {/* Solution Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    {/* Solution Tabs */}
                    <div className="flex border-b border-gray-300">
                      <button
                        type="button"
                        className="px-4 py-2 border-b-2 border-orange-500 text-orange-600 font-medium"
                      >
                        Video Solution
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Text Solution
                      </button>
                    </div>
                    
                    {/* Solution Content */}
                    <div className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input type="radio" name="solutionType" value="map" className="mr-2" defaultChecked />
                            Map Content
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="solutionType" value="browse" className="mr-2" />
                            Browse
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attach file for English
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="file"
                              className="flex-1 p-2 border border-gray-300 rounded"
                              accept="video/*,image/*,.pdf,.doc,.docx"
                            />
                            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                              Browse
                            </button>
                          </div>
                        </div>
                        
                        <button type="button" className="text-blue-600 hover:text-blue-700 text-sm">
                          + Add More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mandatory Tags Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mandatory Tags *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={questionForm.subject}
                        onChange={(e) => setQuestionForm({...questionForm, subject: e.target.value})}
                        required
                        style={{ color: '#171717', backgroundColor: '#ffffff' }}
                      >
                        <option value="">Select Subject</option>
                        <option value="general-knowledge">General Knowledge</option>
                        <option value="reasoning">Reasoning</option>
                        <option value="english">English</option>
                        <option value="quantitative-aptitude">Quantitative Aptitude</option>
                        <option value="current-affairs">Current Affairs</option>
                        <option value="history">History</option>
                        <option value="geography">Geography</option>
                        <option value="polity">Polity</option>
                        <option value="economics">Economics</option>
                        <option value="science">Science</option>
                        <option value="computer-awareness">Computer Awareness</option>
                      </select>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Topic (e.g., Blood Relations, Coding-Decoding)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                        style={{ color: '#171717', backgroundColor: '#ffffff' }}
                      />
                    </div>
                    
                    <div>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white" style={{ color: '#171717', backgroundColor: '#ffffff' }}>
                        <option value="">Select Exam Category</option>
                        <option value="rrb">RRB (Railway)</option>
                        <option value="ssc">SSC</option>
                        <option value="bank">Banking</option>
                        <option value="upsc">UPSC</option>
                        <option value="state-pcs">State PCS</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={questionForm.blooms}
                        onChange={(e) => setQuestionForm({...questionForm, blooms: e.target.value})}
                        required
                      >
                        <option value="">Select Bloom</option>
                        <option value="remember">Remember</option>
                        <option value="understand">Understand</option>
                        <option value="apply">Apply</option>
                        <option value="analyze">Analyze</option>
                        <option value="evaluate">Evaluate</option>
                        <option value="create">Create</option>
                      </select>
                    </div>
                    
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={questionForm.difficulty}
                        onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                        required
                      >
                        <option value="">Select Difficulty level</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Time to solve"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={questionForm.timeLimit}
                        onChange={(e) => setQuestionForm({...questionForm, timeLimit: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Add More Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add More Tags
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add Tag"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={questionForm.tags}
                      onChange={(e) => setQuestionForm({...questionForm, tags: e.target.value})}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    disabled={creatingQuestion}
                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingQuestion ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {currentView === 'upload' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Questions</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Questions File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="space-y-4">
                      <div className="text-4xl">📁</div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload any format! The system automatically detects and adapts to your file structure. 
                          Common formats: CSV, XLSX, XLS. Any column names will work.
                        </p>
                      </div>
                      {selectedFile && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            Selected file: <strong>{selectedFile.name}</strong>
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="*/*"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Flexible Format Examples:</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-blue-700">Standard Format:</p>
                      <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
{`text,options,answer,subject,exam,difficulty,tags,marks,timeLimit,blooms
"What is 2+2?",["4","5","6","7"],"4",mathematics,jee,easy,"basic math,addition",2,30,remember`}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-700">Alternative Column Names (all work):</p>
                      <p className="text-xs text-blue-700">
                        Question/Question Text, Choices/Options, Correct Answer/Solution, Topic/Subject, 
                        Exam Type/Test, Level/Difficulty, Keywords/Tags, Points/Marks, Duration/Time Limit, 
                        Bloom's/Cognitive Level
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-700">Options Formats (all work):</p>
                      <p className="text-xs text-blue-700">
                        ["A","B","C","D"] or "A,B,C,D" or "A;B;C;D" or "A|B|C|D"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleBulkUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload Questions'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentView === 'questions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Questions Management</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Search & Filter Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Questions</label>
                    <input
                      type="text"
                      placeholder="Type to search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      style={{ color: '#171717', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Subject</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={filters.subject}
                      onChange={(e) => setFilters({...filters, subject: e.target.value})}
                      style={{ color: '#171717', backgroundColor: '#ffffff' }}
                    >
                      <option value="">All Subjects</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="physics">Physics</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="biology">Biology</option>
                      <option value="english">English</option>
                      <option value="general-knowledge">General Knowledge</option>
                      <option value="reasoning">Reasoning</option>
                      <option value="computer-science">Computer Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Exam</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={filters.exam}
                      onChange={(e) => setFilters({...filters, exam: e.target.value})}
                      style={{ color: '#171717', backgroundColor: '#ffffff' }}
                    >
                      <option value="">All Exams</option>
                      <option value="rrb-alp">RRB ALP</option>
                      <option value="rrb-je">RRB JE</option>
                      <option value="rrb-technician">RRB Technician</option>
                      <option value="rrb-ntpc">RRB NTPC</option>
                      <option value="ssc-cgl">SSC CGL</option>
                      <option value="ssc-chsl">SSC CHSL</option>
                      <option value="bank-po">Bank PO</option>
                      <option value="bank-clerk">Bank Clerk</option>
                      <option value="upsc">UPSC</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Difficulty</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={filters.difficulty}
                      onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                      style={{ color: '#171717', backgroundColor: '#ffffff' }}
                    >
                      <option value="">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                {/* Active Filters Display */}
                {(searchTerm || filters.subject || filters.exam || filters.difficulty) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Search: "{searchTerm}" <button onClick={() => setSearchTerm('')} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                        </span>
                      )}
                      {filters.subject && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Subject: {filters.subject} <button onClick={() => setFilters({...filters, subject: ''})} className="ml-1 text-green-600 hover:text-green-800">×</button>
                        </span>
                      )}
                      {filters.exam && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Exam: {filters.exam} <button onClick={() => setFilters({...filters, exam: ''})} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
                        </span>
                      )}
                      {filters.difficulty && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Difficulty: {filters.difficulty} <button onClick={() => setFilters({...filters, difficulty: ''})} className="ml-1 text-orange-600 hover:text-orange-800">×</button>
                        </span>
                      )}
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setFilters({subject: '', exam: '', difficulty: '', blooms: ''});
                        }}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">📝 Questions ({filteredQuestions.length})</h3>
                  <span className="text-sm text-gray-500">Total: {questions.length}</span>
                </div>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  onClick={() => setCurrentView('create')}
                >
                  <span>➕</span>
                  <span>Add New Question</span>
                </button>
              </div>

              <div className="space-y-4">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="space-y-4">
                        {/* Question Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-medium text-gray-900 text-lg leading-relaxed">{question.text}</h3>
                              <div className="flex items-center space-x-2 ml-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                  question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {question.difficulty}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {question.marks} mark{question.marks > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200 hover:border-blue-300 transition-colors">
                              ✏️ Edit
                            </button>
                            <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md border border-red-200 hover:border-red-300 transition-colors">
                              🗑️ Delete
                            </button>
                          </div>
                        </div>

                        {/* Question Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">📚</span>
                            <span className="font-medium text-gray-700">{question.subject}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">🎯</span>
                            <span className="font-medium text-gray-700">{question.exam}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">⏱️</span>
                            <span className="font-medium text-gray-700">{question.timeLimit}s</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">🏷️</span>
                            <span className="font-medium text-gray-700">{question.blooms}</span>
                          </div>
                        </div>

                        {/* Options Section */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">📋 Answer Options:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options && question.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className={`flex-1 p-2 rounded border ${
                                  option === question.answer ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-200'
                                }`}>
                                  {option}
                                  {option === question.answer && (
                                    <span className="ml-2 text-green-600">✓ Correct</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Correct Answer */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">✅ Correct Answer:</h4>
                          <p className="text-green-700 font-medium">{question.answer}</p>
                        </div>

                        {/* Solution Section */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-2">💡 Solution:</h4>
                          <div className="text-purple-700">
                            {question.solution ? (
                              <p>{question.solution}</p>
                            ) : (
                              <p className="text-gray-500 italic">No solution provided</p>
                            )}
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Tags */}
                          {question.tags && question.tags.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-medium text-gray-800 mb-2">🏷️ Tags:</h4>
                              <div className="flex flex-wrap gap-1">
                                {question.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Image */}
                          {question.imageUrl && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-medium text-gray-800 mb-2">🖼️ Question Image:</h4>
                              <img 
                                src={question.imageUrl} 
                                alt="Question" 
                                className="max-w-full h-auto rounded border"
                                style={{ maxHeight: '200px' }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Question ID */}
                        <div className="text-xs text-gray-500 border-t pt-2">
                          Question ID: {question._id}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-gray-600">
                      {questions.length > 0 ? 'No questions match your search criteria.' : 'No questions found. Create your first question!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Exams Management Section */}
        {currentView === 'exams' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Exam Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* RRB Exams */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RRB Exams</h3>
                <div className="space-y-3">
                  {['rrb-je', 'rrb-alp', 'rrb-technician', 'rrb-ntpc'].map((exam) => {
                    const examQuestions = questions.filter(q => q.exam === exam);
                    return (
                      <div key={exam} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">{exam.toUpperCase().replace('-', ' ')}</span>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">{examQuestions.length} questions</span>
                          <div className="text-xs text-blue-600">Active</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SSC Exams */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SSC Exams</h3>
                <div className="space-y-3">
                  {['ssc-cgl', 'ssc-chsl'].map((exam) => {
                    const examQuestions = questions.filter(q => q.exam === exam);
                    return (
                      <div key={exam} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">{exam.toUpperCase().replace('-', ' ')}</span>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">{examQuestions.length} questions</span>
                          <div className="text-xs text-green-600">Active</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content Modules */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Modules</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Practice Questions</span>
                    <span className="text-sm text-gray-600">{questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Subjects Covered</span>
                    <span className="text-sm text-gray-600">{new Set(questions.map(q => q.subject)).size}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Total Marks</span>
                    <span className="text-sm text-gray-600">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Avg Difficulty</span>
                    <span className="text-sm text-gray-600">
                      {questions.length > 0 ? 
                        questions.reduce((sum, q) => {
                          const difficultyScore = q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3;
                          return sum + difficultyScore;
                        }, 0) / questions.length : 0
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Key Metrics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects Covered</span>
                    <span className="font-semibold">{new Set(questions.map(q => q.subject)).size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exams Covered</span>
                    <span className="font-semibold">{new Set(questions.map(q => q.exam)).size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Marks</span>
                    <span className="font-semibold">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Distribution</h3>
                <div className="space-y-4">
                  {(() => {
                    const easyCount = questions.filter(q => q.difficulty === 'easy').length;
                    const mediumCount = questions.filter(q => q.difficulty === 'medium').length;
                    const hardCount = questions.filter(q => q.difficulty === 'hard').length;
                    const total = questions.length;
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Easy</span>
                          <span className="font-semibold text-green-600">{easyCount} ({total > 0 ? Math.round((easyCount/total)*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medium</span>
                          <span className="font-semibold text-yellow-600">{mediumCount} ({total > 0 ? Math.round((mediumCount/total)*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hard</span>
                          <span className="font-semibold text-red-600">{hardCount} ({total > 0 ? Math.round((hardCount/total)*100) : 0}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Time/Question</span>
                          <span className="font-semibold">{questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + q.timeLimit, 0) / questions.length) : 0}s</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Distribution</h3>
                <div className="space-y-4">
                  {(() => {
                    const subjectCounts: { [key: string]: number } = {};
                    questions.forEach(q => {
                      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
                    });
                    const sortedSubjects = Object.entries(subjectCounts)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 4);
                    
                    return sortedSubjects.map(([subject, count]) => (
                      <div key={subject} className="flex justify-between">
                        <span className="text-gray-600">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                        <span className="font-semibold">{count} ({questions.length > 0 ? Math.round((count as number/questions.length)*100) : 0}%)</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Distribution</h3>
                <div className="space-y-4">
                  {(() => {
                    const examCounts: { [key: string]: number } = {};
                    questions.forEach(q => {
                      examCounts[q.exam] = (examCounts[q.exam] || 0) + 1;
                    });
                    const sortedExams = Object.entries(examCounts)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 4);
                    
                    return sortedExams.map(([exam, count]) => (
                      <div key={exam} className="flex justify-between">
                        <span className="text-gray-600">{exam.toUpperCase().replace('-', ' ')}</span>
                        <span className="font-semibold">{count} ({questions.length > 0 ? Math.round((count as number/questions.length)*100) : 0}%)</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        {currentView === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Question Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects Covered</span>
                    <span className="font-semibold text-blue-600">{new Set(questions.map(q => q.subject)).size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exams Covered</span>
                    <span className="font-semibold text-orange-600">{new Set(questions.map(q => q.exam)).size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Marks</span>
                    <span className="font-semibold text-green-600">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                  </div>
                </div>
              </div>

              {/* Difficulty Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Analysis</h3>
                <div className="space-y-4">
                  {(() => {
                    const easyCount = questions.filter(q => q.difficulty === 'easy').length;
                    const mediumCount = questions.filter(q => q.difficulty === 'medium').length;
                    const hardCount = questions.filter(q => q.difficulty === 'hard').length;
                    const total = questions.length;
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Easy Questions</span>
                          <span className="font-semibold text-green-600">{easyCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medium Questions</span>
                          <span className="font-semibold text-yellow-600">{mediumCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hard Questions</span>
                          <span className="font-semibold text-red-600">{hardCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Time/Question</span>
                          <span className="font-semibold">{questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + q.timeLimit, 0) / questions.length) : 0}s</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Content Coverage */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Coverage</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">RRB Exams</span>
                    <span className="font-semibold">{questions.filter(q => q.exam.includes('rrb')).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SSC Exams</span>
                    <span className="font-semibold">{questions.filter(q => q.exam.includes('ssc')).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Exams</span>
                    <span className="font-semibold">{questions.filter(q => q.exam.includes('bank')).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Exams</span>
                    <span className="font-semibold">{questions.filter(q => !q.exam.includes('rrb') && !q.exam.includes('ssc') && !q.exam.includes('bank')).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monetization Section */}
        {currentView === 'monetization' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Monetization & Revenue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Revenue Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Value Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions</span>
                    <span className="font-semibold text-green-600">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Marks</span>
                    <span className="font-semibold text-blue-600">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Marks/Question</span>
                    <span className="font-semibold text-purple-600">{questions.length > 0 ? Math.round((questions.reduce((sum, q) => sum + q.marks, 0) / questions.length) * 10) / 10 : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Time/Question</span>
                    <span className="font-semibold text-green-600">{questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + q.timeLimit, 0) / questions.length) : 0}s</span>
                  </div>
                </div>
              </div>

              {/* PrepLens+ Analytics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">PrepLens+ Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Subscriptions</span>
                    <span className="font-semibold">2,778</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Subscriptions</span>
                    <span className="font-semibold text-green-600">2,456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-semibold text-blue-600">18.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Revenue/User</span>
                    <span className="font-semibold">₹299</span>
                  </div>
                </div>
              </div>

              {/* Exam-wise Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam-wise Revenue</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SSC CGL</span>
                    <span className="font-semibold">₹3,45,678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RRB JE</span>
                    <span className="font-semibold">₹2,34,567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SSC CHSL</span>
                    <span className="font-semibold">₹1,56,789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RRB ALP</span>
                    <span className="font-semibold">₹95,422</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">UPI</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credit/Debit Cards</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Banking</span>
                    <span className="font-semibold">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallets</span>
                    <span className="font-semibold">2%</span>
                  </div>
                </div>
              </div>

              {/* Referral Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Program</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Referral Revenue</span>
                    <span className="font-semibold text-green-600">₹36,900</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referral Commission</span>
                    <span className="font-semibold text-blue-600">₹29.90</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Successful Referrals</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-semibold text-purple-600">35.7%</span>
                  </div>
                </div>
              </div>

              {/* Revenue Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">January</span>
                    <span className="font-semibold">₹89,456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">February</span>
                    <span className="font-semibold">₹92,345</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">March</span>
                    <span className="font-semibold">₹1,23,456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">April</span>
                    <span className="font-semibold text-green-600">₹1,45,678</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
