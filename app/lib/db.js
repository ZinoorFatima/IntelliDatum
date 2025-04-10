import mongoose from "mongoose";

if (!env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

let isConnected = false; // Track connection status

export const connectDB = async () => {
  if (isConnected) {
    console.log("=> Using existing MongoDB connection");
    return;
  }

  try {
    const db = await mongoose.connect(env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw new Error("MongoDB connection failed");
  }
};
