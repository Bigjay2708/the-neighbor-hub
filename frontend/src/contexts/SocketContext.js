import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
          neighborhoodId: user.neighborhoodId
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        // Authenticate user
        newSocket.emit('authenticate', user.id);
        // Join neighborhood room
        newSocket.emit('joinNeighborhood', user.neighborhoodId);
        // Get online users
        newSocket.emit('getOnlineUsers');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      // Listen for new forum messages
      newSocket.on('newForumMessage', (data) => {
        if (data.authorId !== user.id) {
          toast(`New post: ${data.title}`, {
            icon: '💬',
            duration: 3000,
          });
        }
      });

      // Listen for marketplace updates
      newSocket.on('marketplaceUpdate', (data) => {
        if (data.sellerId !== user.id) {
          toast(`Marketplace: ${data.title}`, {
            icon: '🛒',
            duration: 3000,
          });
        }
      });

      // Listen for safety alerts
      newSocket.on('safetyAlert', (data) => {
        if (data.reporterId !== user.id) {
          toast(`Safety Alert: ${data.title}`, {
            icon: '🚨',
            duration: 5000,
            style: {
              background: '#ef4444',
              color: 'white',
            },
          });
        }
      });

      // Listen for private messages
      newSocket.on('privateMessage', (data) => {
        toast(`Message from ${data.senderName}: ${data.content}`, {
          icon: '✉️',
          duration: 4000,
        });
      });

      // Listen for online users
      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      // Listen for user coming online
      newSocket.on('userOnline', (userId) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

      // Listen for user going offline
      newSocket.on('userOffline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setOnlineUsers([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const emitForumMessage = (data) => {
    if (socket) {
      socket.emit('forumMessage', {
        ...data,
        neighborhoodId: user.neighborhoodId,
        authorId: user.id
      });
    }
  };

  const emitMarketplaceUpdate = (data) => {
    if (socket) {
      socket.emit('marketplaceUpdate', {
        ...data,
        neighborhoodId: user.neighborhoodId,
        sellerId: user.id
      });
    }
  };

  const emitSafetyAlert = (data) => {
    if (socket) {
      socket.emit('safetyAlert', {
        ...data,
        neighborhoodId: user.neighborhoodId,
        reporterId: user.id
      });
    }
  };

  const sendPrivateMessage = (recipientId, message) => {
    if (socket) {
      socket.emit('privateMessage', {
        recipientId,
        message,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`
      });
    }
  };

  const value = {
    socket,
    onlineUsers,
    emitForumMessage,
    emitMarketplaceUpdate,
    emitSafetyAlert,
    sendPrivateMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
