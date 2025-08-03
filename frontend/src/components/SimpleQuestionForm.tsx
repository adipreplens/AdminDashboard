import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

interface SimpleQuestionFormProps {
  onSuccess?: () => void;
}

const SimpleQuestionForm: React.FC<SimpleQuestionFormProps> = ({ onSuccess }) => {
  const [questionText, setQuestionText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(null);
  const [solutionImageUrl, setSolutionImageUrl] = useState<string | null>(null);
  const [options, setOptions] = useState(['', '', '', '']);
  const [optionImages, setOptionImages] = useState<{[key: number]: string}>({});
  const [uploadingOptions, setUploadingOptions] = useState<{[key: number]: boolean}>({});
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [marks, setMarks] = useState('');
  const [timer, setTimer] = useState('');
  const [tags, setTags] = useState('');
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

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim() || !correctAnswer || !marks || !timer) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setSuccess(false);
    
    const questionData = {
      text: questionText,
      solution: solutionText,
      options,
      correctAnswer,
      marks: parseInt(marks),
      timeLimit: parseInt(timer),
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
        setOptions(['', '', '', '']);
        setCorrectAnswer(null);
        setMarks('');
        setTimer('');
        setTags('');
        setQuestionImageUrl(null);
        setSolutionImageUrl(null);
        setOptionImages({});
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
            <div key={idx} className={`flex items-center gap-2 mb-3 p-3 rounded-lg border ${correctAnswer === idx ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
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