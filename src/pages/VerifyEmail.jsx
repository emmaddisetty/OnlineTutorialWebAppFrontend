import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify/${token}`);
        setMessage('Email verified! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed');
      }
    };
    verifyEmail();
  }, [token, navigate]);

  const styles = `
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f0f0f0;
    }
    .card {
      background-color: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    .card h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      text-align: center;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <div className="card">
          <h2>{message}</h2>
        </div>
      </div>
    </>
  );
}