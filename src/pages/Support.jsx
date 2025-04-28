import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Adjust path as per your project structure
import { Link } from 'react-router-dom'; // Import Link for navigation
import { motion, AnimatePresence } from 'framer-motion';

const SupportPage = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    issueType: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const { name, email, issueType, description } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (field) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("https://formspree.io/f/mqaerqlg", {
        method: "POST",
        body: JSON.stringify({
          to: "onlinetutorialappadmin@gmail.com",
          subject: `Support Issue: ${issueType || 'General Concern'} from ${name}`,
          message: `User: ${name}\nEmail: ${email}\nIssue Type: ${issueType || 'Not Specified'}\nDescription: ${description}`
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      setSubmitSuccess(true);
      setFormData({ name: user?.name || '', email: user?.email || '', issueType: '', description: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to submit your concern. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = `
    html, body {
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100%;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #2b1b5e, #4b3a9b);
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .support-container {
      height: 100vh;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      padding: 1rem;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='30' fill='rgba(255,255,255,0.05)'/%3E%3Ccircle cx='20' cy='20' r='10' fill='rgba(255,255,255,0.03)'/%3E%3Ccircle cx='80' cy='80' r='15' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E");
      background-size: 100px 100px;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(43, 27, 94, 0.8), rgba(75, 58, 155, 0.7));
      z-index: 1;
    }
    .back-btn {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 3;
      padding: 0.8rem 1.5rem;
      background: linear-gradient(135deg, #a78bfa, #e0c3fc);
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);
    }
    .back-btn:hover {
      background: linear-gradient(135deg, #8b5cf6, #d8b4fe);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(167, 139, 250, 0.6);
    }
    .back-btn .btn-icon {
      transition: transform 0.3s ease;
    }
    .back-btn:hover .btn-icon {
      transform: translateX(-5px);
    }
    .content-wrapper {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 1100px;
      height: fit-content;
      max-height: 90vh;
      display: flex;
      gap: 2rem;
      padding: 1rem;
    }
    .info-panel {
      flex: 1;
      min-width: 300px;
      max-width: 400px;
      background: linear-gradient(145deg, #3b2a7f, #5b4ab5);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .info-panel::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      transform: rotate(45deg);
      pointer-events: none;
    }
    .info-title {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      background: linear-gradient(90deg, #a78bfa, #e0c3fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
    }
    .info-description {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      text-align: center;
    }
    .info-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
    .feature-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: default;
    }
    .feature-card:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    .feature-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #a78bfa, #e0c3fc);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.2rem;
      box-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
    }
    .feature-text {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
    }
    .form-panel {
      flex: 2;
      max-width: 600px;
      background: linear-gradient(145deg, #ffffff, #e0e7ff);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .form-panel::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%);
      transform: rotate(-45deg);
      pointer-events: none;
    }
    .form-title {
      font-size: 2rem;
      font-weight: 800;
      color: #4b3a9b;
      text-align: center;
    }
    .form-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      text-align: center;
      max-width: 500px;
      line-height: 1.6;
    }
    .support-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-group {
      position: relative;
      width: 100%;
      min-width: 0; /* Prevent overflow */
    }
    .form-label {
      display: block;
      color: #4b3a9b;
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }
    .form-group.active .form-label {
      color: #a78bfa;
      transform: translateY(-2px);
    }
    .form-input, .form-textarea, .form-select {
      width: 100%;
      padding: 0.9rem 1.2rem;
      background: rgba(255, 255, 255, 0.5);
      border: 2px solid #c7d2fe;
      border-radius: 12px;
      font-size: 1rem;
      color: #4b3a9b;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      box-sizing: border-box; /* Ensure padding doesn't affect width */
    }
    .form-input::placeholder, .form-textarea::placeholder {
      color: #9ca3af;
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      outline: none;
      border-color: #a78bfa;
      background: #ffffff;
      box-shadow: 0 0 12px rgba(167, 139, 250, 0.4);
    }
    .form-textarea {
      height: 100px;
      resize: none;
    }
    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b3a9b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.2rem;
    }
    .form-group::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(to right, #a78bfa, #e0c3fc);
      transition: width 0.3s ease;
    }
    .form-group.active::after {
      width: 100%;
    }
    .form-row {
      display: flex;
      flex-wrap: nowrap; /* Prevent wrapping to avoid overlap */
      gap: 1.5rem; /* Increase gap for better spacing */
      width: 100%;
      align-items: flex-start; /* Align items at the top */
    }
    .form-row .form-group {
      flex: 1; /* Distribute space equally */
      min-width: 0; /* Prevent overflow */
      max-width: 50%; /* Limit width to avoid overlap */
    }
    .submit-btn {
      padding: 1rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #a78bfa, #e0c3fc);
      color: #fff;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);
      position: relative;
      overflow: hidden;
    }
    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: 0.5s;
    }
    .submit-btn:hover::before {
      left: 100%;
    }
    .submit-btn:hover {
      background: linear-gradient(135deg, #8b5cf6, #d8b4fe);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(167, 139, 250, 0.6);
    }
    .submit-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      box-shadow: none;
    }
    .submit-btn .btn-icon {
      margin-left: 0.5rem;
      transition: transform 0.3s ease;
    }
    .submit-btn:hover .btn-icon {
      transform: translateX(5px) rotate(45deg);
    }
    .success-card {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 2rem;
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #34d399, #a3e635);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 2rem;
      position: relative;
      box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
      animation: bounce 0.5s ease;
    }
    .success-icon::after {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      border-radius: 50%;
      border: 2px solid rgba(52, 211, 153, 0.3);
      animation: pulse 2s infinite;
    }
    @keyframes bounce {
      0% { transform: scale(0.8); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    .success-message {
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(90deg, #34d399, #a3e635);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .success-submessage {
      font-size: 1.1rem;
      color: #6b7280;
      max-width: 500px;
    }
    .new-issue-btn {
      padding: 0.9rem 2rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #a78bfa, #e0c3fc);
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);
      position: relative;
      overflow: hidden;
    }
    .new-issue-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: 0.5s;
    }
    .new-issue-btn:hover::before {
      left: 100%;
    }
    .new-issue-btn:hover {
      background: linear-gradient(135deg, #8b5cf6, #d8b4fe);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(167, 139, 250, 0.6);
    }
    @media (max-width: 1024px) {
      .content-wrapper {
        flex-direction: column;
        align-items: center;
        padding: 1.5rem;
        max-height: 85vh;
      }
      .info-panel, .form-panel {
        min-width: 100%;
        max-width: 100%;
      }
      .info-title, .form-title {
        font-size: 1.8rem;
      }
      .info-description, .form-subtitle {
        font-size: 1rem;
      }
      .form-row {
        flex-direction: column;
        gap: 1rem; /* Adjust gap for smaller screens */
      }
      .form-row .form-group {
        max-width: 100%; /* Full width on smaller screens */
      }
      .back-btn {
        padding: 0.7rem 1.2rem;
        font-size: 0.9rem;
      }
    }
    @media (max-width: 768px) {
      .form-input, .form-textarea, .form-select {
        padding: 0.8rem;
        font-size: 0.95rem;
      }
      .form-label {
        font-size: 0.95rem;
      }
      .submit-btn, .new-issue-btn {
        padding: 0.9rem;
        font-size: 1rem;
      }
      .success-message {
        font-size: 1.5rem;
      }
      .success-submessage {
        font-size: 1rem;
      }
      .feature-text {
        font-size: 0.9rem;
      }
    }
    @media (max-width: 480px) {
      .content-wrapper {
        padding: 1rem;
        max-height: 80vh;
      }
      .info-title, .form-title {
        font-size: 1.6rem;
      }
      .info-description, .form-subtitle {
        font-size: 0.9rem;
      }
      .form-input, .form-textarea, .form-select {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
      .form-label {
        font-size: 0.9rem;
      }
      .submit-btn, .new-issue-btn {
        padding: 0.8rem;
        font-size: 0.95rem;
      }
      .success-icon {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
      }
      .success-message {
        font-size: 1.3rem;
      }
      .success-submessage {
        font-size: 0.9rem;
      }
      .back-btn {
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
      }
    }
  `;

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.2 } }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
  };

  return (
    <>
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
      />
      <div className="support-container">
        <Link to="/dashboard" className="back-btn">
          <i className="fas fa-arrow-left btn-icon"></i>
          Back to Dashboard
        </Link>
        <div className="overlay"></div>
        <motion.div
          className="content-wrapper"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <motion.div className="info-panel" variants={childVariants}>
            <h2 className="info-title">Discover Our App</h2>
            <p className="info-description">
              OnlineTutorialApp is your ultimate platform for learning and collaboration. We bring students and educators together in a dynamic, interactive environment designed for growth and success.
            </p>
            <div className="info-features">
              <motion.div className="feature-card" whileHover={{ scale: 1.02 }} variants={childVariants}>
                <div className="feature-icon">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <span className="feature-text">Expert Tutors</span>
              </motion.div>
              <motion.div className="feature-card" whileHover={{ scale: 1.02 }} variants={childVariants}>
                <div className="feature-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <span className="feature-text">Flexible Scheduling</span>
              </motion.div>
              <motion.div className="feature-card" whileHover={{ scale: 1.02 }} variants={childVariants}>
                <div className="feature-icon">
                  <i className="fas fa-laptop-code"></i>
                </div>
                <span className="feature-text">Interactive Lessons</span>
              </motion.div>
            </div>
          </motion.div>
          <motion.div className="form-panel" variants={childVariants}>
            <h1 className="form-title">Need Help?</h1>
            <p className="form-subtitle">
              Let us know about any issues or concerns, and our team will assist you promptly.
            </p>
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  key="success"
                  className="success-card"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={successVariants}
                >
                  <div className="success-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <h2 className="success-message">Issue Reported!</h2>
                  <p className="success-submessage">
                    Thank you, {name}, for reaching out. We'll respond to {email} soon.
                  </p>
                  <motion.button
                    className="new-issue-btn"
                    onClick={() => setSubmitSuccess(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Report Another Issue
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  className="support-form"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={successVariants}
                >
                  <div className="form-row">
                    <div className={`form-group ${activeField === 'name' ? 'active' : ''}`}>
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={onChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={handleBlur}
                        className="form-input"
                        placeholder="Enter your name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={`form-group ${activeField === 'email' ? 'active' : ''}`}>
                      <label className="form-label">Your Email</label>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        className="form-input"
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className={`form-group ${activeField === 'issueType' ? 'active' : ''}`}>
                    <label className="form-label">Issue Type</label>
                    <select
                      name="issueType"
                      value={issueType}
                      onChange={onChange}
                      onFocus={() => handleFocus('issueType')}
                      onBlur={handleBlur}
                      className="form-select"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select an issue type</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Login Issue">Login Issue</option>
                      <option value="Payment Issue">Courses Issue</option>
                      <option value="Payment Issue">Meeting Schedule</option>
                      <option value="Payment Issue">Quizzes Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className={`form-group ${activeField === 'description' ? 'active' : ''}`}>
                    <label className="form-label">Describe Your Issue</label>
                    <textarea
                      name="description"
                      value={description}
                      onChange={onChange}
                      onFocus={() => handleFocus('description')}
                      onBlur={handleBlur}
                      className="form-textarea"
                      placeholder="Tell us more about your issue..."
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                    {!isSubmitting && (
                      <i className="fas fa-arrow-right btn-icon"></i>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default SupportPage;