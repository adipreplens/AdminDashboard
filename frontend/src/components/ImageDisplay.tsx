import React from 'react';

interface ImageDisplayProps {
  text: string;
  className?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ text, className = '' }) => {
  // Function to extract image URLs from text
  const extractImageUrls = (text: string) => {
    const imageUrlRegex = /https:\/\/admindashboard-x0hk\.onrender\.com\/uploads\/[^"\s]+/g;
    return text.match(imageUrlRegex) || [];
  };

  // Function to render text with images
  const renderTextWithImages = (text: string) => {
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

  const processedText = renderTextWithImages(text);
  const imageUrls = extractImageUrls(text);
  
  // Debug: Log the processed text to see what's being rendered
  console.log('ImageDisplay - Original text:', text);
  console.log('ImageDisplay - Processed text:', processedText);
  console.log('ImageDisplay - Image URLs found:', imageUrls);
  
  // If we found image URLs, render them as actual images
  if (imageUrls.length > 0) {
    return (
      <div className={className}>
        {/* Render text content */}
        <div 
          dangerouslySetInnerHTML={{ __html: processedText.replace(/https:\/\/admindashboard-x0hk\.onrender\.com\/uploads\/[^"\s]+/g, '') }}
          style={{
            lineHeight: '1.6',
            wordBreak: 'break-word'
          }}
        />
        {/* Render images */}
        {imageUrls.map((imageUrl, index) => (
          <img 
            key={index}
            src={imageUrl} 
            alt="Question Image" 
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              margin: '10px 0',
              display: 'block'
            }}
            onError={(e) => {
              console.error('Failed to load image:', imageUrl);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Successfully loaded image:', imageUrl);
            }}
          />
        ))}
      </div>
    );
  }

  // If the text contains escaped HTML (like &lt;img&gt;), decode it first
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const decodedText = decodeHtml(processedText);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: decodedText }}
      style={{
        lineHeight: '1.6',
        wordBreak: 'break-word'
      }}
    />
  );
};

export default ImageDisplay; 