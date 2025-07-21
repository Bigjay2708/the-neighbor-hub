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
        newSocket.emit('authenticate', user.id);
        newSocket.emit('joinNeighborhood', user.neighborhoodId);
        newSocket.emit('getOnlineUsers');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      newSocket.on('newForumMessage', (data) => {
        if (data.authorId !== user.id) {
          toast(`New post: ${data.title}`, {
            icon: '💬',
            duration: 3000,
          });
        }
      });

      newSocket.on('marketplaceUpdate', (data) => {
        if (data.sellerId !== user.id) {
          toast(`Marketplace: ${data.title}`, {
            icon: '🛒',
            duration: 3000,
          });
        }
      });

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

      newSocket.on('privateMessage', (data) => {
        toast(`Message from ${data.senderName}: ${data.content}`, {
          icon: '✉️',
          duration: 4000,
        });
      });

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('userOnline', (userId) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

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
