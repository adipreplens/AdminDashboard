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

export default function MathEditor({ value, onChange, placeholder = "Enter math expression...", label = "Math Expression" }: MathEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple math functions that users can understand
  const insertFraction = () => {
    onChange(value + ' (numerator/denominator) ');
  };

  const insertSquare = () => {
    onChange(value + ' x² ');
  };

  const insertSquareRoot = () => {
    onChange(value + ' √x ');
  };

  const insertPi = () => {
    onChange(value + ' π ');
  };

  const insertInfinity = () => {
    onChange(value + ' ∞ ');
  };

  const insertSum = () => {
    onChange(value + ' Σ ');
  };

  const insertIntegral = () => {
    onChange(value + ' ∫ ');
  };

  const insertPlus = () => {
    onChange(value + ' + ');
  };

  const insertMinus = () => {
    onChange(value + ' - ');
  };

  const insertMultiply = () => {
    onChange(value + ' × ');
  };

  const insertDivide = () => {
    onChange(value + ' ÷ ');
  };

  const insertEquals = () => {
    onChange(value + ' = ');
  };

  const insertParentheses = () => {
    onChange(value + ' ( ) ');
  };

  const insertBrackets = () => {
    onChange(value + ' [ ] ');
  };

  const insertExponent = () => {
    onChange(value + ' x^n ');
  };

  const insertSubscript = () => {
    onChange(value + ' x_n ');
  };

  const insertGreekLetter = (letter: string) => {
    onChange(value + ` ${letter} `);
  };

  const handleChange = (newValue: string) => {
    setError(null);
    onChange(newValue);
  };

  const renderMath = () => {
    try {
      if (!value.trim()) return null;
      
      // Convert human-readable symbols to LaTeX
      let latexValue = value
        .replace(/\(numerator\/denominator\)/g, '\\frac{numerator}{denominator}')
        .replace(/x²/g, 'x^2')
        .replace(/√x/g, '\\sqrt{x}')
        .replace(/π/g, '\\pi')
        .replace(/∞/g, '\\infty')
        .replace(/Σ/g, '\\sum')
        .replace(/∫/g, '\\int')
        .replace(/×/g, '\\times')
        .replace(/÷/g, '\\div')
        .replace(/x\^n/g, 'x^n')
        .replace(/x_n/g, 'x_n')
        .replace(/α/g, '\\alpha')
        .replace(/β/g, '\\beta')
        .replace(/γ/g, '\\gamma')
        .replace(/δ/g, '\\delta')
        .replace(/θ/g, '\\theta')
        .replace(/λ/g, '\\lambda')
        .replace(/μ/g, '\\mu')
        .replace(/σ/g, '\\sigma')
        .replace(/φ/g, '\\phi')
        .replace(/ω/g, '\\omega');
      
      return <InlineMath math={latexValue} />;
    } catch (err) {
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
          {/* Basic Math Operations */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Basic Operations:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={insertPlus}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                title="Plus"
              >
                +
              </button>
              <button
                type="button"
                onClick={insertMinus}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                title="Minus"
              >
                -
              </button>
              <button
                type="button"
                onClick={insertMultiply}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Multiply"
              >
                ×
              </button>
              <button
                type="button"
                onClick={insertDivide}
                className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                title="Divide"
              >
                ÷
              </button>
              <button
                type="button"
                onClick={insertEquals}
                className="px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                title="Equals"
              >
                =
              </button>
            </div>
          </div>

          {/* Fractions and Powers */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Fractions & Powers:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={insertFraction}
                className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                title="Fraction"
              >
                Fraction
              </button>
              <button
                type="button"
                onClick={insertSquare}
                className="px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                title="Square"
              >
                x²
              </button>
              <button
                type="button"
                onClick={insertExponent}
                className="px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                title="Exponent"
              >
                x^n
              </button>
              <button
                type="button"
                onClick={insertSubscript}
                className="px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                title="Subscript"
              >
                x_n
              </button>
            </div>
          </div>

          {/* Special Symbols */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Special Symbols:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={insertSquareRoot}
                className="px-3 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
                title="Square Root"
              >
                √x
              </button>
              <button
                type="button"
                onClick={insertPi}
                className="px-3 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                title="Pi"
              >
                π
              </button>
              <button
                type="button"
                onClick={insertInfinity}
                className="px-3 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                title="Infinity"
              >
                ∞
              </button>
              <button
                type="button"
                onClick={insertSum}
                className="px-3 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                title="Sum"
              >
                Σ
              </button>
              <button
                type="button"
                onClick={insertIntegral}
                className="px-3 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                title="Integral"
              >
                ∫
              </button>
            </div>
          </div>

          {/* Greek Letters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Greek Letters:</h4>
            <div className="flex flex-wrap gap-2">
              {['α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', 'σ', 'φ', 'ω'].map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => insertGreekLetter(letter)}
                  className="px-3 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                  title={letter}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Parentheses and Brackets */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Grouping:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={insertParentheses}
                className="px-3 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                title="Parentheses"
              >
                ( )
              </button>
              <button
                type="button"
                onClick={insertBrackets}
                className="px-3 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                title="Brackets"
              >
                [ ]
              </button>
            </div>
          </div>
          
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <div className="text-xs text-gray-500">
        <p>💡 <strong>Tips:</strong> Click the buttons above to insert math symbols, or type directly in the text area.</p>
        <p>Examples: "x² + y² = z²", "π × r²", "(numerator/denominator)"</p>
      </div>
    </div>
  );
} 