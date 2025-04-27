import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { parse, isAfter } from 'date-fns';
import api from '../utils/api';
import loginImage from '../assets/images/login_image.jpg';
import quizImage from '../assets/images/quizzes.jpg';

export default function Quizzes() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    quizTitle: '',
    dueDate: '',
    duration: '30',
    description: '',
    quizUrl: '',
  });
  const [formError, setFormError] = useState('');
  const [isQuizCreated, setIsQuizCreated] = useState(false);
  const [emailStatus, setEmailStatus] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [redirectConfirmation, setRedirectConfirmation] = useState(null);

  useEffect(() => {
    console.log('Selected Students updated:', selectedStudents);
  }, [selectedStudents]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.role) {
          setError('User role not defined. Please log out and log in again.');
          setIsLoading(false);
          return;
        }

        console.log('User object:', user);

        if (user.role === 'teacher') {
          const studentResponse = await api.get('/users', {
            params: { role: 'teacher' },
          });
          console.log('Student API Response:', studentResponse.data);
          const formattedStudents = studentResponse.data
            .filter(student => student && student._id && student.name && student.email)
            .map(student => ({
              id: student._id,
              name: student.name,
              email: student.email,
            }));
          setStudents(formattedStudents);
          setFilteredStudents(formattedStudents);
        } else if (user.role === 'student') {
          if (!user._id && !user.id) {
            setError('User ID is missing. Please log out and log in again to resolve this issue.');
            setIsLoading(false);
            return;
          }

          const userId = user._id || user.id;
          const quizResponse = await api.get('/quizzes', {
            params: { userId, role: 'student' },
          });
          console.log('Quiz API Response:', quizResponse.data);

          if (!Array.isArray(quizResponse.data)) {
            setQuizzes([]);
            setError('No quizzes available.');
          } else {
            const validQuizzes = quizResponse.data
              .filter(quiz => 
                quiz && 
                quiz._id && 
                quiz.title && 
                quiz.dueDate && 
                quiz.duration && 
                quiz.assignedStudents && 
                quiz.assignedStudents.includes(userId)
              );
            setQuizzes(validQuizzes);
            if (validQuizzes.length === 0) {
              setError('No quizzes assigned to you.');
            }
          }
        }

        setIsLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setStudents([]);
          setFilteredStudents([]);
          setQuizzes([]);
          setError('No quizzes found.');
        } else if (error.response && error.response.status === 400) {
          setError(error.response.data.error || 'Invalid request. Please log out and log in again.');
        } else {
          setError(error.response?.data?.message || 'Unable to fetch data. Please try again later or contact support.');
        }
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'teacher') {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students, user?.role]);

  const handleStudentSelect = (student) => {
    setSelectedStudents(prev => {
      if (prev.some(s => s.id === student.id)) {
        return prev.filter(s => s.id !== student.id);
      }
      return [...prev, student];
    });
    setFormError('');
    setIsQuizCreated(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dueDate') {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      if (selectedDate < currentDate) {
        setFormError('Due date cannot be in the past');
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !email.includes('example.com');
  };

  const validateForm = () => {
    if (!Array.isArray(selectedStudents) || selectedStudents.length === 0) {
      return 'Please select at least one student to assign the quiz';
    }

    const invalidEmails = selectedStudents.filter(student => !validateEmail(student.email));
    if (invalidEmails.length > 0) {
      return `Invalid email addresses: ${invalidEmails.map(s => s.email).join(', ')}`;
    }

    if (!formData.quizTitle || formData.quizTitle.trim() === '') {
      return 'Quiz title is required';
    }
    if (!formData.dueDate) {
      return 'Due date is required';
    }
    if (!formData.duration) {
      return 'Duration is required';
    }
    if (!formData.description || formData.description.trim() === '') {
      return 'Description is required';
    }
    if (!formData.quizUrl || formData.quizUrl.trim() === '') {
      return 'Quiz URL is required';
    }

    try {
      const url = new URL(formData.quizUrl);
      if (!url.protocol.match(/^https?:$/)) {
        return 'Quiz URL must start with http:// or https://';
      }
    } catch (error) {
      return 'Please enter a valid quiz URL';
    }

    try {
      const parsedDueDate = parse(formData.dueDate, 'yyyy-MM-dd', new Date());
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (!isAfter(parsedDueDate, currentDate)) {
        return 'Due date must be in the future';
      }
    } catch (error) {
      return 'Invalid due date format';
    }

    return '';
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
  
    try {
      const quizData = {
        title: formData.quizTitle,
        dueDate: formData.dueDate,
        duration: formData.duration,
        description: formData.description,
        quizUrl: formData.quizUrl,
        createdBy: user.id,
        assignedStudents: selectedStudents.map(student => student.id),
      };
      const response = await api.post('/quizzes', quizData);
      const emailResults = response.data.emailResults || [];
      setEmailStatus(emailResults);
      setIsQuizCreated(true);
  
      setTimeout(() => {
        setSelectedStudents([]);
        setIsQuizCreated(false);
        setEmailStatus([]);
        setFormData({
          quizTitle: '',
          dueDate: '',
          duration: '30',
          description: '',
          quizUrl: '',
        });
        setShowPopup(false);
      }, 5000);
    } catch (error) {
      setFormError(error.response?.data?.error || error.message || 'Failed to create quiz');
    }
  };

  const handleCancel = () => {
    setSelectedStudents([]);
    setFormData({
      quizTitle: '',
      dueDate: '',
      duration: '30',
      description: '',
      quizUrl: '',
    });
    setFormError('');
    setIsQuizCreated(false);
    setEmailStatus([]);
    setShowPopup(false);
  };

  const handleQuizClick = (quiz) => {
    setRedirectConfirmation(quiz);
  };

  const confirmRedirect = () => {
    if (redirectConfirmation) {
      window.open(redirectConfirmation.quizUrl, '_blank');
      logout();
      navigate('/');
    }
    setRedirectConfirmation(null);
  };

  const cancelRedirect = () => {
    setRedirectConfirmation(null);
  };

  const styles = `
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
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
      background: rgba(255, 255, 255, 0.95);
      z-index: 1;
    }
    .content-wrapper {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .header-section {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
    }
    .back-button {
      padding: 0.6rem 1.2rem;
      background: linear-gradient(to right, #3b82f6, #60a5fa);
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .back-button:hover {
      background: linear-gradient(to right, #2563eb, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
    }
    .main-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
    }
    .student-card-container {
      flex: 1;
      min-width: 300px;
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    .quiz-card-container {
      width: 100%;
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    .quiz-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .create-quiz-card {
      flex: 2;
      min-width: 500px;
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .create-button {
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
    .create-button:hover {
      background: linear-gradient(to right, #2563eb, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
    }
    .section-subtitle {
      font-size: 1rem;
      color: #6b7280;
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
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 0.95rem;
      color: #1f2937;
      transition: all 0.3s ease;
    }
    .search-input::placeholder {
      color: #9ca3af;
    }
    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      background: #fff;
    }
    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      font-size: 1.1rem;
    }
    .student-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem;
      border-radius: 8px;
      background: #f9fafb;
      margin-bottom: 0.8rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .student-item:hover {
      background: #f3f4f6;
    }
    .student-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .student-info {
      flex: 1;
    }
    .student-name {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }
    .student-email {
      font-size: 0.85rem;
      color: #6b7280;
    }
    .quiz-item {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e7eb;
    }
    .quiz-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    .quiz-image-container {
      height: 150px;
      width: 100%;
      position: relative;
    }
    .quiz-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: none;
    }
    .quiz-content {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .quiz-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    .quiz-details {
      font-size: 0.9rem;
      color: #6b7280;
      line-height: 1.5;
    }
    .quiz-action {
      margin-top: 1rem;
      text-align: right;
    }
    .quiz-action-button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .quiz-action-button:hover {
      background: #2563eb;
    }
    .placeholder-text {
      font-size: 1.2rem;
      color: #6b7280;
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
      background: #e5e7eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .feature-text {
      font-size: 0.9rem;
      color: #1f2937;
    }
    .popup {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .popup-content {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 500px;
      padding: 2rem;
      position: relative;
      text-align: center;
    }
    .popup-icon {
      width: 60px;
      height: 60px;
      background: #3b82f6;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
      margin: 0 auto 1rem;
    }
    .popup-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #1f2937;
    }
    .confirmation-message {
      color: #6b7280;
      font-size: 1rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .confirmation-note {
      color: #3b82f6;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      font-style: italic;
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
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.95rem;
    }
    .form-input, .form-textarea, .form-select {
      width: 100%;
      padding: 0.8rem;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 0.95rem;
      color: #1f2937;
      transition: all 0.3s ease;
    }
    .form-input::placeholder, .form-textarea::placeholder {
      color: #9ca3af;
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      background: #fff;
    }
    .form-textarea {
      height: 100px;
      resize: vertical;
    }
    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1rem;
    }
    .create-btn, .cancel-btn, .confirm-btn, .cancel-redirect-btn {
      width: 48%;
      padding: 0.9rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .create-btn, .confirm-btn {
      background: #3b82f6;
      color: #fff;
    }
    .create-btn:hover, .confirm-btn:hover {
      background: #2563eb;
    }
    .cancel-btn, .cancel-redirect-btn {
      background: #ef4444;
      color: #fff;
    }
    .cancel-btn:hover, .cancel-redirect-btn:hover {
      background: #dc2626;
    }
    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }
    .success-message {
      color: #10b981;
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 1.5rem;
      text-align: center;
      background: #ecfdf5;
      padding: 1rem;
      border-radius: 8px;
    }
    .email-status {
      font-size: 0.9rem;
      margin-top: 0.5rem;
      text-align: center;
      color: #6b7280;
    }
    .email-status.failed {
      color: #f87171;
    }
    .error-message {
      color: #f87171;
      margin: 1rem 0;
      text-align: center;
      padding: 0.75rem;
      background-color: #fef2f2;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: #1f2937;
    }
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
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
      .student-card-container, .create-quiz-card {
        min-width: 100%;
      }
      .create-quiz-card {
        padding: 1.5rem;
      }
      .section-title {
        font-size: 1.8rem;
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
        font-size: 1.5rem;
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
      .student-item {
        padding: 0.8rem;
      }
      .quiz-image-container {
        height: 120px;
      }
      .quiz-title {
        font-size: 1.1rem;
      }
      .quiz-details {
        font-size: 0.85rem;
      }
      .quiz-action-button {
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
      }
      .feature-list {
        grid-template-columns: 1fr;
      }
      .popup-content {
        width: 95%;
        padding: 1.5rem;
      }
      .popup-title {
        font-size: 1.3rem;
      }
      .popup-icon {
        width: 50px;
        height: 50px;
        font-size: 1.8rem;
      }
      .confirmation-message {
        font-size: 0.9rem;
      }
      .confirmation-note {
        font-size: 0.85rem;
      }
      .form-input, .form-textarea, .form-select {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
      .create-btn, .cancel-btn, .confirm-btn, .cancel-redirect-btn {
        padding: 0.8rem;
        font-size: 0.9rem;
      }
    }
  `;

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="container">
          <div className="overlay"></div>
          <div className="content-wrapper">
            <div className="error-message">Please log in to access the quizzes feature.</div>
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
            <p>Loading...</p>
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
            {user.role === 'teacher' ? (
              <>
                <motion.div
                  className="student-card-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="section-title">Available Students</div>
                  <div className="search-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i className="fas fa-search search-icon"></i>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  {filteredStudents.length === 0 ? (
                    <div className="placeholder-text">No students found.</div>
                  ) : (
                    filteredStudents.map(student => (
                      <motion.div
                        key={student.id}
                        className="student-item"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="checkbox"
                          className="student-checkbox"
                          checked={selectedStudents.some(s => s.id === student.id)}
                          onChange={() => handleStudentSelect(student)}
                        />
                        <div className="student-info">
                          <div className="student-name">{student.name}</div>
                          <div className="student-email">{student.email}</div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
                <motion.div
                  className="create-quiz-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="section-title">Create a New Quiz</div>
                  <div className="section-subtitle">
                    Design a quiz for your students to assess their knowledge and track their progress.
                  </div>
                  <div className="feature-list">
                    <div className="feature-item">
                      <div className="feature-icon">📝</div>
                      <div className="feature-text">Create quizzes easily</div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">📅</div>
                      <div className="feature-text">Set due dates</div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">👥</div>
                      <div className="feature-text">Assign to students</div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">🔗</div>
                      <div className="feature-text">Provide quiz links</div>
                    </div>
                  </div>
                  {selectedStudents.length > 0 && (
                    <button className="create-button" onClick={() => setShowPopup(true)}>
                      Create Quiz
                    </button>
                  )}
                </motion.div>
              </>
            ) : (
              <motion.div
                className="quiz-card-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="quiz-header">
                  <h2 className="section-title">Assigned Quizzes</h2>
                </div>
                {error && <div className="error-message">{error}</div>}
                {quizzes.length === 0 ? (
                  <div className="placeholder-text">No quizzes assigned.</div>
                ) : (
                  <div className="quiz-list">
                    {quizzes
                      .filter(quiz => quiz && quiz._id && quiz.title && quiz.dueDate && quiz.duration)
                      .map(quiz => (
                        <motion.div
                          key={quiz._id}
                          className="quiz-item"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizClick(quiz)}
                        >
                          <div className="quiz-image-container">
                            <img
                              src={quizImage}
                              alt="Quiz"
                              className="quiz-image"
                            />
                          </div>
                          <div className="quiz-content">
                            <h3 className="quiz-title">{quiz.title}</h3>
                            <div className="quiz-details">
                              Due: {new Date(quiz.dueDate).toLocaleDateString()} <br />
                              Duration: {quiz.duration} minutes
                            </div>
                            <div className="quiz-action">
                              <button className="quiz-action-button">Take Quiz</button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <h2 className="popup-title">Create a New Quiz</h2>
              {formError && <div className="error-message">{formError}</div>}
              {isQuizCreated && (
                <div className="success-message">
                  Quiz created successfully!
                  {emailStatus.length > 0 && (
                    <div className="email-status">
                      {emailStatus.map((status, index) => (
                        <div key={index} className={status.success ? '' : 'failed'}>
                          {status.success
                            ? `Email sent to ${status.email}`
                            : `Failed to send email to ${status.email}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div>
                <div className="form-columns">
                  <div className="form-group">
                    <label className="form-label">Assign to Students</label>
                    <input
                      type="text"
                      value={selectedStudents.map(student => student.name).join(', ')}
                      readOnly
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quiz Title</label>
                    <input
                      type="text"
                      name="quizTitle"
                      value={formData.quizTitle}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quiz URL</label>
                    <input
                      type="text"
                      name="quizUrl"
                      value={formData.quizUrl}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter quiz URL"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Enter quiz description"
                    />
                  </div>
                </div>
                <div className="button-group">
                  <button type="button" className="create-btn" onClick={handleCreateQuiz}>Create Quiz</button>
                  <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {redirectConfirmation && (
          <div className="popup">
            <div className="popup-content">
              <div className="popup-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <h2 className="popup-title">Start Quiz: {redirectConfirmation.title}</h2>
              <div className="confirmation-message">
                Are you ready to take this quiz? You will be redirected to the quiz page.
              </div>
              <div className="confirmation-note">
                Note: You will be logged out after starting the quiz for security reasons.
              </div>
              <div className="button-group">
                <button className="confirm-btn" onClick={confirmRedirect}>Yes</button>
                <button className="cancel-redirect-btn" onClick={cancelRedirect}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}