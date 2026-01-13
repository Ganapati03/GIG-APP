import mongoose from 'mongoose';

/**
 * Connect to MongoDB with replica set support for transactions
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure compatibility with transactions
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Check if replica set is available (required for transactions)
    // Note: This requires cluster monitor permissions which some users might not have
    try {
      const admin = conn.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      
      if (serverStatus.repl) {
        console.log('✅ Replica Set detected - Transactions enabled');
      } else {
        console.warn('⚠️  WARNING: Not running on a replica set. Transactions will not work.');
        console.warn('   For production, use MongoDB Atlas or configure a replica set.');
      }
    } catch (checkError) {
      // If we don't have permission to check server status, just warn and continue
      console.warn('⚠️  Could not verify replica set status (insufficient permissions).');
      console.warn('   Transactions may not work if not on a replica set.');
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
