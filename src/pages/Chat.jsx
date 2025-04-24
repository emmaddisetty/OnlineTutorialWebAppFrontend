import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

export default function Chat() {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get('/users/teachers');
        setTeachers(response.data);
        setFilteredTeachers(response.data);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch teachers');
        setIsLoading(false);
      }
    };
    if (user?.role === 'student') {
      fetchTeachers();
    }
  }, [user]);

  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  useEffect(() => {
    if (selectedTeacher) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/messages/${user.id}/${selectedTeacher.id}`);
          setMessages(response.data);
        } catch (error) {
          setError('Failed to fetch messages');
        }
      };
      fetchMessages();
      // Simulate real-time messaging with polling (replace with WebSocket in production)
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTeacher, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTeacher) return;
    try {
      const response = await api.post('/messages', {
        senderId: user.id,
        receiverId: selectedTeacher.id,
        content: newMessage
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const styles = `
    .chat-page {
      min-height: 100vh;
      background: linear-gradient(120deg, #bfdbfe 0%, #93c5fd 100%);
      font-family: 'Inter', sans-serif;
      color: #1e40af;
      padding: 1.5rem;
      box-sizing: border-box;
      display: flex;
      gap: 1.5rem;
    }
    .teacher-list {
      flex: 1;
      max-width: 300px;
      background: #f9fafb;
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
    }
    .chat-area {
      flex: 2;
      background: #f9fafb;
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
      display: flex;
      flex-direction: column;
    }
    .search-container {
      margin-bottom: 1.5rem;
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 0.7rem 2.2rem 0.7rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      background: #fff;
      color: #1e40af;
    }
    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .search-icon {
      position: absolute;
      right: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: #3b82f6;
      font-size: 1.2rem;
    }
    .teacher-card {
      padding: 1rem;
      border-radius: 12px;
      background: #eff6ff;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    .teacher-card:hover, .teacher-card.selected {
      background: #bfdbfe;
      transform: translateY(-2px);
    }
    .teacher-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e40af;
    }
    .chat-header {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 1rem;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #fff;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
    }
    .message {
      margin-bottom: 1rem;
      padding: 0.7rem 1rem;
      border-radius: 10px;
      max-width: 70%;
    }
    .message.sent {
      background: #3b82f6;
      color: #fff;
      margin-left: auto;
    }
    .message.received {
      background: #e5e7eb;
      color: #1e40af;
    }
    .message-sender {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
    }
    .message-content {
      font-size: 1rem;
    }
    .message-input {
      display: flex;
      gap: 1rem;
    }
    .input-field {
      flex: 1;
      padding: 0.7rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      background: #fff;
    }
    .input-field:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .send-btn {
      padding: 0.7rem 1.5rem;
      background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .send-btn:hover {
      background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
    }
    .error-message {
      color: #f87171;
      text-align: center;
      margin-bottom: 1rem;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #e5e7eb;
      border-top: 5px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (user?.role !== 'student') {
    return (
      <>
        <style>{styles}</style>
        <div className="chat-page">
          <div className="error-message">Only students can access the chat feature.</div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="chat-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading teachers...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
      <div className="chat-page">
        <motion.div
          className="teacher-list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          {error && <div className="error-message">{error}</div>}
          {filteredTeachers.map(teacher => (
            <motion.div
              key={teacher.id}
              className={`teacher-card ${selectedTeacher?.id === teacher.id ? 'selected' : ''}`}
              onClick={() => setSelectedTeacher(teacher)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="teacher-name">{teacher.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{teacher.email}</div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="chat-area"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {selectedTeacher ? (
            <>
              <div className="chat-header">Chat with {selectedTeacher.name}</div>
              <div className="messages">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`message ${message.senderId === user.id ? 'sent' : 'received'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-sender">
                      {message.senderId === user.id ? 'You' : selectedTeacher.name}
                    </div>
                    <div className="message-content">{message.content}</div>
                  </motion.div>
                ))}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  className="input-field"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Select a teacher to start chatting
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}