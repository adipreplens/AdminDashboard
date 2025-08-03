'use client';

import { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  onInsertLatex?: (latex: string) => void;
  placeholder?: string;
  label?: string;
}

export default function MathEditor({ value, onChange, onInsertLatex, placeholder = "Enter math expression...", label = "Math Expression" }: MathEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Math symbols with their LaTeX representations
  const mathSymbols = [
    // Basic Operations
    { symbol: '+', latex: '+', label: 'Plus' },
    { symbol: '-', latex: '-', label: 'Minus' },
    { symbol: '×', latex: '\\times', label: 'Multiply' },
    { symbol: '÷', latex: '\\div', label: 'Divide' },
    { symbol: '=', latex: '=', label: 'Equals' },
    
    // Fractions and Powers
    { symbol: '\\frac{a}{b}', latex: '\\frac{a}{b}', label: 'Fraction' },
    { symbol: 'x^2', latex: 'x^2', label: 'Square' },
    { symbol: 'x^n', latex: 'x^n', label: 'Power' },
    { symbol: 'x_n', latex: 'x_n', label: 'Subscript' },
    { symbol: 'x^y_z', latex: 'x^y_z', label: 'Power & Sub' },
    
    // Roots and Special Symbols
    { symbol: '\\sqrt{x}', latex: '\\sqrt{x}', label: 'Square Root' },
    { symbol: '\\sqrt[n]{x}', latex: '\\sqrt[n]{x}', label: 'nth Root' },
    { symbol: '\\pi', latex: '\\pi', label: 'Pi' },
    { symbol: '\\infty', latex: '\\infty', label: 'Infinity' },
    { symbol: '\\sum', latex: '\\sum', label: 'Sum' },
    { symbol: '\\int', latex: '\\int', label: 'Integral' },
    { symbol: '\\prod', latex: '\\prod', label: 'Product' },
    
    // Greek Letters
    { symbol: '\\alpha', latex: '\\alpha', label: 'Alpha' },
    { symbol: '\\beta', latex: '\\beta', label: 'Beta' },
    { symbol: '\\gamma', latex: '\\gamma', label: 'Gamma' },
    { symbol: '\\delta', latex: '\\delta', label: 'Delta' },
    { symbol: '\\theta', latex: '\\theta', label: 'Theta' },
    { symbol: '\\lambda', latex: '\\lambda', label: 'Lambda' },
    { symbol: '\\mu', latex: '\\mu', label: 'Mu' },
    { symbol: '\\sigma', latex: '\\sigma', label: 'Sigma' },
    { symbol: '\\phi', latex: '\\phi', label: 'Phi' },
    { symbol: '\\omega', latex: '\\omega', label: 'Omega' },
    
    // Advanced Math
    { symbol: '\\lim_{x \\to a}', latex: '\\lim_{x \\to a}', label: 'Limit' },
    { symbol: '\\frac{d}{dx}', latex: '\\frac{d}{dx}', label: 'Derivative' },
    { symbol: '\\frac{\\partial}{\\partial x}', latex: '\\frac{\\partial}{\\partial x}', label: 'Partial' },
    { symbol: '\\vec{v}', latex: '\\vec{v}', label: 'Vector' },
    { symbol: '\\overline{x}', latex: '\\overline{x}', label: 'Overline' },
    { symbol: '\\underline{x}', latex: '\\underline{x}', label: 'Underline' },
    
    // Set Operations
    { symbol: '\\cap', latex: '\\cap', label: 'Intersection' },
    { symbol: '\\cup', latex: '\\cup', label: 'Union' },
    { symbol: '\\subset', latex: '\\subset', label: 'Subset' },
    { symbol: '\\supset', latex: '\\supset', label: 'Superset' },
    { symbol: '\\in', latex: '\\in', label: 'Element' },
    { symbol: '\\notin', latex: '\\notin', label: 'Not Element' },
    
    // Logic
    { symbol: '\\land', latex: '\\land', label: 'And' },
    { symbol: '\\lor', latex: '\\lor', label: 'Or' },
    { symbol: '\\neg', latex: '\\neg', label: 'Not' },
    { symbol: '\\implies', latex: '\\implies', label: 'Implies' },
    { symbol: '\\iff', latex: '\\iff', label: 'Iff' },
    { symbol: '\\forall', latex: '\\forall', label: 'For All' },
    { symbol: '\\exists', latex: '\\exists', label: 'Exists' },
    
    // Grouping
    { symbol: '(', latex: '(', label: 'Left Paren' },
    { symbol: ')', latex: ')', label: 'Right Paren' },
    { symbol: '[', latex: '[', label: 'Left Bracket' },
    { symbol: ']', latex: ']', label: 'Right Bracket' },
    { symbol: '\\{', latex: '\\{', label: 'Left Brace' },
    { symbol: '\\}', latex: '\\}', label: 'Right Brace' },
  ];

  const insertSymbol = (latex: string) => {
    onChange(value + ' ' + latex + ' ');
  };

  const handleChange = (newValue: string) => {
    setError(null);
    onChange(newValue);
  };

  const renderMath = () => {
    try {
      if (!value.trim()) return null;
      
      // Clean up the LaTeX expression
      let cleanValue = value.trim();
      
      // Handle common LaTeX patterns
      cleanValue = cleanValue
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}') // Fix fraction syntax
        .replace(/\\sqrt\{([^}]+)\}/g, '\\sqrt{$1}') // Fix sqrt syntax
        .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '\\sum_{$1}^{$2}') // Fix sum syntax
        .replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '\\int_{$1}^{$2}'); // Fix integral syntax
      
      return <InlineMath math={cleanValue} />;
    } catch (err) {
      console.error('LaTeX rendering error:', err);
      setError('Invalid math expression');
      return null;
    }
  };

  return (
    <div className="space-y-4">
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
        <div className="space-y-4">
          {/* Math Symbol Grid */}
          <div className="grid grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg">
            {mathSymbols.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => insertSymbol(item.latex)}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center justify-center min-h-[60px]"
                title={item.label}
              >
                <div className="text-lg mb-1">
                  <InlineMath math={item.symbol} />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
          
          {/* Input and Live Preview */}
          <div className="space-y-3">
            <textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            
            {/* Live Preview */}
            {value.trim() && (
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500 mb-2">Live Preview:</div>
                <div className="text-lg">
                  {renderMath() || <span className="text-red-500">Invalid LaTeX</span>}
                </div>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => onInsertLatex && onInsertLatex(value)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 mt-2"
          >
            Add to LaTeX
          </button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <div className="text-xs text-gray-500">
        <p>💡 <strong>Tips:</strong> Click any symbol above to insert it, or type LaTeX directly in the text area.</p>
        <p>Examples: "x^2 + y^2 = z^2", "\\frac{a}{b}", "\\sum_{i=1}^{n} x_i"</p>
      </div>
    </div>
  );
} 