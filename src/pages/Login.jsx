import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import loginImage from '../assets/images/login_image.jpg'; // Import the image

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
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
    .info-section {
      flex: 1.2;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: white;
    }
    .info-section h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      background: linear-gradient(to right, #fff, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }
    .info-section p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.7;
      opacity: 0.9;
    }
    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 2rem;
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
    }
    .feature-text {
      font-size: 0.95rem;
    }
    .login-section {
      flex: 0.8;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 2rem;
      font-size: 2rem;
      font-weight: bold;
      color: white;
      letter-spacing: 1px;
    }
    .login-section h2 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      text-align: center;
      color: white;
    }
    .login-section p {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2rem;
    }
    .error {
      color: #fecaca;
      margin-bottom: 1rem;
      text-align: center;
      padding: 0.75rem;
      background-color: rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-group input {
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
    .form-group input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    .form-group input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.15);
    }
    .button {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(to right, #4f46e5, #6366f1);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .button:hover {
      background: linear-gradient(to right, #4338ca, #4f46e5);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(79, 70, 229, 0.4);
    }
    .signup-link {
      text-align: center;
      margin-top: 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
    }
    .signup-link a {
      color: #a5b4fc;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .signup-link a:hover {
      color: white;
      text-decoration: underline;
    }
    @media (max-width: 1024px) {
      .content-wrapper {
        flex-direction: column;
        height: auto;
        width: 90%;
      }
      .info-section {
        padding: 2rem;
      }
      .login-section {
        padding: 2rem;
        border-left: none;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      .feature-item {
        width: 100%;
      }
    }
    @media (max-width: 640px) {
      .content-wrapper {
        width: 95%;
      }
      .info-section {
        padding: 1.5rem;
      }
      .info-section h1 {
        font-size: 2rem;
      }
      .login-section {
        padding: 1.5rem;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <div className="overlay"></div>
        <div className="content-wrapper">
          <div className="info-section">
            <h1>Unlock Your Learning Potential</h1>
            <p>Join thousands of students who are mastering new skills, advancing their careers, and exploring their creativity through our expert-led online courses.</p>
            
            <div className="features">
              <div className="feature-item">
                <div className="feature-icon">📚</div>
                <div className="feature-text">Access to 10,000+ courses</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎓</div>
                <div className="feature-text">Expert instructors</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <div className="feature-text">Learn on any device</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🏆</div>
                <div className="feature-text">Earn certificates</div>
              </div>
            </div>
          </div>
          
          <div className="login-section">
            <div className="logo">LearnHub</div>
            <h2>Welcome Back</h2>
            <p>Continue your learning journey</p>
            
            {error && <div className="error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="button">Sign In</button>
            </form>
            
            <div className="signup-link">
              New to LearnHub? <a href="/Register">Create an account</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
