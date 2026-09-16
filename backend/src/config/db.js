import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventforge';
  try {
    console.log(`⏳ Connecting to database (${uri.includes('mongodb+srv') || uri.includes('mongodb.net') ? 'MongoDB Atlas Cloud' : 'Local MongoDB'})...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 30000,
    });
    console.log(`✅ MongoDB connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Atlas cloud connection timed out (${error.message}).`);
    
    // If Atlas was blocked by local ISP/Wi-Fi, seamlessly connect to active local MongoDB
    if (uri.includes('mongodb+srv') || uri.includes('mongodb.net')) {
      console.log('🔄 Engaging seamless failover to Local MongoDB (127.0.0.1:27017)...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/eventforge', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`✅ Failover successful! Connected to Local MongoDB: ${mongoose.connection.host}`);
        return;
      } catch (localErr) {
        console.error('❌ Local MongoDB fallback also failed:', localErr.message);
      }
    }
    throw error;
  }
}

