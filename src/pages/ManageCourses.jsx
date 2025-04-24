import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

export default function ManageCourses() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState({});
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, enrolled, in-progress, completed

  // Load course data and user course status
  useEffect(() => {
    if (user) {
      const fetchCourses = async () => {
        try {
          // Mock API call (same as Courses.jsx)
          const response = await fetch('https://jsonplaceholder.typicode.com/posts');
          const data = await response.json();
          
          const courseData = data.slice(0, 6).map((item, index) => ({
            id: item.id,
            title: `Course ${index + 1}: ${item.title.slice(0, 30)}`,
            instructor: `Instructor ${index + 1}`,
            category: ['Web Development', 'Programming', 'Database', 'Design'][index % 4],
            image: `https://images.unsplash.com/photo-154${7658719 + index * 1000}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
          }));
          
          setCourses(courseData);
          
          // Load user course status
          const storedUserCourses = JSON.parse(localStorage.getItem(`userCourses_${user.id}`)) || {};
          setUserCourses(storedUserCourses);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching courses:', error);
          setIsLoading(false);
        }
      };
      
      fetchCourses();
    }
  }, [user]);

  // Filter courses based on status
  const filteredCourses = Object.entries(userCourses).filter(([_, course]) => {
    if (filter === 'all') return true;
    return course.status === filter;
  }).map(([courseId, course]) => ({
    id: courseId,
    ...course,
    ...courses.find(c => c.id === parseInt(courseId)),
  }));

  const styles = `
    .manage-courses-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
      font-family: 'Inter', sans-serif;
      color: #2d3748;
      padding: 2rem;
    }

    .header-section {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .page-description {
      color: #4a5568;
      font-size: 1rem;
    }

    .filter-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-button {
      padding: 0.75rem 1.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-button.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .filter-button:hover:not(.active) {
      background: #f7fafc;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .course-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .course-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }

    .course-image {
      height: 160px;
      width: 100%;
      object-fit: cover;
    }

    .course-content {
      padding: 1.5rem;
    }

    .course-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 2.8rem;
    }

    .course-instructor {
      color: #718096;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .course-status {
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      text-transform: capitalize;
    }

    .course-status.enrolled { color: #3b82f6; }
    .course-status.in-progress { color: #10b981; }
    .course-status.completed { color: #7c3aed; }

    .progress-container {
      margin-bottom: 1rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .progress-label {
      font-size: 0.8rem;
      color: #718096;
    }

    .progress-percentage {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, #3b82f6, #7c3aed);
    }

    .completed-date {
      font-size: 0.85rem;
      color: #718096;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #e2e8f0;
      border-top: 5px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 1.1rem;
      color: #718096;
    }

    @media (max-width: 768px) {
      .courses-grid {
        grid-template-columns: 1fr;
      }

      .filter-container {
        flex-direction: column;
      }

      .filter-button {
        width: 100%;
        text-align: center;
      }
    }
  `;

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="manage-courses-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Please log in to manage your courses</p>
            <button 
              onClick={() => navigate('/login')} 
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="manage-courses-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your courses...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="manage-courses-page">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="header-section"
        >
          <h1 className="page-title">Manage Courses</h1>
          <p className="page-description">View and manage your enrolled, in-progress, and completed courses.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="filter-container"
        >
          {['all', 'enrolled', 'in-progress', 'completed'].map(status => (
            <button
              key={status}
              className={`filter-button ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="courses-grid"
        >
          {filteredCourses.length === 0 ? (
            <p>No courses found for this filter.</p>
          ) : (
            filteredCourses.map((course, index) => (
              <motion.div 
                key={course.id}
                className="course-card"
                whileHover={{ y: -5, boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <img src={course.image} alt={course.title} className="course-image" />
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">{course.instructor}</p>
                  <p className={`course-status ${course.status}`}>{course.status}</p>
                  <div className="progress-container">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-percentage">{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {course.completedDate && (
                    <p className="completed-date">
                      Completed: {new Date(course.completedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </>
  );
}