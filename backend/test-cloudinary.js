const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
    
    // Test basic API call
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!', result);
    
    // Test upload capabilities
    console.log('📤 Testing upload capabilities...');
    const uploadResult = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        folder: 'neighbor-hub/test',
        public_id: 'test-image',
        overwrite: true
      }
    );
    console.log('✅ Upload test successful!', uploadResult.secure_url);
    
    // Clean up test image
    await cloudinary.uploader.destroy('neighbor-hub/test/test-image');
    console.log('🧹 Test image cleaned up');
    
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have the correct credentials in your .env file');
    console.log('2. Check that your API key and secret are correct');
    console.log('3. Verify your cloud name is spelled correctly');
  }
}

testCloudinaryConnection();
