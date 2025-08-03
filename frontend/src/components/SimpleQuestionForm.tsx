import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

interface SimpleQuestionFormProps {
  onSuccess?: () => void;
}

const SimpleQuestionForm: React.FC<SimpleQuestionFormProps> = ({ onSuccess }) => {
  const [questionText, setQuestionText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [marks, setMarks] = useState('');
  const [timer, setTimer] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Image upload handler
  const handleImageChange = (file: File | null, imageUrl: string | null) => {
    setImageUrl(imageUrl);
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
      imageUrl,
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
        setImageUrl(null);
        if (onSuccess) onSuccess();
      } else {
        alert('Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
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
        </div>
        
        <div>
          <ImageUploader
            onImageChange={handleImageChange}
            currentImageUrl={imageUrl}
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Options: <span className="text-red-500">*</span></label>
          {[0, 1, 2, 3].map(idx => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={correctAnswer === idx}
                onChange={() => setCorrectAnswer(idx)}
                className="accent-blue-600"
                required
              />
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded"
                placeholder={`Option ${idx + 1}`}
                value={options[idx]}
                onChange={e => handleOptionChange(idx, e.target.value)}
                required
              />
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