import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

export default function Courses() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCoursePopup, setShowAddCoursePopup] = useState(false);
  const [showRedirectPopup, setShowRedirectPopup] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCourse, setNewCourse] = useState({
    title: '',
    instructor: '',
    description: '',
    image: '',
    courseUrl: '',
    category: 'General',
    duration: 'Unknown',
    level: 'Beginner'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
        setFilteredCourses(response.data);
        setIsLoading(false);
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch courses');
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const validateForm = () => {
    const errors = {};
    if (!newCourse.title.trim()) errors.title = 'Title is required';
    if (!newCourse.instructor.trim()) errors.instructor = 'Instructor is required';
    if (!newCourse.description.trim()) errors.description = 'Description is required';
    if (newCourse.image.trim() && !/\.(jpg|jpeg|png|gif)$/i.test(newCourse.image)) {
      errors.image = 'Image must be in JPG, JPEG, PNG, or GIF format';
    }
    if (newCourse.courseUrl.trim() && !/^https?:\/\/.+/i.test(newCourse.courseUrl)) {
      errors.courseUrl = 'Course URL must be a valid URL';
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddCourse = async () => {
    if (user?.role !== 'teacher') {
      alert('Only teachers can add courses.');
      return;
    }
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const response = await api.post('/courses', newCourse);
      setCourses(prev => [...prev, response.data]);
      setFilteredCourses(prev => [...prev, response.data]);
      setShowAddCoursePopup(false);
      setNewCourse({
        title: '',
        instructor: '',
        description: '',
        image: '',
        courseUrl: '',
        category: 'General',
        duration: 'Unknown',
        level: 'Beginner'
      });
      setError(null);
      setFormErrors({});
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add course');
      setFormErrors({ general: error.response?.data?.message || 'Failed to add course' });
    }
  };

  const handleCancel = () => {
    setShowAddCoursePopup(false);
    setNewCourse({
      title: '',
      instructor: '',
      description: '',
      image: '',
      courseUrl: '',
      category: 'General',
      duration: 'Unknown',
      level: 'Beginner'
    });
    setFormErrors({});
  };

  const handleCourseClick = (course) => setShowRedirectPopup(course);

  const handleRedirect = (courseUrl) => {
    setUser(null);
    window.open(courseUrl, '_blank');
    navigate('/login');
  };

  const handleShare = (course) => {
    setShowSharePopup(course);
    setShareEmail('');
    setShareError(null);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail)) {
      setShareError('Please enter a valid email address');
      return;
    }

    try {
      const course = showSharePopup;
      const subject = `Course Recommendation: ${course.title}`;
      const courseDetails = {
        title: course.title,
        instructor: course.instructor,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        courseUrl: course.courseUrl,
      };
      // Fallback message for text version
      const message = `
        Course Title: ${course.title}
        Instructor: ${course.instructor}
        Description: ${course.description}
        Category: ${course.category}
        Level: ${course.level}
        Duration: ${course.duration}
        Course URL: ${course.courseUrl}
      `;

      await api.post('/email/send', {
        toEmail: shareEmail,
        subject,
        message, // Fallback for text version
        senderName: user?.name || 'Anonymous',
        senderRole: user?.role || 'user',
        recipientEmail: user?.email || 'Not provided',
        recipientName: '',
        type: 'course-share', // Indicate this is a course-share email
        courseDetails, // Send structured course details
      });

      setShowSharePopup(null);
      setShareEmail('');
      setShareError(null);
      alert('Course shared successfully!');
    } catch (error) {
      setShareError(error.response?.data?.message || 'Failed to send email');
    }
  };

  const styles = `
    html, body {
      margin: 0; padding: 0; height: 100%; width: 100%;
    }
    .courses-page {
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(120deg, #bfdbfe 0%, #93c5fd 100%);
      font-family: 'Inter', sans-serif;
      color: #1e40af;
      padding: 1.5rem;
      box-sizing: border-box;
      overflow-y: auto;
    }
    .section-header {
      background: #f9fafb;
      border-radius: 18px;
      padding: 1.2rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      max-width: 100%;
      box-sizing: border-box;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 2.2rem;
      font-weight: 900;
      margin: 0;
      color: #1e40af;
      letter-spacing: -1px;
    }
    .back-to-dashboard-btn {
      padding: 0.7rem 1.5rem;
      background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      font-size: 1rem;
      letter-spacing: 0.5px;
      box-shadow: 0 3px 8px rgba(59, 130, 246, 0.12);
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .back-to-dashboard-btn:hover {
      background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
      transform: translateY(-2px) scale(1.04);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.18);
    }
    .search-container {
      flex: 1;
      width: 100%;
      max-width: 400px;
      min-width: 250px;
      position: relative;
      margin: 0 1rem;
    }
    .search-input {
      width: 100%;
      padding: 0.7rem 2.2rem 0.7rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      background: #f9fafb;
      color: #1e40af;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      background: #eff6ff;
    }
    .search-icon {
      position: absolute;
      right: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: #3b82f6;
      font-size: 1.2rem;
    }
    .add-course-btn {
      padding: 0.7rem 2rem;
      background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      font-size: 1rem;
      letter-spacing: 0.5px;
      box-shadow: 0 3px 8px rgba(59, 130, 246, 0.12);
      transition: all 0.3s;
      flex-shrink: 0;
    }
    .add-course-btn:hover {
      background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
      transform: translateY(-2px) scale(1.04);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.18);
    }
    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .search-container {
        margin: 1rem 0;
        max-width: 100%;
      }
      .add-course-btn {
        width: 100%;
        text-align: center;
      }
    }
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .course-card {
      background: linear-gradient(120deg, #f9fafb 60%, #eff6ff 100%);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.10);
      transition: all 0.3s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      border: 2px solid #e5e7eb;
    }
    .course-card:hover {
      transform: translateY(-7px) scale(1.02);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.18);
      border-color: #3b82f6;
    }
    .course-image {
      height: 160px;
      width: 100%;
      object-fit: cover;
      border-bottom: 2px solid #e5e7eb;
    }
    .course-content {
      padding: 1rem 1.2rem;
      flex: 1;
    }
    .course-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.7rem;
    }
    .course-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e40af;
      flex: 1;
    }
    .course-instructor {
      color: #3b82f6;
      font-size: 0.98rem;
      font-weight: 600;
    }
    .course-actions {
      display: flex;
      gap: 0.6rem;
      padding: 0 1.2rem 1.2rem;
    }
    .action-button {
      flex: 1;
      padding: 0.7rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      font-family: 'Poppins', sans-serif;
      color: #fff;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.10);
    }
    .details-btn {
      background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
    }
    .details-btn:hover {
      background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
      transform: translateY(-2px) scale(1.03);
    }
    .share-btn {
      background: linear-gradient(90deg, #93c5fd 0%, #3b82f6 100%);
    }
    .share-btn:hover {
      background: linear-gradient(90deg, #3b82f6 0%, #93c5fd 100%);
      transform: translateY(-2px) scale(1.03);
    }
    .no-courses-message {
      text-align: center;
      font-size: 1.2rem;
      color: #6b7280;
      padding: 1.2rem;
      background: #f9fafb;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.10);
    }
    .error-message {
      text-align: center;
      font-size: 1.1rem;
      color: #f87171;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.10);
      margin-bottom: 1.5rem;
    }
    .form-error {
      color: #f87171;
      font-size: 0.85rem;
      margin-top: 0.2rem;
    }
    .general-error {
      color: #f87171;
      font-size: 1rem;
      text-align: center;
      margin-bottom: 0.95rem;
      background: #fef2f2;
      padding: 0.6rem;
      border-radius: 8px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100%;
    }
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #e5e7eb;
      border-top: 5px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1.2rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loading-text {
      font-size: 1.1rem;
      color: #6b7280;
    }
    .popup {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(59, 130, 246, 0.21);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }
    .popup-content {
      background: linear-gradient(120deg, #bfdbfe 60%, #93c5fd 100%);
      border-radius: 22px;
      box-shadow: 0 10px 40px rgba(59, 130, 246, 0.20);
      width: 96vw;
      max-width: 750px;
      min-height: 380px;
      display: flex;
      flex-direction: row;
      position: relative;
      overflow: hidden;
      padding: 0;
    }
    .popup-left {
      background: linear-gradient(120deg, #93c5fd 0%, #60a5fa 100%);
      flex: 1 1 40%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.2rem;
      position: relative;
    }
    .popup-icon-circle {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fff 60%, #e5e7eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.13);
      border: 4px solid #fff;
    }
    .popup-icon {
      font-size: 2.5rem;
      color: #3b82f6;
    }
    .popup-title {
      font-size: 1.7rem;
      font-weight: 800;
      color: #fff;
      text-align: center;
      margin-bottom: 0.5rem;
      letter-spacing: -1px;
      text-shadow: 0 2px 10px rgba(59, 130, 246, 0.09);
    }
    .popup-desc {
      color: #eff6ff;
      font-size: 1.06rem;
      text-align: center;
      margin-bottom: 1.2rem;
    }
    .popup-close {
      position: absolute;
      right: 1.2rem;
      top: 1.2rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #3b82f6;
      cursor: pointer;
      transition: all 0.3s;
      z-index: 2;
    }
    .popup-close:hover {
      color: #1e40af;
      transform: rotate(90deg) scale(1.1);
    }
    .popup-form-area {
      flex: 1 1 60%;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: transparent;
    }
    .popup-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      text-align: left;
    }
    .form-label {
      font-size: 0.97rem;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 0.2rem;
    }
    .form-input, .form-select {
      width: 100%;
      max-width: 100%;
      padding: 0.7rem;
      border: 2px solid #e5e7eb;
      border-radius: 9px;
      font-size: 1rem;
      background: #fff;
      color: #1e40af;
      transition: all 0.3s;
      box-sizing: border-box;
    }
    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.13);
      background: #eff6ff;
    }
    .popup-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .publish-btn {
      background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
      color: #fff;
      font-weight: 800;
      border: none;
      border-radius: 10px;
      font-size: 1.08rem;
      padding: 0.7rem 2.2rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.13);
      transition: all 0.3s;
    }
    .publish-btn:hover {
      background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
      transform: translateY(-2px) scale(1.04);
    }
    .cancel-btn {
      background: #6b7280;
      color: #fff;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      font-size: 1.08rem;
      padding: 0.7rem 2.2rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    .cancel-btn:hover {
      background: #4b5563;
      transform: translateY(-2px) scale(1.04);
    }
    .popup-content.details, .popup-content.redirect, .popup-content.share {
      min-height: 340px;
      max-width: 540px;
      flex-direction: column;
      padding: 0;
    }
    .popup-content.details .popup-left,
    .popup-content.redirect .popup-left,
    .popup-content.share .popup-left {
      background: linear-gradient(120deg, #3b82f6 0%, #1e40af 100%);
    }
    .popup-content.details .popup-title,
    .popup-content.redirect .popup-title,
    .popup-content.share .popup-title {
      color: #fff;
    }
    .popup-content.details .popup-icon,
    .popup-content.redirect .popup-icon,
    .popup-content.share .popup-icon {
      color: #3b82f6;
    }
    .popup-content.details .popup-form-area,
    .popup-content.redirect .popup-form-area,
    .popup-content.share .popup-form-area {
      padding: 2.5rem 2rem;
      background: #f9fafb;
    }
    .popup-content.details .popup-form,
    .popup-content.redirect .popup-form,
    .popup-content.share .popup-form {
      gap: 0.7rem;
    }
    .details-image {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.13);
      margin-bottom: 1.2rem;
    }
    .details-row {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      font-size: 1.01rem;
      margin-bottom: 0.4rem;
    }
    .details-label {
      font-weight: 700;
      color: #1e40af;
      min-width: 90px;
    }
    .details-value {
      color: #1e40af;
      font-weight: 600;
      flex: 1;
    }
    .popup-buttons.details, .popup-buttons.redirect, .popup-buttons.share {
      justify-content: flex-end;
      margin-top: 1.3rem;
    }
    .redirect-btn {
      background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
      color: #fff;
      font-weight: 800;
      border: none;
      border-radius: 10px;
      font-size: 1.08rem;
      padding: 0.7rem 2.2rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    .redirect-btn:hover {
      background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
      transform: translateY(-2px) scale(1.04);
    }
    .stay-btn {
      background: #6b7280;
      color: #fff;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      font-size: 1.08rem;
      padding: 0.7rem 2.2rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    .stay-btn:hover {
      background: #4b5563;
      transform: translateY(-2px) scale(1.04);
    }
  `;

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -20 }
  };

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="courses-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading courses...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div className="courses-page">
        {error && <div className="error-message">{error}</div>}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-header">
            <div className="header-left">
              <button
                className="back-to-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                aria-label="Go back to dashboard"
              >
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <h1 className="section-title">Course Catalog</h1>
            </div>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            {user?.role === 'teacher' && (
              <button
                className="add-course-btn"
                onClick={() => setShowAddCoursePopup(true)}
              >
                <i className="fas fa-plus mr-2"></i> Add Course
              </button>
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <div className="no-courses-message">
              No courses found. {user?.role === 'teacher' && 'Add a new course to get started!'}
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  className="course-card"
                  whileHover={{ y: -7, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.07 * index }}
                >
                  <img src={course.image} alt={course.title} className="course-image" onClick={() => handleCourseClick(course)} />
                  <div className="course-content">
                    <div className="course-info">
                      <h3 className="course-title">{course.title}</h3>
                      <span>|</span>
                      <p className="course-instructor">{course.instructor}</p>
                    </div>
                    <div style={{ fontSize: '0.98rem', color: '#6b7280', marginBottom: 8 }}>{course.category} · {course.level}</div>
                    <div style={{ fontSize: '0.96rem', color: '#4b5563', marginBottom: 4 }}>{course.description}</div>
                  </div>
                  <div className="course-actions">
                    <button
                      className="action-button details-btn"
                      onClick={() => setShowDetailsPopup(course)}
                    >
                      <i className="fas fa-info-circle mr-2"></i> Details
                    </button>
                    <button
                      className="action-button share-btn"
                      onClick={() => handleShare(course)}
                    >
                      <i className="fas fa-share-alt mr-2"></i> Share
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* --- ADD COURSE POPUP --- */}
        {showAddCoursePopup && (
          <div className="popup">
            <div className="popup-content">
              <div className="popup-left">
                <div className="popup-icon-circle">
                  <i className="fas fa-plus popup-icon"></i>
                </div>
                <div className="popup-title">Add Course</div>
                <div className="popup-desc">
                  Share your expertise and help others learn.<br />Fill in the details to publish a new course.
                </div>
              </div>
              <div className="popup-form-area">
                <button className="popup-close" onClick={handleCancel}>
                  <i className="fas fa-times"></i>
                </button>
                {formErrors.general && <div className="general-error">{formErrors.general}</div>}
                <form className="popup-form" onSubmit={e => { e.preventDefault(); handleAddCourse(); }}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newCourse.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Course title"
                      required
                    />
                    {formErrors.title && <span className="form-error">{formErrors.title}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instructor</label>
                    <input
                      type="text"
                      name="instructor"
                      value={newCourse.instructor}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Instructor name"
                      required
                    />
                    {formErrors.instructor && <span className="form-error">{formErrors.instructor}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={newCourse.description}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Short description"
                      required
                    />
                    {formErrors.description && <span className="form-error">{formErrors.description}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={newCourse.image}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Image URL"
                    />
                    {formErrors.image && <span className="form-error">{formErrors.image}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course URL</label>
                    <input
                      type="text"
                      name="courseUrl"
                      value={newCourse.courseUrl}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Course URL"
                    />
                    {formErrors.courseUrl && <span className="form-error">{formErrors.courseUrl}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      value={newCourse.category}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="General">General</option>
                      <option value="Technology">Technology</option>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                      <option value="Business">Business</option>
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Health">Health</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <select
                      name="duration"
                      value={newCourse.duration}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="1-2 hours">1-2 hours</option>
                      <option value="3-5 hours">3-5 hours</option>
                      <option value="6-10 hours">6-10 hours</option>
                      <option value="10+ hours">10+ hours</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level</label>
                    <select
                      name="level"
                      value={newCourse.level}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div className="popup-buttons">
                    <button className="publish-btn" type="submit">
                      Publish
                    </button>
                    <button className="cancel-btn" type="button" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- DETAILS POPUP --- */}
        <AnimatePresence>
          {showDetailsPopup && (
            <motion.div
              className="popup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="popup-content details"
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="popup-left">
                  <div className="popup-icon-circle">
                    <i className="fas fa-info popup-icon"></i>
                  </div>
                  <div className="popup-title">{showDetailsPopup.title}</div>
                  <div className="popup-desc">{showDetailsPopup.category} · {showDetailsPopup.level}</div>
                </div>
                <div className="popup-form-area">
                  <button className="popup-close" onClick={() => setShowDetailsPopup(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                  <img src={showDetailsPopup.image} alt={showDetailsPopup.title} className="details-image" />
                  <div className="details-row">
                    <span className="details-label">Instructor:</span>
                    <span className="details-value">{showDetailsPopup.instructor}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Duration:</span>
                    <span className="details-value">{showDetailsPopup.duration}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Level:</span>
                    <span className="details-value">{showDetailsPopup.level}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Description:</span>
                    <span className="details-value">{showDetailsPopup.description}</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">URL:</span>
                    <span className="details-value">
                      <a href={showDetailsPopup.courseUrl} target="_blank" rel="noopener noreferrer">
                        Visit Course
                      </a>
                    </span>
                  </div>
                  <div className="popup-buttons details">
                    <button className="cancel-btn" onClick={() => setShowDetailsPopup(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- REDIRECT POPUP --- */}
        <AnimatePresence>
          {showRedirectPopup && (
            <motion.div
              className="popup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="popup-content redirect"
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="popup-left">
                  <div className="popup-icon-circle">
                    <i className="fas fa-sign-out-alt popup-icon"></i>
                  </div>
                  <div className="popup-title">Course Access</div>
                  <div className="popup-desc">
                    You are about to access <b>{showRedirectPopup.title}</b>.<br />
                    For security, you will be logged out after redirection.
                  </div>
                </div>
                <div className="popup-form-area">
                  <button className="popup-close" onClick={() => setShowRedirectPopup(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                  <div className="popup-buttons redirect">
                    <button className="stay-btn" onClick={() => setShowRedirectPopup(null)}>
                      Stay
                    </button>
                    <button className="redirect-btn" onClick={() => handleRedirect(showRedirectPopup.courseUrl)}>
                      Proceed
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SHARE POPUP --- */}
        <AnimatePresence>
          {showSharePopup && (
            <motion.div
              className="popup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="popup-content share"
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="popup-left">
                  <div className="popup-icon-circle">
                    <i className="fas fa-share-alt popup-icon"></i>
                  </div>
                  <div className="popup-title">Share Course</div>
                  <div className="popup-desc">
                    Share <b>{showSharePopup.title}</b> with a friend!
                  </div>
                </div>
                <div className="popup-form-area">
                  <button className="popup-close" onClick={() => setShowSharePopup(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                  {shareError && <div className="general-error">{shareError}</div>}
                  <form className="popup-form" onSubmit={handleShareSubmit}>
                    <div className="form-group">
                      <label className="form-label">Recipient Email</label>
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        className="form-input"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="popup-buttons share">
                      <button className="cancel-btn" type="button" onClick={() => setShowSharePopup(null)}>
                        Cancel
                      </button>
                      <button className="publish-btn" type="submit">
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}