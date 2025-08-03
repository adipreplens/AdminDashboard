import React, { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import MathEditor from './MathEditor';
import ImageUploader from './ImageUploader';

// Import ReactQuill with SSR disabled to prevent Netlify deployment issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse">Loading editor...</div>
});

// Import CSS only on client side
if (typeof window !== 'undefined') {
  require('react-quill/dist/quill.snow.css');
}

interface CreateQuestionFormProps {
  onSuccess?: () => void;
}

const CreateQuestionForm: React.FC<CreateQuestionFormProps> = ({ onSuccess }) => {
  const questionQuillRef = useRef<any>(null);
  const solutionQuillRef = useRef<any>(null);
  const [questionType, setQuestionType] = useState<'static' | 'power'>('static');
  const [questionText, setQuestionText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [diagramFile, setDiagramFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [options, setOptions] = useState(['', '', '', '']);
  const [optionImages, setOptionImages] = useState<{[key: number]: string}>({});
  const [uploadingOptions, setUploadingOptions] = useState<{[key: number]: boolean}>({});
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [marks, setMarks] = useState('');
  const [timer, setTimer] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showMathEditor, setShowMathEditor] = useState(false);
  const [mathEditorTarget, setMathEditorTarget] = useState<'question' | 'solution' | 'option'>('question');
  const [mathEditorOptionIndex, setMathEditorOptionIndex] = useState<number>(0);

  // Memoize modules to prevent re-renders
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            if (!input.files || input.files.length === 0) return;
            const file = input.files[0];
            const formData = new FormData();
            formData.append('image', file);
            try {
              const res = await fetch('https://admindashboard-x0hk.onrender.com/upload-image', {
                method: 'POST',
                body: formData,
              });
              const data = await res.json();
              if (data.imageUrl) {
                // Try to insert into the active editor
                const activeRef = questionQuillRef.current || solutionQuillRef.current;
                if (activeRef) {
                  const range = activeRef.getSelection();
                  activeRef.insertEmbed(range ? range.index : 0, 'image', data.imageUrl);
                }
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              alert('Failed to upload image');
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false,
      matchers: [
        ['img', (node: any, delta: any) => {
          // Handle pasted images
          if (node.src) {
            return delta.insert({ image: node.src });
          }
          return delta;
        }]
      ]
    }
  }), []);

  // Memoize formats to prevent re-renders
  const formats = useMemo(() => [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'image'
  ], []);

  // Stable change handlers
  const handleQuestionTextChange = useCallback((value: string) => {
    setQuestionText(value);
  }, []);

  const handleSolutionTextChange = useCallback((value: string) => {
    setSolutionText(value);
  }, []);

  // Image upload handler
  const handleImageChange = (file: File | null, imageUrl: string | null) => {
    setDiagramFile(file);
    setImageUrl(imageUrl);
  };

  // Option change handler
  const handleOptionChange = (idx: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => (i === idx ? value : opt)));
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-6">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold border ${questionType === 'static' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          onClick={() => setQuestionType('static')}
        >
          Static Question
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold border ${questionType === 'power' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          onClick={() => setQuestionType('power')}
        >
          Power Question
        </button>
      </div>
      
      {questionType === 'static' ? (
        <div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Question Text (with image support):</label>
            <ReactQuill
              ref={questionQuillRef}
              value={questionText}
              onChange={handleQuestionTextChange}
              modules={modules}
              formats={formats}
              theme="snow"
              placeholder="Type your question here..."
              style={{ minHeight: 150, marginBottom: 24 }}
            />
          </div>
          
          <div className="mt-4">
            <ImageUploader
              onImageChange={handleImageChange}
              currentImageUrl={imageUrl}
            />
          </div>
          
          <div className="mt-4">
            <label className="block font-semibold mb-2">Options:</label>
            {[0, 1, 2, 3].map(idx => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === idx}
                  onChange={() => setCorrectAnswer(idx)}
                  className="accent-blue-600"
                />
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded"
                  placeholder={`Option ${idx + 1}`}
                  value={options[idx]}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <label className="block font-semibold mb-2">Solution:</label>
            <ReactQuill
              ref={solutionQuillRef}
              value={solutionText}
              onChange={handleSolutionTextChange}
              modules={modules}
              formats={formats}
              theme="snow"
              placeholder="Type your solution here..."
              style={{ minHeight: 100, marginBottom: 24 }}
            />
          </div>
          
          <button 
            type="button" 
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => console.log('Question submitted:', { questionText, options, correctAnswer, solutionText })}
          >
            Submit Question
          </button>
        </div>
      ) : (
        <div className="text-gray-500 text-lg text-center py-12">Power Question creation coming soon!</div>
      )}
    </div>
  );
};

export default CreateQuestionForm; 