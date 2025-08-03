import React from 'react';

interface ImageDisplayProps {
  text: string;
  className?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ text, className = '' }) => {
  // Function to extract image URLs from Markdown text
  const extractImages = (text: string) => {
    const imageRegex = /!\[Image\]\(([^)]+)\)/g;
    const images: string[] = [];
    let match;
    
    while ((match = imageRegex.exec(text)) !== null) {
      images.push(match[1]);
    }
    
    return images;
  };

  // Function to render text with images
  const renderTextWithImages = (text: string) => {
    const images = extractImages(text);
    let processedText = text;
    
    // Replace each image markdown with an actual image
    images.forEach((imageUrl, index) => {
      const imageMarkdown = `![Image](${imageUrl})`;
      
      // Handle both relative and absolute URLs
      let fullImageUrl = imageUrl;
      if (imageUrl.startsWith('/uploads/')) {
        // Convert relative URL to backend server URL
        fullImageUrl = `https://admindashboard-x0hk.onrender.com${imageUrl}`;
      }
      
      const imageElement = `<img src="${fullImageUrl}" alt="Question Image" class="max-w-full h-auto rounded-lg shadow-md my-2" style="max-height: 300px;" />`;
      processedText = processedText.replace(imageMarkdown, imageElement);
    });
    
    return processedText;
  };

  const processedText = renderTextWithImages(text);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
};

export default ImageDisplay; 