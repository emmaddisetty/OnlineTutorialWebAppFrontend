import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import axios from 'axios';
import loginImage from '../assets/images/login_image.jpg';

export default function Connect() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', senderEmail: '', subject: '', description: '' });
  const [formError, setFormError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (user?.role) {
          const response = await api.get(`/users?role=${user.role}`);
          setContacts(response.data);
          setFilteredContacts(response.data);
        }
        setIsLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setContacts([]);
          setFilteredContacts([]);
        } else {
          setError(error.response?.data?.message || 'Failed to fetch contacts');
        }
        setIsLoading(false);
      }
    };
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  useEffect(() => {
    if (selectedContact) {
      setFormData({
        name: selectedContact.name,
        senderEmail: '',
        subject: '',
        description: ''
      });
      setFormError('');
      setIsEmailSent(false);
    }
  }, [selectedContact]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) return 'Recipient Name is required';
    if (!formData.senderEmail.trim()) return 'Reach Out Email is required';
    if (!emailRegex.test(formData.senderEmail)) return 'Please enter a valid email address';
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.description.trim()) return 'Description is required';
    return '';
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/email/send', {
        toEmail: selectedContact.email, // Send to the teacher's email (e.g., bsank85@gmail.com)
        subject: formData.subject,
        message: formData.description,
        senderName: user.name,
        senderRole: user.role,
        recipientEmail: formData.senderEmail, // User's email for the "reach out to them at" link
        recipientName: formData.name // The teacher's name (e.g., Balaji sankarapu)
      });

      if (response.status === 200) {
        setIsEmailSent(true);
        setTimeout(() => {
          setSelectedContact(null);
          setIsEmailSent(false);
          setFormData({ name: '', senderEmail: '', subject: '', description: '' });
        }, 3000);
      } else {
        setFormError('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Request failed:', error);
      if (error.response) {
        if (error.response.status === 404) {
          setFormError('Email endpoint not found. Please check your backend server.');
        } else {
          setFormError(error.response.data?.error || 'Failed to send email. Please try again.');
        }
      } else if (error.request) {
        setFormError('Network error. Please check your internet connection and try again.');
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setSelectedContact(null);
    setFormData({ name: '', senderEmail: '', subject: '', description: '' });
    setFormError('');
    setIsEmailSent(false);
  };

  const styles = `
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      font-family: 'Poppins', sans-serif;
    }
    .container {
      height: 100vh;
      width: 100vw;
      background-image: url(${loginImage});
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
      z-index: 1;
    }
    .content-wrapper {
      position: relative;
      z-index: 2;
      display: flex;
      width: 85%;
      max-width: 1200px;
      height: 85vh;
      max-height: 800px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .header-section {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 3;
    }
    .back-button {
      padding: 0.5rem 1rem;
      background: linear-gradient(to right, #4f46e5, #6366f1);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .back-button:hover {
      background: linear-gradient(to right, #4338ca, #4f46e5);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(79, 70, 229, 0.4);
    }
    .contact-list {
      flex: 1;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.05);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      overflow-y: auto;
    }
    .content-area {
      flex: 2;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
    }
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(to right, #fff, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
      text-align: center;
    }
    .section-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2rem;
      text-align: center;
      line-height: 1.5;
    }
    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 2rem;
      justify-content: center;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: calc(50% - 0.75rem);
    }
    .feature-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .feature-text {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
    }
    .search-container {
      margin-bottom: 2.5rem;
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 0.85rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 1rem;
      color: white;
      transition: all 0.3s ease;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    .search-input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.15);
    }
    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.2rem;
    }
    .contact-card {
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      margin-bottom: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .contact-card:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
    }
    .contact-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
    }
    .contact-email {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }
    .placeholder-text {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
    }
    .popup {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(8px);
    }
    .popup-content {
      background: #1a1a1a;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      width: 90%;
      max-width: 550px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      border: 2px solid #4f46e5;
    }
    .popup-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(79, 70, 229, 0.1), rgba(165, 180, 252, 0.1));
      z-index: -1;
    }
    .popup-title {
      font-size: 1.9rem;
      font-weight: 700;
      margin-bottom: 1.8rem;
      color: #ffffff;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .form-group {
      margin-bottom: 1.8rem;
      text-align: left;
    }
    .form-label {
      display: block;
      color: #e0e0e0;
      margin-bottom: 0.6rem;
      font-weight: 500;
      font-size: 1.1rem;
    }
    .form-input, .form-textarea {
      width: 100%;
      padding: 0.9rem;
      background: #2a2a2a;
      border: 1px solid #4f46e5;
      border-radius: 10px;
      box-sizing: border-box;
      font-size: 1rem;
      color: #ffffff;
      transition: all 0.3s ease;
    }
    .form-input::placeholder, .form-textarea::placeholder {
      color: #888888;
    }
    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: #a5b4fc;
      background: #333333;
      box-shadow: 0 0 10px rgba(165, 180, 252, 0.4);
    }
    .form-input[readonly] {
      background: #222222;
      cursor: not-allowed;
    }
    .form-textarea {
      height: 130px;
      resize: vertical;
    }
    .send-btn, .cancel-btn {
      width: 48%;
      padding: 1rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .send-btn {
      background: linear-gradient(to right, #4f46e5, #6366f1);
      color: #fff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .send-btn:hover {
      background: linear-gradient(to right, #4338ca, #4f46e5);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(79, 70, 229, 0.4);
    }
    .cancel-btn {
      background: linear-gradient(to right, #ef4444, #f87171);
      color: #fff;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    .cancel-btn:hover {
      background: linear-gradient(to right, #dc2626, #ef4444);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
    }
    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }
    .success-message {
      color: #4ade80;
      font-size: 1.3rem;
      font-weight: 600;
      margin-top: 1.5rem;
      text-align: center;
      background: rgba(74, 222, 128, 0.1);
      padding: 1rem;
      border-radius: 10px;
    }
    .error-message {
      color: #fecaca;
      margin: 1rem 0;
      text-align: center;
      padding: 0.75rem;
      background-color: rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      font-size: 0.9rem;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: white;
    }
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255, 255, 255, 0.2);
      border-top: 5px solid #a5b4fc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (max-width: 1024px) {
      .content-wrapper {
        flex-direction: column;
        height: auto;
        width: 90%;
        max-height: none;
        padding: 1rem;
      }
      .contact-list {
        padding: 1.5rem;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        max-height: 40vh;
      }
      .content-area {
        padding: 1.5rem;
        min-height: 30vh;
      }
      .section-title {
        font-size: 1.8rem;
      }
      .section-subtitle {
        font-size: 0.9rem;
      }
      .header-section {
        top: 0.5rem;
        left: 0.5rem;
      }
      .back-button {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
      }
      .feature-item {
        width: 100%;
      }
    }
    @media (max-width: 640px) {
      .content-wrapper {
        width: 95%;
        padding: 0.5rem;
      }
      .contact-list {
        padding: 1rem;
        max-height: 35vh;
      }
      .content-area {
        padding: 1rem;
      }
      .section-title {
        font-size: 1.5rem;
      }
      .section-subtitle {
        font-size: 0.85rem;
      }
      .search-container {
        margin-bottom: 2rem;
      }
      .search-input {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
      .search-icon {
        font-size: 1rem;
        right: 0.8rem;
      }
      .contact-card {
        margin-bottom: 1rem;
        padding: 0.8rem;
      }
      .contact-name {
        font-size: 1rem;
      }
      .contact-email {
        font-size: 0.8rem;
      }
      .error-message {
        margin: 1rem 0;
        font-size: 0.85rem;
      }
      .feature-item {
        gap: 0.5rem;
        width: 100%;
      }
      .feature-icon {
        width: 35px;
        height: 35px;
        font-size: 1rem;
      }
      .feature-text {
        font-size: 0.9rem;
      }
      .popup-content {
        width: 95%;
        padding: 1.5rem;
      }
      .popup-title {
        font-size: 1.5rem;
      }
      .form-input, .form-textarea {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
      .send-btn, .cancel-btn {
        padding: 0.8rem;
        font-size: 0.9rem;
      }
      .header-section {
        top: 0.5rem;
        left: 0.5rem;
      }
      .back-button {
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
      }
    }
    @media (max-width: 480px) {
      .content-wrapper {
        width: 98%;
        padding: 0.3rem;
      }
      .contact-list {
        padding: 0.8rem;
        max-height: 30vh;
      }
      .content-area {
        padding: 0.8rem;
      }
      .section-title {
        font-size: 1.3rem;
      }
      .section-subtitle {
        font-size: 0.8rem;
      }
      .search-input {
        padding: 0.6rem;
        font-size: 0.85rem;
      }
      .search-icon {
        font-size: 0.9rem;
        right: 0.6rem;
      }
      .contact-card {
        padding: 0.6rem;
      }
      .contact-name {
        font-size: 0.9rem;
      }
      .contact-email {
        font-size: 0.75rem;
      }
      .popup-content {
        width: 98%;
        padding: 1rem;
      }
      .popup-title {
        font-size: 1.3rem;
      }
      .form-input, .form-textarea {
        padding: 0.6rem;
        font-size: 0.85rem;
      }
      .send-btn, .cancel-btn {
        padding: 0.7rem;
        font-size: 0.85rem;
      }
    }
  `;

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.9, y: 30, transition: { duration: 0.3 } }
  };

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="container">
          <div className="overlay"></div>
          <div className="content-wrapper">
            <div className="error-message">Please log in to access the connect feature.</div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="container">
          <div className="overlay"></div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading {user.role === 'student' ? 'teachers' : 'students'}...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
      <div className="container">
        <div className="overlay"></div>
        <div className="header-section">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
        <div className="content-wrapper">
          <motion.div
            className="contact-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              {user.role === 'student' ? 'Teachers with Us' : 'Students with Us'}
            </div>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={`Search ${user.role === 'student' ? 'teachers' : 'students'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            {error && <div className="error-message">{error}</div>}
            {filteredContacts.length === 0 ? (
              <div className="placeholder-text">
                No {user.role === 'student' ? 'teachers' : 'students'} found.
              </div>
            ) : (
              filteredContacts.map(contact => (
                <motion.div
                  key={contact.id}
                  className="contact-card"
                  onClick={() => setSelectedContact(contact)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-email">{contact.email}</div>
                </motion.div>
              ))
            )}
          </motion.div>
          <motion.div
            className="content-area"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-title">
              {user.role === 'student' ? 'Connect with Teachers' : 'Engage with Students'}
            </div>
            <div className="section-subtitle">
              {user.role === 'student'
                ? 'Reach out to your teachers to share concerns, ask questions, or get guidance.'
                : 'Support your students by addressing their queries and providing assistance.'}
            </div>
            <div className="features">
              <div className="feature-item">
                <div className="feature-icon">📩</div>
                <div className="feature-text">Send emails directly</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📞</div>
                <div className="feature-text">Quick communication</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">👥</div>
                <div className="feature-text">Build connections</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💬</div>
                <div className="feature-text">Share your concerns</div>
              </div>
            </div>
          </motion.div>
        </div>
        <AnimatePresence>
          {selectedContact && (
            <motion.div
              className="popup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="popup-content"
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="popup-title">
                  Connect with {selectedContact.name}
                </div>
                {isEmailSent ? (
                  <div className="success-message">
                    {selectedContact.name} will reach out to you soon
                  </div>
                ) : (
                  <>
                    {formError && <div className="error-message">{formError}</div>}
                    <form onSubmit={handleSendEmail}>
                      <div className="form-group">
                        <label className="form-label">Recipient Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter name"
                          required
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Reach Out Email</label>
                        <input
                          type="email"
                          name="senderEmail"
                          value={formData.senderEmail}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Subject</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter subject"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder="Enter your message"
                          required
                        ></textarea>
                      </div>
                      <div className="button-group">
                        <button type="submit" className="send-btn">
                          Send Email
                        </button>
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}