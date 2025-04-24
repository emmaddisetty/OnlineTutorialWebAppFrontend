import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import registerImage from '../assets/images/register_image.webp';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    eNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^e[0-9]{7}$/.test(formData.eNumber)) {
      setError('E-number must be "e" followed by 7 digits');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/register', formData);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body, html {
      height: 100%;
      overflow: hidden;
    }
    
    .register-page {
      height: 100vh;
      width: 100vw;
      background-image: url(${registerImage});
      background-size: cover;
      background-position: center;
      display: flex;
      position: relative;
    }
    
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8));
      z-index: 1;
    }
    
    .content-side {
      position: relative;
      z-index: 2;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px;
    }
    
    .content-wrapper {
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      color: white;
    }
    
    .content-wrapper h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(to right, #fff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .content-wrapper p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 1.5rem;
    }
    
    .feature-list {
      list-style: none;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .feature-icon {
      width: 32px;
      height: 32px;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: #93c5fd;
    }
    
    .form-side {
      position: relative;
      z-index: 2;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }
    
    .register-container {
      width: 100%;
      max-width: 450px;
      padding: 30px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 25px;
    }
    
    .register-header h2 {
      color: white;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .register-header p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
    }
    
    .error-message {
      background-color: rgba(220, 38, 38, 0.2);
      color: #fca5a5;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 14px;
    }
    
    .form-row {
      margin-bottom: 18px;
    }
    
    .form-row label {
      display: block;
      color: white;
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 15px;
    }
    
    .form-row input {
      width: 100%;
      padding: 12px 15px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 15px;
      transition: border-color 0.3s;
    }
    
    .form-row input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .form-row input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
    
    .role-selection {
      display: flex;
      gap: 15px;
    }
    
    .role-option {
      flex: 1;
      position: relative;
    }
    
    .role-option input {
      position: absolute;
      opacity: 0;
    }
    
    .role-option label {
      display: block;
      padding: 12px;
      text-align: center;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .role-option input:checked + label {
      background: rgba(59, 130, 246, 0.3);
      border-color: rgba(59, 130, 246, 0.6);
    }
    
    .register-button {
      width: 100%;
      padding: 14px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
      margin-top: 10px;
    }
    
    .register-button:hover {
      background: #2563eb;
    }
    
    .login-link {
      text-align: center;
      margin-top: 20px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
    }
    
    .login-link a {
      color: #93c5fd;
      text-decoration: none;
      font-weight: 500;
    }
    
    .login-link a:hover {
      text-decoration: underline;
    }
    
    .success-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .success-content {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      max-width: 90%;
      width: 400px;
    }
    
    .success-icon {
      width: 70px;
      height: 70px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 20px;
      font-size: 35px;
      color: #10b981;
    }
    
    .success-title {
      color: white;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    
    .success-message {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 10px;
    }
    
    @media (max-width: 768px) {
      .register-page {
        flex-direction: column;
      }
      
      .content-side {
        display: none;
      }
      
      .form-side {
        padding: 20px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="register-page">
        <div className="overlay"></div>
        
        <div className="content-side">
          <div className="content-wrapper">
            <h1>Expand Your Knowledge</h1>
            <p>Join our learning platform and gain access to expert-led courses designed to help you achieve your educational goals.</p>
            
            <ul className="feature-list">
              <li className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Access to premium courses</span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Learn from expert instructors</span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Track your progress</span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Earn certificates</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="form-side">
          <div className="register-container">
            <div className="register-header">
              <h2>Create Account</h2>
              <p>Join our community of learners</p>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-row">
                <label>E-Number</label>
                <input
                  type="text"
                  name="eNumber"
                  value={formData.eNumber}
                  onChange={handleChange}
                  placeholder="e.g., e1234567"
                  required
                />
              </div>
              
              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="form-row">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>
              
              <div className="form-row">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <div className="form-row">
                <label>I am a:</label>
                <div className="role-selection">
                  <div className="role-option">
                    <input
                      type="radio"
                      id="student"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleChange}
                    />
                    <label htmlFor="student">Student</label>
                  </div>
                  
                  <div className="role-option">
                    <input
                      type="radio"
                      id="teacher"
                      name="role"
                      value="teacher"
                      checked={formData.role === 'teacher'}
                      onChange={handleChange}
                    />
                    <label htmlFor="teacher">Teacher</label>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="register-button">
                Create Account
              </button>
            </form>
            
            <div className="login-link">
              Already have an account? <a href="/login">Sign in</a>
            </div>
          </div>
        </div>
      </div>
      
      {showPopup && (
        <div className="success-popup">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h3 className="success-title">Registration Successful!</h3>
            <p className="success-message">
              Please check your email to verify your account.
            </p>
            <p className="success-message">
              You will be redirected to the login page...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
