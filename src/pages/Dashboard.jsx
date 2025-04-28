import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeCourses: 0,
    communityConnections: 0,
    scheduledEvents: 0,
    quizPerformance: 0
  });
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Simulate data fetching
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setStats({
          activeCourses: 4,
          communityConnections: 12,
          scheduledEvents: 5,
          quizPerformance: 85
        });
        
        setCourses([
          {
            id: 1,
            title: "Introduction to Web Development",
            instructor: "Dr. Sarah Johnson",
            progress: 75,
            nextLesson: "CSS Flexbox Layout",
            image: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 2,
            title: "Advanced JavaScript Concepts",
            instructor: "Prof. Michael Chen",
            progress: 45,
            nextLesson: "Promises and Async/Await",
            image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 3,
            title: "Database Design Fundamentals",
            instructor: "Dr. Emily Rodriguez",
            progress: 90,
            nextLesson: "Normalization Techniques",
            image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          }
        ]);
        
        setNotifications([
          {
            id: 1,
            type: "deadline",
            message: "Assignment 'React Components' due tomorrow",
            time: "20 hours left",
            course: "Advanced JavaScript Concepts"
          },
          {
            id: 2,
            type: "feedback",
            message: "Your project received feedback",
            time: "2 days ago",
            course: "Database Design Fundamentals"
          },
          {
            id: 3,
            type: "announcement",
            message: "New course materials available",
            time: "Just now",
            course: "Introduction to Web Development"
          }
        ]);
        
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get current date in readable format
  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  // Generate calendar dates
  const generateCalendarDates = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const dates = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i);
    }
    
    return dates;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const styles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
      font-family: 'Inter', sans-serif;
      color: #2d3748;
      padding: 0;
      overflow-x: hidden;
    }
    
    .dashboard-container {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
    }
    
    .sidebar {
      background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
      backdrop-filter: blur(10px);
      background-color: rgba(26, 26, 46, 0.8);
      color: #e0e0e0;
      padding: 2rem 1rem;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      transition: all 0.3s ease;
      z-index: 10;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .sidebar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.5;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      margin-bottom: 2.5rem;
      padding-left: 0.5rem;
    }
    
    .sidebar-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #00ddeb;
      text-shadow: 0 0 5px rgba(0, 221, 235, 0.5);
      margin-left: 0.5rem;
      font-family: 'Poppins', sans-serif;
    }
    
    .sidebar-logo {
      width: 40px;
      height: 40px;
      background: #00ddeb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      color: #1a1a2e;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 221, 235, 0.5);
    }
    
    .sidebar-logo:hover {
      transform: rotate(360deg);
      box-shadow: 0 0 20px rgba(0, 221, 235, 0.8);
    }
    
    .nav-links {
      list-style: none;
      padding: 0;
      margin-top: 1rem;
    }
    
    .nav-item {
      margin-bottom: 0.75rem;
      border-radius: 10px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      height: 3px;
      width: 0;
      background: linear-gradient(90deg, #ff2e63, #ff5e7e);
      transition: width 0.3s ease;
    }
    
    .nav-item:hover::before {
      width: 100%;
    }
    
    .nav-item.active {
      background: rgba(255, 46, 99, 0.25);
      box-shadow: inset 0 0 10px rgba(255, 46, 99, 0.2);
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 1rem;
      color: #e0e0e0;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
    }
    
    .nav-link:hover {
      color: #ff2e63;
      text-shadow: 0 0 8px rgba(255, 46, 99, 0.6);
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    
    .nav-link i {
      margin-right: 1rem;
      font-size: 1.4rem;
      transition: transform 0.3s ease;
    }
    
    .nav-link:hover i {
      transform: scale(1.15);
      color: #ff2e63;
    }
    
    .nav-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 2rem 0 1rem;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a0a0a0;
      font-family: 'Poppins', sans-serif;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border-left: 3px solid #ff2e63;
    }
    
    .nav-section i {
      color: #ff2e63;
      font-size: 1rem;
    }
    
    .user-profile {
      display: flex;
      align-items: center;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      padding: 0.75rem 1rem;
      border-radius: 12px;
      margin-top: auto;
      position: absolute;
      bottom: 2rem;
      left: 1rem;
      right: 1rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .user-profile:hover {
      transform: translateY(-3px);
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
      box-shadow: 0 6px 20px rgba(255, 46, 99, 0.3);
    }
    
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(145deg, #ff2e63, #ff5e7e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.2rem;
      color: #fff;
      margin-right: 1rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 0 12px rgba(255, 46, 99, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .avatar:hover {
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 46, 99, 0.8);
    }
    
    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 1rem;
      color: #e0e0e0;
      font-family: 'Poppins', sans-serif;
      margin-bottom: 0.2rem;
    }
    
    .user-role {
      font-size: 0.85rem;
      color: #a0a0a0;
      font-family: 'Poppins', sans-serif;
    }
    
    .logout-btn {
      background: none;
      border: none;
      color: #ff2e63;
      cursor: pointer;
      font-size: 1.3rem;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    .logout-btn:hover {
      background: rgba(255, 46, 99, 0.1);
      transform: rotate(90deg);
      color: #ff5e7e;
    }
    
    .logout-popup {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }
    
    .logout-popup-content {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      width: 90%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      position: relative;
      animation: popupFade 0.3s ease;
    }
    
    @keyframes popupFade {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .logout-icon {
      font-size: 2.5rem;
      color: #3b82f6;
      margin-bottom: 1rem;
    }
    
    .logout-message {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }
    
    .logout-submessage {
      font-size: 0.9rem;
      color: #718096;
      margin-bottom: 1.5rem;
    }
    
    .logout-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    
    .logout-btn-confirm,
    .stay-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
    }
    
    .logout-btn-confirm {
      background: #ff2e63;
      color: white;
    }
    
    .logout-btn-confirm:hover {
      background: #e02454;
      transform: translateY(-2px);
    }
    
    .stay-btn {
      background: #3b82f6;
      color: white;
    }
    
    .stay-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }
    
    .main-content {
      padding: 2rem;
      overflow-y: auto;
    }
    
    .welcome-section {
      margin-bottom: 2rem;
    }
    
    .date {
      color: #718096;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    
    .greeting {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .welcome-message {
      color: #4a5568;
      font-size: 1rem;
    }
    
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.3;
      pointer-events: none;
    }
    
    .stat-card.courses {
      background: linear-gradient(145deg, #ffffff, #e0f2fe);
    }
    
    .stat-card.connections {
      background: linear-gradient(145deg, #ffffff, #fefce8);
    }
    
    .stat-card.schedule {
      background: linear-gradient(145deg, #ffffff, #ecfeff);
    }
    
    .stat-card.quizzes {
      background: linear-gradient(145deg, #ffffff, #f3e8ff);
    }
    
    .stat-card:hover {
      transform: scale(1.03);
      box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
    }
    
    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .stat-title {
      color: #718096;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon.courses {
      background: linear-gradient(135deg, #3b82f6, #60a5fa);
      color: #fff;
    }
    
    .stat-icon.connections {
      background: linear-gradient(135deg, #eab308, #facc15);
      color: #fff;
    }
    
    .stat-icon.schedule {
      background: linear-gradient(135deg, #06b6d4, #22d3ee);
      color: #fff;
    }
    
    .stat-icon.quizzes {
      background: linear-gradient(135deg, #8b5cf6, #a78bfa);
      color: #fff;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      background: linear-gradient(90deg, #2d3748, #4a5568);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .stat-description {
      color: #718096;
      font-size: 0.85rem;
    }
    
    .stat-secondary {
      font-size: 0.8rem;
      color: #a0aec0;
      margin-top: 0.25rem;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .view-all {
      color: #3b82f6;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .view-all:hover {
      color: #2563eb;
      text-decoration: underline;
    }
    
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
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
      margin-bottom: 1rem;
    }
    
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
    
    .next-lesson {
      font-size: 0.85rem;
      color: #4a5568;
    }
    
    .next-lesson span {
      font-weight: 600;
    }
    
    .dashboard-footer {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 1.5rem;
    }
    
    .notifications-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .notification-item {
      display: flex;
      padding: 1rem 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .notification-item:last-child {
      border-bottom: none;
    }
    
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-size: 1.2rem;
    }
    
    .notification-icon.deadline {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    
    .notification-icon.feedback {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    
    .notification-icon.announcement {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-message {
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .notification-details {
      display: flex;
      justify-content: space-between;
    }
    
    .notification-course {
      font-size: 0.8rem;
      color: #718096;
    }
    
    .notification-time {
      font-size: 0.8rem;
      color: #a0aec0;
    }
    
    .calendar-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .calendar-title {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .calendar-nav {
      display: flex;
      gap: 0.5rem;
    }
    
    .calendar-nav-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #f7fafc;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .calendar-nav-btn:hover {
      background: #e2e8f0;
    }
    
    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .calendar-day-name {
      font-size: 0.75rem;
      color: #a0aec0;
      text-align: center;
      padding: 0.5rem 0;
    }
    
    .calendar-dates {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
    }
    
    .calendar-date {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .calendar-date:hover {
      background: #e2e8f0;
    }
    
    .calendar-date.today {
      background: #3b82f6;
      color: white;
    }
    
    .calendar-date.has-event {
      position: relative;
    }
    
    .calendar-date.has-event::after {
      content: '';
      position: absolute;
      bottom: 2px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #f59e0b;
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
    
    @media (max-width: 1024px) {
      .dashboard-container {
        grid-template-columns: 80px 1fr;
      }
      
      .sidebar {
        padding: 1.5rem 0.5rem;
      }
      
      .sidebar-header h2,
      .nav-link span,
      .nav-section,
      .user-info {
        display: none;
      }
      
      .nav-link {
        justify-content: center;
        padding: 0.75rem;
      }
      
      .nav-link i {
        margin-right: 0;
      }
      
      .user-profile {
        justify-content: center;
        padding: 0.75rem;
      }
      
      .avatar {
        margin-right: 0;
      }
      
      .logout-btn {
        display: block;
      }
      
      .dashboard-footer {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 768px) {
      .dashboard-container {
        grid-template-columns: 1fr;
      }
      
      .sidebar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: auto;
        padding: 0.5rem;
        z-index: 100;
        display: flex;
        justify-content: space-around;
      }
      
      .sidebar-header,
      .nav-section,
      .user-profile {
        display: none;
      }
      
      .nav-links {
        display: flex;
        margin: 0;
        width: 100%;
        justify-content: space-around;
      }
      
      .nav-item {
        margin: 0;
      }
      
      .nav-link {
        flex-direction: column;
        font-size: 0.7rem;
        padding: 0.5rem;
      }
      
      .nav-link i {
        margin-right: 0;
        margin-bottom: 0.25rem;
      }
      
      .nav-link span {
        display: block;
        font-size: 0.7rem;
      }
      
      .stats-container {
        grid-template-columns: 1fr 1fr;
      }
      
      .courses-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="dashboard">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Please log in to access your dashboard</p>
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
        <div className="dashboard">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your dashboard...</p>
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
      <div className="dashboard">
        <div className="dashboard-container">
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-logo">E</div>
              <h2>EduPortal</h2>
            </div>
            
            <ul className="nav-links">
              <li className="nav-item active">
                <a href="#" className="nav-link">
                  <i className="fas fa-house"></i>
                  <span>Dashboard</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => navigate('/courses')}>
                  <i className="fas fa-graduation-cap"></i>
                  <span>Courses</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => navigate('/connect')}>
                  <i className="fas fa-users"></i>
                  <span>Connect</span>
                </a>
              </li>
              
              <div className="nav-section">
                <i className="fas fa-book-open"></i>
                Learning
              </div>
              
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => navigate('/schedule')}>
                  <i className="fas fa-calendar-alt"></i>
                  <span>Schedule</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => navigate('/quizzes')}>
                  <i className="fas fa-question-circle"></i>
                  <span>Quizzes</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => navigate('/support')}>
                  <i className="fas fa-headset"></i>
                  <span>Support</span>
                </a>
              </li>
            </ul>
            
            <div className="user-profile">
              <div className="avatar">{getUserInitials()}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <button 
                className="logout-btn"
                onClick={() => setShowLogoutPopup(true)}
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </aside>
          
          <main className="main-content">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="welcome-section"
            >
              <div className="date">{getCurrentDate()}</div>
              <h1 className="greeting">{getGreeting()}, {user.name}!</h1>
              <p className="welcome-message">Track your progress and continue your learning journey.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="stats-container"
            >
              <motion.div 
                whileHover={{ scale: 1.03, boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)" }}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="stat-card courses"
                onClick={() => navigate('/courses')}
              >
                <div className="stat-header">
                  <div className="stat-title">Active Courses</div>
                  <div className="stat-icon courses">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                </div>
                <div className="stat-value">{stats.activeCourses}</div>
                <div className="stat-description">Courses you're currently enrolled in</div>
                <div className="stat-secondary">3 in progress</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)" }}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="stat-card connections"
                onClick={() => navigate('/connect')}
              >
                <div className="stat-header">
                  <div className="stat-title">Community Connections</div>
                  <div className="stat-icon connections">
                    <i className="fas fa-users"></i>
                  </div>
                </div>
                <div className="stat-value">{stats.communityConnections}</div>
                <div className="stat-description">Peers and mentors in your network</div>
                <div className="stat-secondary">2 new this week</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)" }}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="stat-card schedule"
                onClick={() => navigate('/schedule')}
              >
                <div className="stat-header">
                  <div className="stat-title">Scheduled Events</div>
                  <div className="stat-icon schedule">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                </div>
                <div className="stat-value">{stats.scheduledEvents}</div>
                <div className="stat-description">Upcoming classes and meetings</div>
                <div className="stat-secondary">Next in 2 days</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)" }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="stat-card quizzes"
                onClick={() => navigate('/quizzes')}
              >
                <div className="stat-header">
                  <div className="stat-title">Quiz Performance</div>
                  <div className="stat-icon quizzes">
                    <i className="fas fa-question-circle"></i>
                  </div>
                </div>
                <div className="stat-value">{stats.quizPerformance}%</div>
                <div className="stat-description">Average score across all quizzes</div>
                <div className="stat-secondary">Improved by 5%</div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="section-header">
                <h2 className="section-title">My Courses</h2>
                <a className="view-all" onClick={() => navigate('/courses')}>View All</a>
              </div>
              
              <div className="courses-grid">
                {courses.map((course, index) => (
                  <motion.div 
                    key={course.id}
                    className="course-card"
                    whileHover={{ y: -5, boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <img src={course.image} alt={course.title} className="course-image" />
                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-instructor">{course.instructor}</p>
                      
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
                      
                      <p className="next-lesson">
                        Next: <span>{course.nextLesson}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="dashboard-footer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="notifications-container">
                <div className="section-header">
                  <h2 className="section-title">Recent Notifications</h2>
                </div>
                
                {notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className={`notification-icon ${notification.type}`}>
                      <i className={`fas ${
                        notification.type === 'deadline' ? 'fa-calendar-day' : 
                        notification.type === 'feedback' ? 'fa-comment-dots' : 
                        'fa-bullhorn'
                      }`}></i>
                    </div>
                    <div className="notification-content">
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-details">
                        <span className="notification-course">{notification.course}</span>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="calendar-container">
                <div className="calendar-header">
                  <h3 className="calendar-title">April 2025</h3>
                  <div className="calendar-nav">
                    <button className="calendar-nav-btn">
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="calendar-nav-btn">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
                
                <div className="calendar-days">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="calendar-day-name">{day}</div>
                  ))}
                </div>
                
                <div className="calendar-dates">
                  {generateCalendarDates().map((date, index) => (
                    <div 
                      key={index} 
                      className={`calendar-date ${date === 19 ? 'today' : ''} ${[5, 12, 23].includes(date) ? 'has-event' : ''}`}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </main>

          {showLogoutPopup && (
            <div className="logout-popup">
              <motion.div
                className="logout-popup-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-graduation-cap logout-icon"></i>
                <h2 className="logout-message">Are you sure you want to logout?</h2>
                <p className="logout-submessage">You can continue your learning journey by staying logged in.</p>
                <div className="logout-buttons">
                  <button
                    className="stay-btn"
                    onClick={() => setShowLogoutPopup(false)}
                  >
                    Stay
                  </button>
                  <button
                    className="logout-btn-confirm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}