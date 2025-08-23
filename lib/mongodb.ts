import mongoose from 'mongoose';

// Define connection interface
interface MongooseConnection {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Global variable to store the connection
declare global {
  var mongoose: MongooseConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Initialize the global mongoose variable
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<mongoose.Connection> {
  // If we already have a connection, return it
  if (cached!.conn) {
    return cached!.conn;
  }

  // If we don't have a promise, create one
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      dbName: 'instagram_ai' // Specify your database name
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose.connection;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📦 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📦 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 Mongoose connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default connectDB;
