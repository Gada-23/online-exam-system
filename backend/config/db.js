const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Remove deprecated options and use modern connection options
    });
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Please check:");
    console.error("1. Your MongoDB Atlas connection string is correct");
    console.error("2. Your IP address is whitelisted in MongoDB Atlas");
    console.error("3. Your network connection is stable");
    // Don't exit the process here; allow the server to start so the dev
    // environment can still serve API responses that don't require DB.
    // Let the caller decide how to handle the failure.
    throw error;
  }
};

module.exports = connectDB;
