// Simple script to test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGO_URI ? 'Found' : 'NOT FOUND');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check MongoDB Atlas Network Access - whitelist your IP (or use 0.0.0.0/0 for development)');
    console.log('2. Verify your connection string in .env file');
    console.log('3. Check if your database user has proper permissions');
    console.log('4. Ensure your network/firewall allows MongoDB connections');
    process.exit(1);
  });
