const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path'); // Added missing import

// Configure AWS with fallback handling
const configureAWS = () => {
  try {
    // Ensure dotenv is loaded
    require('dotenv').config();
    
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      console.warn('⚠️ AWS credentials not fully configured. S3 features will be disabled.');
      return false;
    }

    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region
    });

    console.log('✅ S3 configured successfully');
    return true;
  } catch (error) {
    console.error('❌ S3 configuration error:', error);
    return false;
  }
};

const isS3Configured = configureAWS();

class S3Service {
  constructor() {
    this.s3 = isS3Configured ? new AWS.S3() : null;
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  async uploadFile(file, filename) {
    if (!this.s3 || !this.bucketName) {
      console.warn('⚠️ S3 not configured, falling back to local storage');
      return this.fallbackToLocalStorage(file, filename);
    }

    try {
      // Handle different file formats (buffer or path)
      let fileBody;
      if (file.buffer) {
        fileBody = file.buffer;
      } else if (file.path) {
        fileBody = fs.readFileSync(file.path);
      } else {
        throw new Error('No file data available');
      }

      const params = {
        Bucket: this.bucketName,
        Key: filename,
        Body: fileBody,
        ContentType: file.mimetype
        // Removed ACL: 'public-read' as the bucket doesn't support ACLs
      };

      const result = await this.s3.upload(params).promise();
      console.log('✅ File uploaded to S3:', result.Location);
      return result.Location;
    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      console.log('🔄 Falling back to local storage...');
      return this.fallbackToLocalStorage(file, filename);
    }
  }

  async deleteFile(filename) {
    if (!this.s3 || !this.bucketName) {
      console.warn('⚠️ S3 not configured, skipping delete');
      return true;
    }

    try {
      const params = {
        Bucket: this.bucketName,
        Key: filename
      };

      await this.s3.deleteObject(params).promise();
      console.log('✅ File deleted from S3:', filename);
      return true;
    } catch (error) {
      console.error('❌ S3 delete failed:', error);
      return false;
    }
  }

  getFileUrl(filename) {
    if (!this.bucketName) {
      return null;
    }
    return `https://${this.bucketName}.s3.amazonaws.com/${filename}`;
  }

  // Fallback to local storage when S3 fails
  fallbackToLocalStorage(file, filename) {
    try {
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      
      // Handle different file formats (buffer or path)
      if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.path) {
        fs.copyFileSync(file.path, filePath);
      } else {
        throw new Error('No file data available');
      }
      
      // Use the correct base URL for production
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://admindashboard-x0hk.onrender.com'
        : (process.env.BASE_URL || 'http://localhost:5001');
      const fileUrl = `${baseUrl}/uploads/${filename}`;
      
      console.log('✅ File saved locally:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('❌ Local storage fallback failed:', error);
      throw new Error('File upload failed - both S3 and local storage unavailable');
    }
  }

  // Health check method
  async healthCheck() {
    if (!this.s3 || !this.bucketName) {
      return { status: 'not_configured', message: 'S3 not configured' };
    }

    try {
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
      return { status: 'healthy', message: 'S3 bucket accessible' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

module.exports = S3Service; 