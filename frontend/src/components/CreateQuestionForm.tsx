import React, { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import MathEditor from './MathEditor';
import ImageUploader from './ImageUploader';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface CreateQuestionFormProps {
  onSuccess?: () => void;
}

const CreateQuestionForm: React.FC<CreateQuestionFormProps> = ({ onSuccess }) => {
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

  // Refs for Quill editors
  const questionQuillRef = useRef<any>(null);
  const solutionQuillRef = useRef<any>(null);

  // Image upload function
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('https://admindashboard-x0hk.onrender.com/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (!data.url) {
      throw new Error('Failed to upload image');
    }
    
    return data.url;
  };

  // Enhanced clipboard handler for Quill editors
  const handleQuillPaste = useCallback(async (quillRef: any, event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = items[i].getAsFile();
        if (file && quillRef) {
          try {
            setUploading(true);
            const imageUrl = await uploadImage(file);
            
            // Insert image into Quill editor
            const range = quillRef.getSelection();
            quillRef.insertEmbed(range.index, 'image', imageUrl);
            quillRef.setSelection(range.index + 1);
            
            console.log('Image pasted and uploaded:', imageUrl);
          } catch (error) {
            console.error('Error uploading pasted image:', error);
            alert('Failed to upload pasted image. Please try again.');
          } finally {
            setUploading(false);
          }
        }
        break;
      }
    }
  }, []);

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
            try {
              setUploading(true);
              const imageUrl = await uploadImage(file);
              
              // Insert image into the active Quill editor
              const activeEditor = document.querySelector('.ql-editor:focus')?.closest('.quill');
              if (activeEditor) {
                const quill = (activeEditor as any).__quill;
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', imageUrl);
                quill.setSelection(range.index + 1);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              alert('Failed to upload image. Please try again.');
            } finally {
              setUploading(false);
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false,
      matchers: [
        ['img', (node: any, delta: any) => {
          // Handle image paste in Quill
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
    // Clear error when user starts typing options
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  // Option image upload handler
  const handleOptionImageUpload = async (idx: number, file: File) => {
    try {
      setUploadingOptions(prev => ({ ...prev, [idx]: true }));
      const imageUrl = await uploadImage(file);
      
      setOptionImages(prev => ({ ...prev, [idx]: imageUrl }));
      // Add image to option text
      const imageTag = `<img src="${imageUrl}" alt="Option ${idx + 1} image" style="max-width: 200px; height: auto;" />`;
      setOptions(prev => prev.map((opt, i) => 
        i === idx ? (opt + (opt ? '<br/>' : '') + imageTag) : opt
      ));
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
    // Remove image from option text
    setOptions(prev => prev.map((opt, i) => 
      i === idx ? opt.replace(/<img[^>]*>/g, '') : opt
    ));
  };

  // Math Editor handlers
  const openMathEditor = (target: 'question' | 'solution' | 'option', optionIndex?: number) => {
    setMathEditorTarget(target);
    if (optionIndex !== undefined) {
      setMathEditorOptionIndex(optionIndex);
    }
    setShowMathEditor(true);
  };

  const handleMathInsert = (latex: string, target?: 'question' | 'solution' | 'option', optionIndex?: number) => {
    const latexExpression = latex; // Remove dollar signs, just use the LaTeX content directly
    const currentTarget = target || mathEditorTarget;
    const currentOptionIndex = optionIndex !== undefined ? optionIndex : mathEditorOptionIndex;
    
    switch (currentTarget) {
      case 'question':
        setQuestionText(prev => prev + latexExpression);
        break;
      case 'solution':
        setSolutionText(prev => prev + latexExpression);
        break;
      case 'option':
        setOptions(prev => prev.map((opt, i) => 
          i === currentOptionIndex ? opt + latexExpression : opt
        ));
        break;
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Check if question text is provided
    if (!questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    // Check if all options are filled
    const emptyOptions = options.filter(opt => !opt.trim());
    if (emptyOptions.length > 0) {
      newErrors.options = 'All options must be filled';
    }

    // Check if correct answer is selected
    if (correctAnswer === null) {
      newErrors.correctAnswer = 'Please select the correct answer';
    }

    // Check if marks are provided
    if (!marks.trim()) {
      newErrors.marks = 'Marks are required';
    } else if (parseInt(marks) <= 0) {
      newErrors.marks = 'Marks must be greater than 0';
    }

    // Check if timer is provided
    if (!timer.trim()) {
      newErrors.timer = 'Time limit is required';
    } else if (parseInt(timer) <= 0) {
      newErrors.timer = 'Time limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    
    setSubmitting(true);
    setSuccess(false);
    const questionData = {
      type: questionType,
      text: questionText,
      solution: solutionText,
      options,
      correctAnswer: correctAnswer, // Send the index (0-3) instead of text
      marks: marks ? parseInt(marks) : undefined,
      timeLimit: timer ? parseInt(timer) : undefined,
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
        setDiagramFile(null);
        setErrors({}); // Clear errors on success
        if (onSuccess) onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-6">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold border ${questionType === 'static' ? 'bg-primary-600 text-white' : 'bg-white text-primary-600'}`}
          onClick={() => setQuestionType('static')}
        >
          Static Question
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold border ${questionType === 'power' ? 'bg-primary-600 text-white' : 'bg-white text-primary-600'}`}
          onClick={() => setQuestionType('power')}
        >
          Power Question
        </button>
      </div>
      {questionType === 'static' ? (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-semibold">Question Text (with image support):</label>
            <button
              type="button"
              onClick={() => openMathEditor('question')}
              className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
            >
              <span className="text-lg">f(x)</span>
              Math Editor
            </button>
          </div>
          <div className="mb-2 text-sm text-gray-600">
            💡 <strong>Image Paste:</strong> You can paste images directly (Ctrl+V) into the question text area!
          </div>
          <ReactQuill
            ref={questionQuillRef}
            value={questionText}
            onChange={handleQuestionTextChange}
            modules={modules}
            formats={formats}
            theme="snow"
            placeholder="Type your question here... You can paste images directly (Ctrl+V)!"
            style={{ minHeight: 150, marginBottom: 24 }}
            onPaste={(e) => handleQuillPaste(questionQuillRef.current, e)}
          />
          {errors.questionText && (
            <div className="text-red-600 text-sm mt-1">{errors.questionText}</div>
          )}
          <div className="mt-4">
            <ImageUploader
              onImageChange={handleImageChange}
              currentImageUrl={imageUrl}
            />
          </div>
          <div className="mt-4">
            <label className="block font-semibold mb-2">Options: <span className="text-red-500">*</span></label>
            <div className="text-sm text-gray-600 mb-2">
              💡 <strong>Image-based options:</strong> You can paste images directly (Ctrl+V) or click the 📷 button to upload images for each option.
            </div>
            {[0, 1, 2, 3].map(idx => (
              <div key={idx} className={`flex items-center gap-2 mb-2 p-2 rounded ${correctAnswer === idx ? 'bg-green-50 border border-green-200' : ''}`}>
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === idx}
                  onChange={() => {
                    setCorrectAnswer(idx);
                    if (errors.correctAnswer) {
                      setErrors(prev => ({ ...prev, correctAnswer: '' }));
                    }
                  }}
                  className="accent-primary-600"
                />
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    className={`input-field flex-1 ${errors.options ? 'border-red-500' : ''}`}
                    placeholder={`Option ${idx + 1} - You can paste images here too!`}
                    value={options[idx]}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    onPaste={(e) => handleOptionImagePaste(idx, e)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => openMathEditor('option', idx)}
                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                    title="Add math to this option"
                  >
                    f(x)
                  </button>
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
                    <div className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      uploadingOptions[idx] 
                        ? 'bg-gray-400 text-white' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}>
                      {uploadingOptions[idx] ? '⏳' : '📷'}
                    </div>
                  </label>
                </div>
                {correctAnswer === idx && (
                  <span className="text-green-600 font-semibold text-sm">✓ Correct Answer</span>
                )}
                {optionImages[idx] && (
                  <div className="w-full mt-2 relative">
                    <img 
                      src={optionImages[idx]} 
                      alt={`Option ${idx + 1} image`}
                      className="max-w-[200px] h-auto rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
            {errors.options && (
              <div className="text-red-600 text-sm mt-1">{errors.options}</div>
            )}
            {errors.correctAnswer && (
              <div className="text-red-600 text-sm mt-1">{errors.correctAnswer}</div>
            )}
          </div>
          <div className="mt-4 flex gap-4">
            <div>
              <label className="block font-semibold mb-2">Marks:</label>
              <input
                type="number"
                className={`input-field ${errors.marks ? 'border-red-500' : ''}`}
                placeholder="Marks"
                value={marks}
                onChange={e => {
                  setMarks(e.target.value);
                  if (errors.marks) {
                    setErrors(prev => ({ ...prev, marks: '' }));
                  }
                }}
                min={0}
                required
              />
              {errors.marks && (
                <div className="text-red-600 text-sm mt-1">{errors.marks}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Timer (seconds):</label>
              <input
                type="number"
                className={`input-field ${errors.timer ? 'border-red-500' : ''}`}
                placeholder="Time in seconds"
                value={timer}
                onChange={e => {
                  setTimer(e.target.value);
                  if (errors.timer) {
                    setErrors(prev => ({ ...prev, timer: '' }));
                  }
                }}
                min={0}
                required
              />
              {errors.timer && (
                <div className="text-red-600 text-sm mt-1">{errors.timer}</div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="block font-semibold mb-2">Tags (comma separated):</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. algebra,math,ssc"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-semibold">Solution (rich text):</label>
              <button
                type="button"
                onClick={() => openMathEditor('solution')}
                className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
              >
                <span className="text-lg">f(x)</span>
                Math Editor
              </button>
            </div>
            <div className="mb-2 text-sm text-gray-600">
              💡 <strong>Image Paste:</strong> You can paste images directly (Ctrl+V) into the solution area too!
            </div>
            <ReactQuill
              ref={solutionQuillRef}
              value={solutionText}
              onChange={handleSolutionTextChange}
              modules={modules}
              formats={formats}
              theme="snow"
              placeholder="Type your solution here... You can paste images directly (Ctrl+V)!"
              style={{ minHeight: 100, marginBottom: 24 }}
              onPaste={(e) => handleQuillPaste(solutionQuillRef.current, e)}
            />
          </div>
          <button type="submit" className="btn-primary mt-6" disabled={submitting || uploading}>
            {uploading
              ? 'Uploading Image...'
              : submitting
                ? 'Submitting...'
                : 'Submit Question'}
          </button>
          {uploading && (
            <div className="text-red-600 mt-2">Please wait for the image to finish uploading before submitting.</div>
          )}
          {success && <div className="text-green-600 mt-4">Question submitted successfully!</div>}
          
          {/* Summary section */}
          {correctAnswer !== null && options[correctAnswer] && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">Question Summary:</h3>
              <div className="text-sm text-blue-700">
                <p><strong>Correct Answer:</strong> Option {['A', 'B', 'C', 'D'][correctAnswer]} - {options[correctAnswer]}</p>
                <p><strong>Marks:</strong> {marks || 'Not set'}</p>
                <p><strong>Time Limit:</strong> {timer || 'Not set'} seconds</p>
                <p><strong>Options:</strong> {options.filter(opt => opt.trim()).length}/4 filled</p>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="text-gray-500 text-lg text-center py-12">Power Question creation coming soon!</div>
      )}

      {/* Math Editor Modal */}
      <MathEditor
        isOpen={showMathEditor}
        onClose={() => setShowMathEditor(false)}
        onInsert={handleMathInsert}
        target={mathEditorTarget}
        optionIndex={mathEditorOptionIndex}
      />
    </div>
  );
};

export default CreateQuestionForm; 