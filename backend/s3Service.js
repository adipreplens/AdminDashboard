const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'preplens-assets-prod';

class S3Service {
  // Upload file to S3
  static async uploadFile(filePath, fileName) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const params = {
        Bucket: BUCKET_NAME,
        Key: `uploads/${fileName}`,
        Body: fileContent,
        ContentType: 'image/jpeg', // Adjust based on file type
        ACL: 'public-read'
      };

      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  // Delete file from S3
  static async deleteFile(fileName) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: `uploads/${fileName}`
      };

      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('Error deleting from S3:', error);
      throw error;
    }
  }

  // Get file URL from S3
  static getFileUrl(fileName) {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
  }
}

module.exports = S3Service; 