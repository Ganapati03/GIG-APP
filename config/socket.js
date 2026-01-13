import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.io server
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'https://gig-app.onrender.com',
      credentials: true
    }
  });

  // Store user socket connections
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins their personal room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        userSockets.set(userId, socket.id);
        console.log(`👤 User ${userId} joined their room`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Send notification to a specific user
 */
export const sendNotificationToUser = (userId, event, data) => {
  try {
    const io = getIO();
    io.to(userId.toString()).emit(event, data);
    console.log(`📨 Notification sent to user ${userId}:`, event);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Send hire notification
 */
export const sendHireNotification = (freelancerId, gigTitle, gigId) => {
  sendNotificationToUser(freelancerId, 'hired', {
    message: `You have been hired for "${gigTitle}"!`,
    gigId,
    timestamp: new Date()
  });
};
