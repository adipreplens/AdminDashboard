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
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <div className="text-xs text-gray-500">
        <p>LaTeX Examples:</p>
        <ul className="mt-1 space-y-1">
          <li>• Inline: <code>$x^2 + y^2 = z^2$</code></li>
          <li>• Block: <code>$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$</code></li>
          <li>• Fractions: <code>$\frac{a}{b}$</code></li>
          <li>• Greek: <code>$\alpha, \beta, \gamma$</code></li>
        </ul>
      </div>
    </div>
  );
} 