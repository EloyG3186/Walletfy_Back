const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/walletfy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Configurar mongoose para usar UTF-8
    mongoose.set('strictQuery', false);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
