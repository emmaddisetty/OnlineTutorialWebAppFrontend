import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import homeImage from '../assets/images/homeImage.jpg';

export default function Home() {
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
    }
    
    .home-container {
      height: 100vh;
      width: 100%;
      background: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${homeImage});
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      position: relative;
      overflow: hidden;
    }
    
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
    }
    
    .logo {
      font-size: 1.8rem;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      display: flex;
      align-items: center;
    }
    
    .logo-icon {
      margin-right: 0.5rem;
      font-size: 2rem;
    }
    
    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: 100vh;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      align-items: center;
    }
    
    .hero-content {
      padding: 1rem;
      max-width: 500px;
    }
    
    .hero-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 1rem;
    }
    
    .hero-title span {
      color: #8b5cf6;
    }
    
    .hero-subtitle {
      font-size: 1rem;
      color: #cbd5e1;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .cta-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .cta-button {
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cta-button.primary {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: #fff;
      border: none;
      box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
    }
    
    .cta-button.primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 20px -3px rgba(139, 92, 246, 0.4);
    }
    
    .cta-button.secondary {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .cta-button.secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-3px);
    }
    
    .cta-icon {
      margin-right: 0.5rem;
    }
    
    .stats-container {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #8b5cf6;
    }
    
    .stat-label {
      font-size: 0.8rem;
      color: #cbd5e1;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      position: relative;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 140px;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .feature-title {
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.3rem;
    }
    
    .feature-description {
      font-size: 0.8rem;
      color: #cbd5e1;
      line-height: 1.4;
    }
    
    .floating-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }
    
    .shape {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2));
      filter: blur(40px);
    }
    
    .shape-1 {
      width: 300px;
      height: 300px;
      top: 10%;
      left: -150px;
    }
    
    .shape-2 {
      width: 400px;
      height: 400px;
      bottom: 10%;
      right: -200px;
    }
    
    .shape-3 {
      width: 200px;
      height: 200px;
      top: 40%;
      right: 10%;
    }
    
    @media (max-width: 1024px) {
      .hero-section {
        grid-template-columns: 1fr;
        padding-top: 5rem;
      }
      
      .hero-content {
        text-align: center;
        margin: 0 auto;
        padding: 1rem;
      }
      
      .cta-buttons {
        justify-content: center;
      }
      
      .stats-container {
        justify-content: center;
      }
      
      .features-grid {
        grid-template-columns: 1fr 1fr;
        padding: 0 1rem;
      }
      
      .hero-title {
        font-size: 2rem;
      }
    }
    
    @media (max-width: 768px) {
      .navbar {
        padding: 0.5rem;
      }
      
      .hero-title {
        font-size: 1.8rem;
      }
      
      .hero-subtitle {
        font-size: 0.9rem;
      }
      
      .cta-buttons {
        flex-direction: column;
        gap: 0.8rem;
      }
      
      .stats-container {
        flex-wrap: wrap;
        justify-content: space-around;
        gap: 1rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .feature-card {
        height: 120px;
      }
    }
  `;

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="home-container">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <nav className="navbar">
          <Link to="/" className="logo">
            <span className="logo-icon">🎓</span>
            EduPortal
          </Link>
        </nav>
        
        <section className="hero-section">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Unlock Your Potential with <span>Interactive Learning</span>
            </h1>
            <p className="hero-subtitle">
              Join our platform to access high-quality courses, connect with expert instructors, and take your skills to the next level.
            </p>
            
            <div className="cta-buttons">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register" className="cta-button primary">
                  <span className="cta-icon">✨</span>
                  Get Started
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/login" className="cta-button secondary">
                  <span className="cta-icon">🔑</span>
                  Sign In
                </Link>
              </motion.div>
            </div>
            
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">50k+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">100+</span>
                <span className="stat-label">Instructors</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">✍️</div>
              <h3 className="feature-title">Enroll</h3>
              <p className="feature-description">Students can enroll in courses that match their interests.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Track Progress</h3>
              <p className="feature-description">Monitor your learning progress and stay on track.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Certificates</h3>
              <p className="feature-description">Earn certificates upon completing your courses.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">🛠️</div>
              <h3 className="feature-title">Manage Courses</h3>
              <p className="feature-description">Teachers can update and manage their course content.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Chat</h3>
              <p className="feature-description">Communicate directly with teachers for support.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-icon">🎥</div>
              <h3 className="feature-title">Live Sessions</h3>
              <p className="feature-description">Join interactive live sessions with instructors.</p>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
}