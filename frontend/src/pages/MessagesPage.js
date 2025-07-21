import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  CheckCircle,
  Circle,
  MoreHorizontal,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, sendPrivateMessage } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [neighbors, setNeighbors] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchNeighbors = useCallback(async () => {
    try {
      const response = await fetch('/api/users/neighbors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNeighbors(data.neighbors || []);
      }
    } catch (error) {
      console.error('Error fetching neighbors:', error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const tempMessage = {
      _id: Date.now().toString(),
      content: messageText,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      createdAt: new Date().toISOString(),
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId: activeConversation.participant._id,
          content: messageText
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? data.message : msg
          )
        );

        sendPrivateMessage(activeConversation.participant._id, messageText);
        
        fetchConversations();
      } else {
        toast.error('Failed to send message');
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const startConversation = async (neighborId) => {
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ participantId: neighborId })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveConversation(data.conversation);
        setMessages([]);
        setShowNewChatModal(false);
        await fetchConversations();
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Error starting conversation');
    }
  };

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (messageData) => {
        if (activeConversation && 
            (messageData.senderId === activeConversation.participant._id ||
             messageData.recipientId === activeConversation.participant._id)) {
          setMessages(prev => [...prev, messageData]);
          scrollToBottom();
        }
        fetchConversations();
      };

      socket.on('privateMessage', handleNewMessage);
      
      return () => {
        socket.off('privateMessage', handleNewMessage);
      };
    }
  }, [socket, activeConversation, fetchConversations]);

  useEffect(() => {
    fetchConversations();
    fetchNeighbors();
  }, [fetchConversations, fetchNeighbors]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation, fetchMessages]);

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const filteredNeighbors = neighbors.filter(neighbor =>
    `${neighbor.firstName} ${neighbor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="btn-primary"
            >
              New Chat
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with your neighbors!</p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation._id}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeConversation?._id === conversation._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {conversation.participant?.avatar ? (
                      <img
                        src={conversation.participant.avatar}
                        alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    {isUserOnline(conversation.participant._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate">
                        {conversation.participant.firstName} {conversation.participant.lastName}
                      </span>
                      {conversation.participant.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {activeConversation.participant?.avatar ? (
                      <img
                        src={activeConversation.participant.avatar}
                        alt={`${activeConversation.participant.firstName} ${activeConversation.participant.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                    {isUserOnline(activeConversation.participant._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {activeConversation.participant.firstName} {activeConversation.participant.lastName}
                      </span>
                      {activeConversation.participant.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      {isUserOnline(activeConversation.participant._id) ? (
                        <>
                          <Circle className="w-3 h-3 text-green-500 fill-current" />
                          <span>Online</span>
                        </>
                      ) : (
                        <span>Offline</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <Info className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    } ${message.isTemp ? 'opacity-70' : ''}`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user.id ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p>Choose a conversation from the sidebar or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Start New Conversation</h3>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search neighbors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {filteredNeighbors.map(neighbor => (
                  <div
                    key={neighbor._id}
                    onClick={() => startConversation(neighbor._id)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    {neighbor.avatar ? (
                      <img
                        src={neighbor.avatar}
                        alt={`${neighbor.firstName} ${neighbor.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {neighbor.firstName} {neighbor.lastName}
                        </span>
                        {neighbor.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      {isUserOnline(neighbor._id) && (
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Online</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
