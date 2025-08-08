import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface ImageDisplayProps {
  text: string;
  className?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ text, className = '' }) => {
  // Function to process text and convert image URLs to full backend URLs
  const processText = (text: string) => {
    let processedText = text;
    
    // Handle both relative and absolute URLs in img tags
    processedText = processedText.replace(
      /<img([^>]+)src="([^"]+)"([^>]*)>/g,
      (match, beforeSrc, imageUrl, afterSrc) => {
        // Handle both relative and absolute URLs
        let fullImageUrl = imageUrl;
        if (imageUrl.startsWith('/uploads/')) {
          // Convert relative URL to backend server URL
          fullImageUrl = `https://admindashboard-x0hk.onrender.com${imageUrl}`;
        } else if (imageUrl.startsWith('uploads/')) {
          // Handle case where uploads/ doesn't start with /
          fullImageUrl = `https://admindashboard-x0hk.onrender.com/${imageUrl}`;
        }
        
        return `<img${beforeSrc}src="${fullImageUrl}"${afterSrc}>`;
      }
    );
    
    return processedText;
  };

  // Function to process markdown formatting
  const processMarkdown = (text: string) => {
    let processedText = text;
    
    // Bold: **text** -> <strong>text</strong>
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Underline: __text__ -> <u>text</u>
    processedText = processedText.replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Bullet lists: • item -> <li>item</li>
    processedText = processedText.replace(/^•\s+(.*?)$/gm, '<li>$1</li>');
    
    // Numbered lists: 1. item -> <li>item</li>
    processedText = processedText.replace(/^\d+\.\s+(.*?)$/gm, '<li>$1</li>');
    
    // Wrap lists in <ul> or <ol> tags
    processedText = processedText.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
    
    return processedText;
  };

  // Function to render LaTeX in text
  const renderLatexInText = (text: string) => {
    // Pattern to match LaTeX expressions wrapped in $ or $$ or standalone LaTeX
    const latexPattern = /(\$[^$]+\$|\$\$[^$]+\$\$|\\[a-zA-Z]+(?:\{[^}]*\})*(?:\^[^{]*)?(?:\{[^}]*\})*|\\[a-zA-Z]+|x\^[0-9]+|x_[0-9]+|[a-zA-Z]+\^[0-9]+|[a-zA-Z]+_[0-9]+)/g;
    const parts = text.split(latexPattern);
    
    return parts.map((part, index) => {
      // Check if this part looks like LaTeX
      if (part.match(/^\$[^$]+\$$/) || part.match(/^\$\$[^$]+\$\$$/) || part.match(/^\\[a-zA-Z]/) || part.match(/^[a-zA-Z]+\^[0-9]+$/) || part.match(/^[a-zA-Z]+_[0-9]+$/)) {
        try {
          // Remove $ or $$ delimiters for KaTeX
          let mathContent = part;
          if (part.startsWith('$') && part.endsWith('$')) {
            mathContent = part.slice(1, -1); // Remove $ delimiters
          } else if (part.startsWith('$$') && part.endsWith('$$')) {
            mathContent = part.slice(2, -2); // Remove $$ delimiters
          }
          
          return <InlineMath key={index} math={mathContent} />;
        } catch (error) {
          console.error('LaTeX rendering error:', error);
          return <span key={index} className="text-red-500">{part}</span>;
        }
      }
      return part;
    });
  };

  const processedText = processText(text);
  
  // Debug: Log the processed text to see what's being rendered
  console.log('ImageDisplay - Original text:', text);
  console.log('ImageDisplay - Processed text:', processedText);
  console.log('ImageDisplay - Contains HTML img tags:', /<img[^>]+>/.test(text));
  
  // If the text contains escaped HTML (like &lt;img&gt;), decode it first
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const decodedText = decodeHtml(processedText);
  
  // Process markdown formatting
  const markdownProcessedText = processMarkdown(decodedText);
  
  // Check if text contains LaTeX
  const containsLatex = /\$[^$]+\$|\$\$[^$]+\$\$|\\[a-zA-Z]+|x\^[0-9]+|x_[0-9]+/.test(markdownProcessedText);
  
  if (containsLatex) {
    return (
      <div className={className} style={{ lineHeight: '1.6', wordBreak: 'break-word' }}>
        {renderLatexInText(markdownProcessedText)}
      </div>
    );
  }
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: markdownProcessedText }}
      style={{
        lineHeight: '1.6',
        wordBreak: 'break-word'
      }}
    />
  );
};

export default ImageDisplay; 