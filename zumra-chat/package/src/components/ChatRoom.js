import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/chat.scss';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [participants, setParticipants] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Connect to socket and join room
  useEffect(() => {
    // Get username from localStorage or prompt user
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const newUsername = prompt('Enter your username to join the chat:');
      if (!newUsername) {
        // If user cancels, redirect to home
        navigate('/');
        return;
      }
      setUsername(newUsername);
      localStorage.setItem('username', newUsername);
    }
    
    // Connect to socket server
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [navigate]);
  
  // Join room once socket and username are available
  useEffect(() => {
    if (!socket || !username) return;
    
    // Join room
    socket.emit('join_room', { roomId, username });
    
    // Socket event listeners
    socket.on('connect', () => {
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socket.on('room_history', (data) => {
      setMessages(data.messages);
      setParticipants(data.participants);
      setRoomInfo(data.roomInfo);
    });
    
    socket.on('new_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socket.on('participant_joined', (data) => {
      setParticipants((prevParticipants) => {
        // Check if participant already exists
        const exists = prevParticipants.some(p => p.socketId === data.id);
        if (exists) return prevParticipants;
        
        // Add new participant
        return [...prevParticipants, {
          socketId: data.id,
          username: data.username,
          joinedAt: new Date(),
          isOnline: true
        }];
      });
      
      // Add system message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `system-${Date.now()}`,
          content: `${data.username} joined the chat`,
          isSystem: true,
          timestamp: new Date()
        }
      ]);
    });
    
    socket.on('participant_left', (data) => {
      setParticipants((prevParticipants) => {
        return prevParticipants.filter(p => p.socketId !== data.id);
      });
      
      // Add system message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `system-${Date.now()}`,
          content: `${data.username} left the chat`,
          isSystem: true,
          timestamp: new Date()
        }
      ]);
    });
    
    socket.on('room_full', () => {
      alert('This room is full. Please try another room.');
      navigate('/');
    });
    
    socket.on('room_expired', () => {
      alert('This room has expired. Please create a new room.');
      navigate('/');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(`Error: ${error.message}`);
    });
    
    // Clean up event listeners on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_history');
      socket.off('new_message');
      socket.off('participant_joined');
      socket.off('participant_left');
      socket.off('room_full');
      socket.off('room_expired');
      socket.off('error');
      
      // Leave room
      socket.emit('leave_room', { roomId });
    };
  }, [socket, username, roomId, navigate]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;
    
    // Send message to server
    socket.emit('send_message', {
      roomId,
      message: newMessage
    });
    
    // Clear input field
    setNewMessage('');
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2 className="room-name">{roomInfo?.name || `Room ${roomId}`}</h2>
          <span className="participant-count">{participants.length} online</span>
        </div>
        <button 
          className="leave-button"
          onClick={() => navigate('/')}
          aria-label="Leave chat"
        >
          Leave
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          msg.isSystem ? (
            <div key={msg.id || index} className="system-message">
              {msg.content}
            </div>
          ) : (
            <div 
              key={msg._id || index} 
              className={`message ${msg.senderId === socket?.id ? 'message-outgoing' : 'message-incoming'}`}
            >
              {msg.senderId !== socket?.id && (
                <div className="message-sender">{msg.sender}</div>
              )}
              <div className="message-content">{msg.content}</div>
              <div className="message-time">{formatTime(msg.timestamp)}</div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input-field"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          aria-label="Message"
          disabled={!isConnected}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!isConnected || !newMessage.trim()}
          aria-label="Send message"
        >
          →
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
