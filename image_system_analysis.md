# Image Upload and Storage System Analysis

## 🔄 Complete Flow

### 1. **Image Upload Process**
```
Frontend → Backend → S3 → Database → Frontend Display
```

**Step-by-step:**
1. **Frontend**: User clicks 📷 button on Option A
2. **Backend**: Receives file via `/upload-image` endpoint
3. **Local Storage**: File saved temporarily to `uploads/` folder
4. **S3 Upload**: File uploaded to `preplens-assets-prod/uploads/filename.jpg`
5. **URL Return**: Backend returns S3 URL to frontend
6. **Cleanup**: Local file deleted after S3 upload

### 2. **Database Storage Format**

**Question Structure in MongoDB:**
```javascript
{
  _id: "question_id",
  text: "What is 2+2?",
  options: [
    "Option A text\n![Image](https://s3-url.jpg)",  // Option A with image
    "Option B text",                                 // Option B without image
    "Option C text",                                 // Option C without image
    "Option D text"                                  // Option D without image
  ],
  answer: "Option A text",
  subject: "mathematics",
  exam: "rrb",
  difficulty: "easy",
  marks: 1,
  timeLimit: 30,
  blooms: "remember",
  publishStatus: "draft",
  category: "basic-math",
  topic: "addition",
  solution: "2+2=4\n![Image](https://s3-url-solution.jpg)", // Solution with image
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 3. **Frontend Display Process**

**ImageDisplay Component:**
```javascript
// Input: "Option A text\n![Image](https://s3-url.jpg)"
// Output: <div>Option A text<img src="https://s3-url.jpg" /></div>
```

**Process:**
1. Extract image URLs using regex: `/!\[Image\]\(([^)]+)\)/g`
2. Replace Markdown with HTML: `<img src="url" alt="Question Image" />`
3. Display actual images instead of Markdown text

### 4. **S3 Configuration**

**Bucket Details:**
- **Name**: `preplens-assets-prod`
- **Region**: AWS region (from env)
- **Path**: `uploads/filename.jpg`
- **Access**: Public read
- **URL Format**: `https://preplens-assets-prod.s3.region.amazonaws.com/uploads/filename.jpg`

**Fallback System:**
- If S3 not configured → Local storage
- If S3 upload fails → Local storage
- Local URL: `/uploads/filename.jpg`

### 5. **Real-time Features**

**Preview System:**
- **Question Preview**: Shows images as you type
- **Options Preview**: Shows images in A, B, C, D options
- **Solution Preview**: Shows images in solution

**Management Features:**
- **Upload**: Click 📷 to upload images
- **Remove**: Click 🗑️ to remove images
- **Change**: Upload new image to replace old one

### 6. **Error Handling**

**Upload Errors:**
- Invalid file type → Rejected
- File too large → Rejected
- Network error → User notified
- S3 error → Fallback to local storage

**Display Errors:**
- Broken image URL → Shows alt text
- Network error → Shows placeholder
- Invalid Markdown → Graceful fallback

### 7. **Security Considerations**

**File Validation:**
- Only image files allowed
- File size limits
- File type checking
- Malware scanning (if configured)

**Access Control:**
- S3 bucket public read
- Upload requires authentication
- Delete requires authentication

### 8. **Performance Optimizations**

**Image Optimization:**
- Max height: 300px for display
- Responsive design
- Lazy loading (if implemented)
- Compression (if configured)

**Storage Optimization:**
- Automatic cleanup of old files
- S3 lifecycle policies
- CDN integration (if configured)

## ✅ System Status: WORKING

The image upload and storage system is fully functional with:
- ✅ S3 storage for images
- ✅ Markdown format in database
- ✅ Real image display in frontend
- ✅ Remove/change functionality
- ✅ Real-time previews
- ✅ Error handling and fallbacks
- ✅ Security measures 