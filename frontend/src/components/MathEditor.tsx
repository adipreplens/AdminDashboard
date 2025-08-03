'use client';

import { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function MathEditor({ value, onChange, placeholder = "Enter LaTeX math...", label = "Math Expression" }: MathEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertFraction = () => {
    const fractionTemplate = '\\frac{numerator}{denominator}';
    onChange(value + fractionTemplate);
  };

  const insertSymbol = (symbol: string) => {
    onChange(value + symbol);
  };

  const handleChange = (newValue: string) => {
    setError(null);
    onChange(newValue);
  };

  const renderMath = () => {
    try {
      if (!value.trim()) return null;
      
      // Check if it's inline or block math
      const isBlock = value.includes('\\[') || value.includes('\\]') || value.includes('\\begin{') || value.includes('\\end{');
      
      if (isBlock) {
        return <BlockMath math={value} />;
      } else {
        return <InlineMath math={value} />;
      }
    } catch (err) {
      setError('Invalid LaTeX syntax');
      return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      
      {isPreview ? (
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          {renderMath() || <span className="text-gray-500">No math expression</span>}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Math Symbol Buttons */}
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={insertFraction}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Insert Fraction"
            >
              Fraction
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('x^2')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              title="x²"
            >
              x²
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('\\sqrt{x}')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              title="√x"
            >
              √x
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('\\pi')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              title="π"
            >
              π
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('\\infty')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              title="∞"
            >
              ∞
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('\\sum')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              title="∑"
            >
              ∑
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('\\int')}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              title="∫"
            >
              ∫
            </button>
          </div>
          
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <div className="text-xs text-gray-500">
        <p>LaTeX Examples: x² + y² = z², fractions, Greek letters</p>
      </div>
    </div>
  );
} 