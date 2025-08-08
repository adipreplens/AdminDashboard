'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Question {
  _id: string;
  text: string;
  options: string[];
  answer: string;
  subject: string;
  exam: string;
  difficulty: string;
  marks: number;
  timeLimit: number;
  blooms: string;
  tags: string[];
  solution?: string;
  imageUrl?: string;
}

interface Module {
  _id: string;
  name: string;
  description: string;
  exam: string;
  subject: string;
  difficulty: string;
  tags: string[];
  questions: Question[];
  totalMarks: number;
  totalTime: number;
  publishStatus: 'draft' | 'published';
  category?: string;
  topic?: string;
  moduleType: string;
  isPremium: boolean;
  language: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface ModuleCreatorProps {
  onClose: () => void;
}

const ModuleCreator: React.FC<ModuleCreatorProps> = ({ onClose }) => {
  const [step, setStep] = useState<'form' | 'selection' | 'review'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Module form data
  const [moduleData, setModuleData] = useState({
    name: '',
    description: '',
    exam: '',
    subject: '',
    difficulty: 'Medium',
    tags: [] as string[],
    category: '',
    topic: '',
    moduleType: 'practice',
    isPremium: false,
    language: 'english',
    instructions: ''
  });

  // Question selection data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    exam: '',
    difficulty: '',
    blooms: ''
  });

  // Available options
  const [subjects, setSubjects] = useState<string[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admindashboard-x0hk.onrender.com';

  // Fetch available options
  useEffect(() => {
    fetchOptions();
  }, []);

  // Fetch questions when filters change
  useEffect(() => {
    if (step === 'selection') {
      fetchQuestions();
    }
  }, [step, filters]);

  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.subject) {
      filtered = filtered.filter(q => q.subject === filters.subject);
    }
    if (filters.exam) {
      filtered = filtered.filter(q => q.exam === filters.exam);
    }
    if (filters.difficulty) {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.blooms) {
      filtered = filtered.filter(q => q.blooms === filters.blooms);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, filters]);

  const fetchOptions = async () => {
    try {
      const [subjectsRes, examsRes, difficultiesRes, tagsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/subjects`),
        fetch(`${API_BASE_URL}/exams`),
        fetch(`${API_BASE_URL}/difficulties`),
        fetch(`${API_BASE_URL}/tags`)
      ]);

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }

      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData.exams || []);
      }

      if (difficultiesRes.ok) {
        const difficultiesData = await difficultiesRes.json();
        setDifficulties(difficultiesData.difficulties || []);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setAvailableTags(tagsData.tags || []);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.exam) queryParams.append('exam', filters.exam);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.blooms) queryParams.append('blooms', filters.blooms);

      const response = await fetch(`${API_BASE_URL}/questions/all?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        setError('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleTagToggle = (tag: string) => {
    setModuleData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCreateModule = async () => {
    if (!moduleData.name || !moduleData.exam || !moduleData.subject || selectedQuestions.length === 0) {
      setError('Please fill all required fields and select at least one question');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...moduleData,
          questions: selectedQuestions,
          publishStatus: 'draft'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Module created successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      setError('Failed to create module');
    } finally {
      setLoading(false);
    }
  };

  const selectedQuestionsData = questions.filter(q => selectedQuestions.includes(q._id));
  const totalMarks = selectedQuestionsData.reduce((sum, q) => sum + (q.marks || 1), 0);
  const totalTime = selectedQuestionsData.reduce((sum, q) => sum + (q.timeLimit || 60), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Module Creator</h2>
            <p className="text-sm text-gray-600">Create exam papers from existing questions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-4 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'form' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2">Module Info</span>
            </div>
            <div className="w-8 h-1 bg-gray-200"></div>
            <div className={`flex items-center ${step === 'selection' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'selection' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2">Select Questions</span>
            </div>
            <div className="w-8 h-1 bg-gray-200"></div>
            <div className={`flex items-center ${step === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2">Review & Save</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Step 1: Module Form */}
          {step === 'form' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Name *
                  </label>
                  <input
                    type="text"
                    value={moduleData.name}
                    onChange={(e) => setModuleData({...moduleData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter module name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam *
                  </label>
                  <select
                    value={moduleData.exam}
                    onChange={(e) => setModuleData({...moduleData, exam: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Exam</option>
                    {exams.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={moduleData.subject}
                    onChange={(e) => setModuleData({...moduleData, subject: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={moduleData.difficulty}
                    onChange={(e) => setModuleData({...moduleData, difficulty: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={moduleData.description}
                  onChange={(e) => setModuleData({...moduleData, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter module description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 20).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        moduleData.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Type
                  </label>
                  <select
                    value={moduleData.moduleType}
                    onChange={(e) => setModuleData({...moduleData, moduleType: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="practice">Practice</option>
                    <option value="section_test">Section Test</option>
                    <option value="mock_test">Mock Test</option>
                    <option value="test_series">Test Series</option>
                    <option value="live_test">Live Test</option>
                    <option value="pyq">Previous Year Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={moduleData.language}
                    onChange={(e) => setModuleData({...moduleData, language: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={moduleData.isPremium}
                    onChange={(e) => setModuleData({...moduleData, isPremium: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-700">
                    Premium Content
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions (Optional)
                </label>
                <textarea
                  value={moduleData.instructions}
                  onChange={(e) => setModuleData({...moduleData, instructions: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter instructions for students"
                />
              </div>
            </div>
          )}

          {/* Step 2: Question Selection */}
          {step === 'selection' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={filters.subject}
                      onChange={(e) => setFilters({...filters, subject: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                    <select
                      value={filters.exam}
                      onChange={(e) => setFilters({...filters, exam: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Exams</option>
                      {exams.map(exam => (
                        <option key={exam} value={exam}>{exam}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Difficulties</option>
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Question List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Questions ({filteredQuestions.length})
                  </h3>
                  <span className="text-sm text-gray-600">
                    Selected: {selectedQuestions.length}
                  </span>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading questions...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredQuestions.map(question => (
                      <div
                        key={question._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedQuestions.includes(question._id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleQuestionToggle(question._id)}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question._id)}
                            onChange={() => handleQuestionToggle(question._id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {question.subject}
                                </span>
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {question.difficulty}
                                </span>
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {question.marks} marks
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-900 line-clamp-2">
                              {question.text}
                            </p>
                            {question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {question.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Module Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Name:</strong> {moduleData.name}</p>
                    <p><strong>Exam:</strong> {moduleData.exam}</p>
                    <p><strong>Subject:</strong> {moduleData.subject}</p>
                    <p><strong>Difficulty:</strong> {moduleData.difficulty}</p>
                  </div>
                  <div>
                    <p><strong>Questions:</strong> {selectedQuestions.length}</p>
                    <p><strong>Total Marks:</strong> {totalMarks}</p>
                    <p><strong>Total Time:</strong> {Math.ceil(totalTime / 60)} minutes</p>
                    <p><strong>Module Type:</strong> {moduleData.moduleType}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Questions</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedQuestionsData.map((question, index) => (
                    <div key={question._id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Question {index + 1}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {question.marks} marks
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {question.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0 flex-col sm:flex-row gap-4">
          <div className="flex space-x-3 flex-wrap gap-2">
            {step !== 'form' && (
              <button
                onClick={() => setStep(step === 'selection' ? 'form' : 'selection')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex space-x-3 flex-wrap gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
            >
              Cancel
            </button>

            {step === 'form' && (
              <button
                onClick={() => setStep('selection')}
                disabled={!moduleData.name || !moduleData.exam || !moduleData.subject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Next: Select Questions
              </button>
            )}

            {step === 'selection' && (
              <button
                onClick={() => setStep('review')}
                disabled={selectedQuestions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Next: Review & Save
              </button>
            )}

            {step === 'review' && (
              <button
                onClick={handleCreateModule}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Creating...' : 'Create Module'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCreator; 