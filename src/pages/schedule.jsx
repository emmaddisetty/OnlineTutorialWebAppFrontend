import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import loginImage from '../assets/images/login_image.jpg';

export default function Schedule() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    meetingTitle: '',
    meetingDate: '',
    meetingTime: { hours: '12', minutes: '00', period: 'AM' },
    duration: '30',
    platform: 'Zoom',
    description: '',
    meetingUrl: '',
  });
  const [formError, setFormError] = useState('');
  const [isInviteSent, setIsInviteSent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  // Fetch contacts from backend API
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

  // Filter contacts based on search query
  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const handleContactSelect = (contact) => {
    if (selectedContacts.includes(contact)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
    setFormError('');
    setIsInviteSent(false);
    setShowEmailFallback(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'hours' || name === 'minutes' || name === 'period') {
      setFormData(prev => ({
        ...prev,
        meetingTime: { ...prev.meetingTime, [name]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormError('');
    setShowEmailFallback(false);
  };

  const validateForm = () => {
    if (selectedContacts.length === 0) return 'Please select at least one contact to invite';
    if (!formData.meetingTitle.trim()) return 'Meeting title is required';
    if (!formData.meetingDate.trim()) return 'Meeting date is required';
    if (!formData.meetingTime.hours || !formData.meetingTime.minutes || !formData.meetingTime.period)
      return 'Meeting time is required';
    if (!formData.duration.trim()) return 'Duration is required';
    if (!formData.platform.trim()) return 'Platform is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.meetingUrl.trim()) return 'Meeting URL is required';

    try {
      new URL(formData.meetingUrl);
      if (!formData.meetingUrl.match(/^(https?:\/\/)/)) {
        return 'Meeting URL must start with http:// or https://';
      }
    } catch (error) {
      return 'Please enter a valid meeting URL';
    }

    let hours = parseInt(formData.meetingTime.hours);
    if (formData.meetingTime.period === 'PM' && hours !== 12) hours += 12;
    if (formData.meetingTime.period === 'AM' && hours === 12) hours = 0;
    const selectedDateTime = new Date(
      `${formData.meetingDate}T${hours.toString().padStart(2, '0')}:${formData.meetingTime.minutes}`
    );
    const currentDateTime = new Date();
    if (selectedDateTime <= currentDateTime) return 'Meeting date and time must be in the future';

    return '';
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      let hours = parseInt(formData.meetingTime.hours);
      const period = formData.meetingTime.period;
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const displayTime = `${formData.meetingTime.hours}:${formData.meetingTime.minutes} ${period}`;

      const toEmails = selectedContacts.map(contact => contact.email).join(',');
      const subject = `Meeting Invite: ${formData.meetingTitle}`;
      const body = `
Dear ${selectedContacts.map(contact => contact.name).join(', ')},

You are invited to a meeting scheduled as follows:

Title: ${formData.meetingTitle}
Date: ${formData.meetingDate}
Time: ${displayTime}
Duration: ${formData.duration} minutes
Platform: ${formData.platform}
Description: ${formData.description}
Join using this link: ${formData.meetingUrl}

Best regards,
${user.name} (${user.role})
      `.trim();

      setEmailContent(`To: ${toEmails}\nSubject: ${subject}\n\n${body}`);

      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(body);
      const mailtoLink = `mailto:${toEmails}?subject=${encodedSubject}&body=${encodedBody}`;

      // Debugging logs
      console.log('mailtoLink:', mailtoLink);

      // Attempt to open the email client
      const emailWindow = window.open(mailtoLink, '_self'); // Using '_self' instead of '_blank' to avoid popup blockers

      // Simplified fallback check
      setTimeout(() => {
        if (!emailWindow || emailWindow.closed) {
          console.log('Email client did not open, showing fallback');
          setShowEmailFallback(true);
          setFormError('Unable to open email client. Please copy the email content below and send it manually.');
        } else {
          console.log('Email client opened successfully');
          setIsInviteSent(true);
          setTimeout(() => {
            setSelectedContacts([]);
            setIsInviteSent(false);
            setFormData({
              meetingTitle: '',
              meetingDate: '',
              meetingTime: { hours: '12', minutes: '00', period: 'AM' },
              duration: '30',
              platform: 'Zoom',
              description: '',
              meetingUrl: '',
            });
            setShowPopup(false);
            setShowEmailFallback(false);
          }, 3000);
        }
      }, 500); // Delay to give the email client time to open
    } catch (error) {
      console.error('Error generating email invite:', error);
      setFormError('Failed to open email client. Please copy the email content below and send it manually.');
      setShowEmailFallback(true);
    }
  };

  const handleCopyEmailContent = () => {
    navigator.clipboard.writeText(emailContent).then(() => {
      setFormError('Email content copied to clipboard! Paste it into your email app and send.');
    }).catch(err => {
      setFormError('Failed to copy email content. Please copy it manually.');
    });
  };

  const handleCancel = () => {
    setSelectedContacts([]);
    setFormData({
      meetingTitle: '',
      meetingDate: '',
      meetingTime: { hours: '12', minutes: '00', period: 'AM' },
      duration: '30',
      platform: 'Zoom',
      description: '',
      meetingUrl: '',
    });
    setFormError('');
    setIsInviteSent(false);
    setShowPopup(false);
    setShowEmailFallback(false);
  };

  const handleScheduleMeetingClick = () => {
    console.log('Schedule Meeting button clicked');
    console.log('showPopup before:', showPopup);
    console.log('selectedContacts:', selectedContacts);
    setShowPopup(true);
    console.log('showPopup after:', showPopup);
  };

  const styles = `
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      font-family: 'Inter', sans-serif;
      background: #f5f7fa;
    }
    .container {
      min-height: 100vh;
      width: 100%;
      background-image: url(${loginImage});
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.8));
      z-index: 1;
    }
    .content-wrapper {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 1100px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .back-button {
      padding: 0.6rem 1.2rem;
      background: linear-gradient(to right, #7c3aed, #a855f7);
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }
    .back-button:hover {
      background: linear-gradient(to right, #6d28d9, #9333ea);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(124, 58, 237, 0.4);
    }
    .main-section {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .contact-card-container {
      flex: 1;
      min-width: 300px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
    }
    .schedule-card {
      flex: 2;
      min-width: 500px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .schedule-button {
      margin-top: 1.5rem;
      padding: 0.8rem 1.5rem;
      background: linear-gradient(to right, #3b82f6, #60a5fa);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .schedule-button:hover {
      background: linear-gradient(to right, #2563eb, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
    }
    .schedule-button:disabled {
      background: #6b7280;
      cursor: not-allowed;
      box-shadow: none;
    }
    .section-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      background: linear-gradient(to right, #e5e7eb, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .section-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2rem;
      text-align: center;
      line-height: 1.6;
    }
    .search-container {
      margin-bottom: 1.5rem;
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 0.8rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 0.95rem;
      color: white;
      transition: all 0.3s ease;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    .search-input:focus {
      outline: none;
      border-color: #93c5fd;
      background: rgba(255, 255, 255, 0.25);
    }
    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.1rem;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      margin-bottom: 0.8rem;
      transition: all 0.3s ease;
    }
    .contact-item:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .contact-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .contact-info {
      flex: 1;
    }
    .contact-name {
      font-size: 1rem;
      font-weight: 600;
      color: white;
    }
    .contact-email {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
    }
    .placeholder-text {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      margin-top: 1rem;
    }
    .feature-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .feature-icon {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .feature-text {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
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
      background: #1e293b;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      width: 90%;
      max-width: 800px;
      padding: 2rem;
      position: relative;
      border: 2px solid #3b82f6;
    }
    .popup-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #e5e7eb;
      text-align: center;
    }
    .form-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .form-group {
      text-align: left;
    }
    .form-group.full-width {
      grid-column: span 2;
    }
    .form-label {
      display: block;
      color: #d1d5db;
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 1rem;
    }
    .form-input, .form-textarea, .form-select {
      width: 100%;
      padding: 0.8rem;
      background: #2d3748;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 0.95rem;
      color: #e5e7eb;
      transition: all 0.3s ease;
    }
    .form-input::placeholder, .form-textarea::placeholder {
      color: #9ca3af;
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      outline: none;
      border-color: #93c5fd;
      background: #374151;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
    }
    .form-textarea {
      height: 100px;
      resize: vertical;
    }
    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23e5e7eb' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1rem;
    }
    .time-picker {
      display: flex;
      gap: 0.5rem;
    }
    .time-picker .form-select {
      width: auto;
      flex: 1;
    }
    .send-btn, .cancel-btn, .copy-btn {
      width: 48%;
      padding: 0.9rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .send-btn {
      background: linear-gradient(to right, #3b82f6, #60a5fa);
      color: #fff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .send-btn:hover {
      background: linear-gradient(to right, #2563eb, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
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
    .copy-btn {
      background: linear-gradient(to right, #10b981, #34d399);
      color: #fff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      width: 100%;
    }
    .copy-btn:hover {
      background: linear-gradient(to right, #059669, #10b981);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
    }
    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }
    .success-message {
      color: #34d399;
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 1.5rem;
      text-align: center;
      background: rgba(52, 211, 153, 0.1);
      padding: 1rem;
      border-radius: 8px;
    }
    .error-message {
      color: #fecaca;
      margin: 1rem 0;
      text-align: center;
      padding: 0.75rem;
      background-color: rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .email-content-textarea {
      width: 100%;
      height: 200px;
      padding: 0.8rem;
      background: #2d3748;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 0.95rem;
      color: #e5e7eb;
      resize: vertical;
      margin-top: 1rem;
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
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top: 4px solid #93c5fd;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (max-width: 1024px) {
      .main-section {
        flex-direction: column;
      }
      .contact-card-container, .schedule-card {
        min-width: 100%;
      }
      .schedule-card {
        padding: 1.5rem;
      }
      .section-title {
        font-size: 1.6rem;
      }
      .section-subtitle {
        font-size: 0.95rem;
      }
      .form-columns {
        grid-template-columns: 1fr;
      }
      .form-group.full-width {
        grid-column: span 1;
      }
    }
    @media (max-width: 640px) {
      .container {
        padding: 1rem;
      }
      .section-title {
        font-size: 1.4rem;
      }
      .section-subtitle {
        font-size: 0.9rem;
      }
      .search-input {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
      .search-icon {
        font-size: 1rem;
        right: 0.8rem;
      }
      .contact-item {
        padding: 0.6rem;
      }
      .contact-name {
        font-size: 0.95rem;
      }
      .contact-email {
        font-size: 0.8rem;
      }
      .feature-list {
        grid-template-columns: 1fr;
      }
      .popup-content {
        width: 95%;
        padding: 1.5rem;
      }
      .popup-title {
        font-size: 1.5rem;
      }
      .form-input, .form-textarea, .form-select {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
      .send-btn, .cancel-btn, .copy-btn {
        padding: 0.8rem;
        font-size: 0.9rem;
      }
      .time-picker .form-select {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
    }
  `;

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  const hoursOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 1).toString();
    return <option key={hour} value={hour}>{hour}</option>;
  });

  const minutesOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, '0');
    return <option key={minute} value={minute}>{minute}</option>;
  });

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="container">
          <div className="overlay"></div>
          <div className="content-wrapper">
            <div className="error-message">Please log in to access the schedule feature.</div>
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
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
      />
      <div className="container">
        <div className="overlay"></div>
        <div className="content-wrapper">
          <div className="header-section">
            <button className="back-button" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
          <div className="main-section">
            <motion.div
              className="contact-card-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="section-title">
                {user.role === 'student' ? 'Available Teachers' : 'Available Students'}
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
                    className="contact-item"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      className="contact-checkbox"
                      checked={selectedContacts.includes(contact)}
                      onChange={() => handleContactSelect(contact)}
                    />
                    <div className="contact-info">
                      <div className="contact-name">{contact.name}</div>
                      <div className="contact-email">{contact.email}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
            <motion.div
              className="schedule-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="section-title">
                {user.role === 'student' ? 'Plan a Session with Teachers' : 'Plan a Session with Students'}
              </div>
              <div className="section-subtitle">
                {user.role === 'student'
                  ? 'Organize a session with your teachers to collaborate, discuss projects, or seek guidance.'
                  : 'Arrange a session with your students to mentor them, review progress, or host discussions.'}
              </div>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">📅</div>
                  <div className="feature-text">Plan sessions seamlessly</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📩</div>
                  <div className="feature-text">Send calendar invites</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">👥</div>
                  <div className="feature-text">Invite multiple attendees</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔗</div>
                  <div className="feature-text">Choose your platform</div>
                </div>
              </div>
              {selectedContacts.length > 0 && (
                <button className="schedule-button" onClick={handleScheduleMeetingClick}>
                  Schedule Meeting
                </button>
              )}
            </motion.div>
          </div>
        </div>
        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <div className="popup-title">Schedule a New Session</div>
              {isInviteSent ? (
                <div className="success-message">
                  Email invite prepared successfully! Check your email client.
                </div>
              ) : (
                <>
                  {formError && <div className="error-message">{formError}</div>}
                  {showEmailFallback ? (
                    <div className="form-group full-width">
                      <label className="form-label">Email Content (Copy and Paste into Your Email App)</label>
                      <textarea
                        className="email-content-textarea"
                        value={emailContent}
                        readOnly
                      ></textarea>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={handleCopyEmailContent}
                        style={{ marginTop: '1rem' }}
                      >
                        Copy Email Content
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendInvite}>
                      <div className="form-columns">
                        <div className="form-group full-width">
                          <label className="form-label">Selected Attendees</label>
                          <div
                            className="form-input"
                            style={{ background: '#2d3748', cursor: 'not-allowed' }}
                          >
                            {selectedContacts.length > 0
                              ? selectedContacts.map(contact => contact.name).join(', ')
                              : 'No attendees selected'}
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Meeting Title</label>
                          <input
                            type="text"
                            name="meetingTitle"
                            value={formData.meetingTitle}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter meeting title"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Meeting Date</label>
                          <input
                            type="date"
                            name="meetingDate"
                            value={formData.meetingDate}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Meeting Time</label>
                          <div className="time-picker">
                            <select
                              name="hours"
                              value={formData.meetingTime.hours}
                              onChange={handleInputChange}
                              className="form-select"
                              required
                            >
                              {hoursOptions}
                            </select>
                            <select
                              name="minutes"
                              value={formData.meetingTime.minutes}
                              onChange={handleInputChange}
                              className="form-select"
                              required
                            >
                              {minutesOptions}
                            </select>
                            <select
                              name="period"
                              value={formData.meetingTime.period}
                              onChange={handleInputChange}
                              className="form-select"
                              required
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Duration (minutes)</label>
                          <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                          >
                            <option value="30">30 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="90">90 minutes</option>
                            <option value="120">120 minutes</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Platform</label>
                          <select
                            name="platform"
                            value={formData.platform}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                          >
                            <option value="Zoom">Zoom</option>
                            <option value="Google Meet">Google Meet</option>
                            <option value="Microsoft Teams">Microsoft Teams</option>
                            <option value="In-Person">In-Person</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Meeting URL</label>
                          <input
                            type="url"
                            name="meetingUrl"
                            value={formData.meetingUrl}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter meeting URL (e.g., Zoom link)"
                            required
                          />
                        </div>
                        <div className="form-group full-width">
                          <label className="form-label">Description</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            placeholder="Enter session details (e.g., agenda)"
                            required
                          ></textarea>
                        </div>
                      </div>
                      <div className="button-group">
                        <button type="submit" className="send-btn">
                          Schedule
                        </button>
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}