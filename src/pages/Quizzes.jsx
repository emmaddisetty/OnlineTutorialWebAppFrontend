import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImage from '../assets/images/login_image.jpg';

export default function Quizzes() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
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
  const [showPopup, setShowPopup] = useState(false);
  const [redirectConfirmation, setRedirectConfirmation] = useState(null);

  // Fetch quizzes and students (for teachers)
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role) {
          // Fetch quizzes
          const quizResponse = await axios.get('http://localhost:3001/api/quizzes', {
            params: { userId: user.id, role: user.role },
          });
          setQuizzes(quizResponse.data);
          setFilteredQuizzes(quizResponse.data);

          // Fetch students (only for teachers)
          if (user.role === 'teacher') {
            const studentResponse = await axios.get('http://localhost:3001/api/users?role=student');
            setStudents(studentResponse.data);
          }
        }
        setIsLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch data');
        setIsLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter quizzes based on search query
  useEffect(() => {
    const filtered = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuizzes(filtered);
  }, [searchQuery, quizzes]);

  const handleStudentSelect = (student) => {
    if (selectedStudents.includes(student)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
    setFormError('');
    setIsQuizCreated(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateForm = () => {
    if (selectedStudents.length === 0) return 'Please select at least one student to assign the quiz';
    if (!formData.quizTitle.trim()) return 'Quiz title is required';
    if (!formData.dueDate.trim()) return 'Due date is required';
    if (!formData.duration.trim()) return 'Duration is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.quizUrl.trim()) return 'Quiz URL is required';

    try {
      new URL(formData.quizUrl);
      if (!formData.quizUrl.match(/^(https?:\/\/)/)) {
        return 'Quiz URL must start with http:// or https://';
      }
    } catch (error) {
      return 'Please enter a valid quiz URL';
    }

    const selectedDueDate = new Date(formData.dueDate);
    const currentDate = new Date();
    if (selectedDueDate <= currentDate) return 'Due date must be in the future';

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
      // Create the quiz via API
      const quizData = {
        title: formData.quizTitle,
        dueDate: formData.dueDate,
        duration: formData.duration,
        description: formData.description,
        quizUrl: formData.quizUrl,
        createdBy: user.id,
        assignedStudents: selectedStudents.map(student => student.id),
      };
      const response = await axios.post('http://localhost:3001/api/quizzes', quizData);
      const newQuiz = response.data;

      // Update quizzes list
      setQuizzes(prev => [...prev, newQuiz]);
      setFilteredQuizzes(prev => [...prev, newQuiz]);

      // Send email to each assigned student
      for (const student of selectedStudents) {
        const subject = `New Quiz Assigned: ${formData.quizTitle}`;
        const message = `
Quiz Title: ${formData.quizTitle}
Due Date: ${formData.dueDate}
Duration: ${formData.duration} minutes
Description: ${formData.description}
Quiz URL: ${formData.quizUrl}

Please complete the quiz by the due date.
        `.trim();
        await axios.post('http://localhost:3001/api/email/send', {
          toEmail: student.email,
          subject,
          message,
          senderName: user.name,
          senderRole: user.role,
          recipientEmail: user.email,
          recipientName: student.name,
        });
      }

      setIsQuizCreated(true);
      setTimeout(() => {
        setSelectedStudents([]);
        setIsQuizCreated(false);
        setFormData({
          quizTitle: '',
          dueDate: '',
          duration: '30',
          description: '',
          quizUrl: '',
        });
        setShowPopup(false);
      }, 3000);
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to create quiz or send email');
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
    setShowPopup(false);
  };

  const handleQuizClick = (quiz) => {
    setRedirectConfirmation(quiz);
  };

  const confirmRedirect = () => {
    if (redirectConfirmation) {
      window.open(redirectConfirmation.quizUrl, '_blank');
    }
    setRedirectConfirmation(null);
  };

  const cancelRedirect = () => {
    setRedirectConfirmation(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    .back-button, .logout-button {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .back-button {
      background: linear-gradient(to right, #7c3aed, #a855f7);
      color: #fff;
    }
    .back-button:hover {
      background: linear-gradient(to right, #6d28d9, #9333ea);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(124, 58, 237, 0.4);
    }
    .logout-button {
      background: linear-gradient(to right, #ef4444, #f87171);
      color: #fff;
    }
    .logout-button:hover {
      background: linear-gradient(to right, #dc2626, #ef4444);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
    }
    .main-section {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .quiz-card-container {
      flex: 1;
      min-width: 300px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
    }
    .create-quiz-card {
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
    .quiz-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      margin-bottom: 0.8rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .quiz-item:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .quiz-info {
      flex: 1;
    }
    .quiz-title {
      font-size: 1rem;
      font-weight: 600;
      color: white;
    }
    .quiz-details {
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
    .student-list {
      max-height: 150px;
      overflow-y: auto;
      background: #2d3748;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 0.5rem;
    }
    .student-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      margin-bottom: 0.5rem;
    }
    .student-checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .student-name {
      font-size: 0.95rem;
      color: #e5e7eb;
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
      background: linear-gradient(to right, #3b82f6, #60a5fa);
      color: #fff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .create-btn:hover, .confirm-btn:hover {
      background: linear-gradient(to right, #2563eb, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
    }
    .cancel-btn, .cancel-redirect-btn {
      background: linear-gradient(to right, #ef4444, #f87171);
      color: #fff;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    .cancel-btn:hover, .cancel-redirect-btn:hover {
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
    .confirmation-message {
      color: #e5e7eb;
      font-size: 1.2rem;
      margin-top: 1.5rem;
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
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
      .quiz-card-container, .create-quiz-card {
        min-width: 100%;
      }
      .create-quiz-card {
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
      .quiz-item {
        padding: 0.6rem;
      }
      .quiz-title {
        font-size: 0.95rem;
      }
      .quiz-details {
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
      .create-btn, .cancel-btn {
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
            <p>Loading quizzes...</p>
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
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="main-section">
            {user.role === 'teacher' ? (
              <>
                <motion.div
                  className="quiz-card-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="section-title">Created Quizzes</div>
                  <div className="search-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search quizzes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i className="fas fa-search search-icon"></i>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  {filteredQuizzes.length === 0 ? (
                    <div className="placeholder-text">No quizzes found.</div>
                  ) : (
                    filteredQuizzes.map(quiz => (
                      <motion.div
                        key={quiz._id}
                        className="quiz-item"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="quiz-info">
                          <div className="quiz-title">{quiz.title}</div>
                          <div className="quiz-details">
                            Due: {quiz.dueDate} | Duration: {quiz.duration} minutes | Assigned: {quiz.assignedStudents.map(s => s.name).join(', ')}
                          </div>
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
                  <button className="create-button" onClick={() => setShowPopup(true)}>
                    Create Quiz
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div
                className="quiz-card-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ flex: '1', maxWidth: '600px', margin: '0 auto' }}
              >
                <div className="section-title">Assigned Quizzes</div>
                {error && <div className="error-message">{error}</div>}
                {quizzes.length === 0 ? (
                  <div className="placeholder-text">No quizzes assigned.</div>
                ) : (
                  quizzes.map(quiz => (
                    <motion.div
                      key={quiz._id}
                      className="quiz-item"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuizClick(quiz)}
                    >
                      <div className="quiz-info">
                        <div className="quiz-title">{quiz.title}</div>
                        <div className="quiz-details">
                          Due: {quiz.dueDate} | Duration: {quiz.duration} minutes
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Quiz Creation Popup for Teachers */}
        {showPopup && user.role === 'teacher' && (
          <div className="popup">
            <div className="popup-content">
              <div className="popup-title">Create a New Quiz</div>
              {isQuizCreated ? (
                <div className="success-message">
                  Quiz created and emails sent successfully! Assigned to {selectedStudents.map(student => student.name).join(', ')}.
                </div>
              ) : (
                <>
                  {formError && <div className="error-message">{formError}</div>}
                  <form onSubmit={handleCreateQuiz}>
                    <div className="form-columns">
                      <div className="form-group full-width">
                        <label className="form-label">Assign to Students</label>
                        <div className="student-list">
                          {students.map(student => (
                            <div key={student.id} className="student-item">
                              <input
                                type="checkbox"
                                className="student-checkbox"
                                checked={selectedStudents.includes(student)}
                                onChange={() => handleStudentSelect(student)}
                              />
                              <div className="student-name">{student.name}</div>
                            </div>
                          ))}
                        </div>
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
                          required
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
                          required
                        />
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
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                          <option value="90">90 minutes</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Quiz URL</label>
                        <input
                          type="url"
                          name="quizUrl"
                          value={formData.quizUrl}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter quiz URL (e.g., https://example.com)"
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
                          placeholder="Enter quiz description"
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="button-group">
                      <button type="submit" className="create-btn">
                        Create Quiz
                      </button>
                      <button type="button" className="cancel-btn" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Redirect Confirmation Popup for Students */}
        {redirectConfirmation && user.role === 'student' && (
          <div className="popup">
            <div className="popup-content">
              <div className="popup-title">Redirect to Quiz</div>
              <div className="confirmation-message">
                Are you sure you want to navigate to the quiz "{redirectConfirmation.title}"? This will open the quiz in a new tab.
              </div>
              <div className="button-group">
                <button className="confirm-btn" onClick={confirmRedirect}>
                  Yes, Proceed
                </button>
                <button className="cancel-redirect-btn" onClick={cancelRedirect}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}