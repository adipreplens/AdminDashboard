import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import MathEditor from './MathEditor';

interface SimpleQuestionFormProps {
  onSuccess?: () => void;
}

const SimpleQuestionForm: React.FC<SimpleQuestionFormProps> = ({ onSuccess }) => {
  const [questionText, setQuestionText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [questionMath, setQuestionMath] = useState('');
  const [solutionMath, setSolutionMath] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(null);
  const [solutionImageUrl, setSolutionImageUrl] = useState<string | null>(null);
  const [options, setOptions] = useState(['', '', '', '']);
  const [optionImages, setOptionImages] = useState<{[key: number]: string}>({});
  const [uploadingOptions, setUploadingOptions] = useState<{[key: number]: boolean}>({});
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [marks, setMarks] = useState('');
  const [timer, setTimer] = useState('');
  const [tags, setTags] = useState('');
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [blooms, setBlooms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Image upload handlers
  const handleQuestionImageChange = (file: File | null, imageUrl: string | null) => {
    setQuestionImageUrl(imageUrl);
  };

  const handleSolutionImageChange = (file: File | null, imageUrl: string | null) => {
    setSolutionImageUrl(imageUrl);
  };

  // Option image upload handler
  const handleOptionImageUpload = async (idx: number, file: File) => {
    try {
      setUploadingOptions(prev => ({ ...prev, [idx]: true }));
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('https://admindashboard-x0hk.onrender.com/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.imageUrl) {
        setOptionImages(prev => ({ ...prev, [idx]: data.imageUrl }));
      }
    } catch (error) {
      console.error('Error uploading option image:', error);
      alert('Failed to upload image for option ' + (idx + 1));
    } finally {
      setUploadingOptions(prev => ({ ...prev, [idx]: false }));
    }
  };

  // Option image paste handler
  const handleOptionImagePaste = async (idx: number, event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await handleOptionImageUpload(idx, file);
        }
        break;
      }
    }
  };

  // Remove option image
  const handleRemoveOptionImage = (idx: number) => {
    setOptionImages(prev => {
      const newImages = { ...prev };
      delete newImages[idx];
      return newImages;
    });
  };

  // Option change handler
  const handleOptionChange = (idx: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => (i === idx ? value : opt)));
  };

  // Check if an option is valid (has text or image)
  const isOptionValid = (idx: number) => {
    const hasText = options[idx] && options[idx].trim() !== '';
    const hasImage = optionImages[idx];
    return hasText || hasImage;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim() || !correctAnswer || !marks || !timer || !subject || !exam || !difficulty || !blooms) {
      alert('Please fill in all required fields (Question, Options, Marks, Timer, Subject, Exam, Difficulty, Blooms)');
      return;
    }

    // Check if all options have either text or image
    const invalidOptions = [];
    for (let i = 0; i < 4; i++) {
      if (!isOptionValid(i)) {
        invalidOptions.push(i + 1);
      }
    }

    if (invalidOptions.length > 0) {
      alert(`Please fill in or add images for options: ${invalidOptions.join(', ')}`);
      return;
    }
    
    setSubmitting(true);
    setSuccess(false);
    
    const questionData = {
      text: questionText,
      solution: solutionText,
      questionMath: questionMath,
      solutionMath: solutionMath,
      options,
      answer: options[correctAnswer], // Convert index to actual answer text
      subject: subject,
      exam: exam,
      difficulty: difficulty,
      marks: parseInt(marks),
      timeLimit: parseInt(timer),
      blooms: blooms,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl: questionImageUrl,
      solutionImageUrl: solutionImageUrl,
      optionImages: optionImages,
    };
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admindashboard-x0hk.onrender.com';
      const res = await fetch(`${apiUrl}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      
      if (res.ok) {
        setSuccess(true);
        setQuestionText('');
        setSolutionText('');
        setQuestionMath('');
        setSolutionMath('');
        setOptions(['', '', '', '']);
        setCorrectAnswer(null);
        setMarks('');
        setTimer('');
        setTags('');
        setQuestionImageUrl(null);
        setSolutionImageUrl(null);
        setOptionImages({});
        setSubject('');
        setExam('');
        setDifficulty('');
        setBlooms('');
        if (onSuccess) onSuccess();
      } else {
        const errorData = await res.json();
        alert(`Failed to create question: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Simple Question Form</h3>
        <p className="text-sm text-gray-600">This form works reliably on all platforms including Netlify.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Question Text: <span className="text-red-500">*</span></label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question here..."
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={6}
            required
          />
          
          {/* Question Math Editor */}
          <div className="mt-4">
            <label className="block font-semibold mb-2">Question Math Formula:</label>
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setQuestionMath('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 mr-2"
              >
                Test Quadratic Formula
              </button>
              <button
                type="button"
                onClick={() => setQuestionMath('E = mc^2')}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Test E=mc²
              </button>
            </div>
            <MathEditor
              value={questionMath}
              onChange={setQuestionMath}
              placeholder="Enter math formula (e.g., x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a})"
              label="Question Math"
            />
          </div>
          
          {/* Question Image Upload */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Image:</label>
            <ImageUploader
              onImageChange={handleQuestionImageChange}
              currentImageUrl={questionImageUrl}
            />
          </div>
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Options: <span className="text-red-500">*</span></label>
          <div className="text-sm text-gray-600 mb-3">
            💡 <strong>Image support:</strong> You can paste images directly (Ctrl+V) or upload images for each option.
          </div>
                      {[0, 1, 2, 3].map(idx => (
              <div key={idx} className={`flex items-center gap-2 mb-3 p-3 rounded-lg border ${
                correctAnswer === idx ? 'bg-green-50 border-green-200' : 
                isOptionValid(idx) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
              <input
                type="radio"
                name="correctAnswer"
                checked={correctAnswer === idx}
                onChange={() => setCorrectAnswer(idx)}
                className="accent-blue-600"
                required
              />
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  placeholder={`Option ${idx + 1}`}
                  value={options[idx]}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  onPaste={(e) => handleOptionImagePaste(idx, e)}
                  required
                />
                
                {/* Option Image Upload */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleOptionImageUpload(idx, file);
                        }
                      }}
                      className="hidden"
                      disabled={uploadingOptions[idx]}
                    />
                    <div className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                      uploadingOptions[idx] 
                        ? 'bg-gray-400 text-white' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}>
                      {uploadingOptions[idx] ? '⏳ Uploading...' : '📷 Upload Image'}
                    </div>
                  </label>
                  
                  {optionImages[idx] && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionImage(idx)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                
                {/* Option Image Preview */}
                {optionImages[idx] && (
                  <div className="mt-2">
                    <img 
                      src={optionImages[idx]} 
                      alt={`Option ${idx + 1} image`}
                      className="max-w-[200px] h-auto rounded border"
                    />
                  </div>
                )}
              </div>
              
              {correctAnswer === idx && (
                <span className="text-green-600 font-semibold text-sm">✓ Correct</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Subject: <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Exam: <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g. JEE, SSC"
              value={exam}
              onChange={e => setExam(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">Difficulty: <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Blooms Level: <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={blooms}
              onChange={e => setBlooms(e.target.value)}
              required
            >
              <option value="">Select Blooms Level</option>
              <option value="remember">Remember</option>
              <option value="understand">Understand</option>
              <option value="apply">Apply</option>
              <option value="analyze">Analyze</option>
              <option value="evaluate">Evaluate</option>
              <option value="create">Create</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-2">Marks: <span className="text-red-500">*</span></label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Marks"
              value={marks}
              onChange={e => setMarks(e.target.value)}
              min={1}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-2">Timer (seconds): <span className="text-red-500">*</span></label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Time in seconds"
              value={timer}
              onChange={e => setTimer(e.target.value)}
              min={1}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Tags (comma separated):</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g. algebra,math,ssc"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Solution:</label>
          <textarea
            value={solutionText}
            onChange={(e) => setSolutionText(e.target.value)}
            placeholder="Type your solution here..."
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={4}
          />
          
          {/* Solution Math Editor */}
          <div className="mt-4">
            <label className="block font-semibold mb-2">Solution Math Formula:</label>
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setSolutionMath('x = \\frac{-b + \\sqrt{b^2 - 4ac}}{2a} \\text{ or } x = \\frac{-b - \\sqrt{b^2 - 4ac}}{2a}')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 mr-2"
              >
                Test Solution Formula
              </button>
              <button
                type="button"
                onClick={() => setSolutionMath('\\int_{0}^{\\infty} e^{-x} dx = 1')}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Test Integral
              </button>
            </div>
            <MathEditor
              value={solutionMath}
              onChange={setSolutionMath}
              placeholder="Enter math formula for solution..."
              label="Solution Math"
            />
          </div>
          
          {/* Solution Image Upload */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Solution Image:</label>
            <ImageUploader
              onImageChange={handleSolutionImageChange}
              currentImageUrl={solutionImageUrl}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Question'}
        </button>
        
        {success && (
          <div className="text-green-600 text-center font-medium">
            Question submitted successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default SimpleQuestionForm; 