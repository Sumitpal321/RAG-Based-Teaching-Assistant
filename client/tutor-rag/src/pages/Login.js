import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi(username, password);
      const userData = {
        username: username,
        role: res.data.role || (res.data.message?.includes('teacher') ? 'teacher' : 'student'),
        grade: res.data.grade
      };
      login(userData, { username, password });
      toast.success(`Welcome back, ${username}! 🎉`);
      if (userData.role === 'teacher') navigate('/upload');
      else navigate('/chat');
    } catch (err) {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="floating-shapes">
        <div className="shape shape-1">📚</div>
        <div className="shape shape-2">✏️</div>
        <div className="shape shape-3">🌟</div>
        <div className="shape shape-4">🎯</div>
        <div className="shape shape-5">💡</div>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h1>Welcome Back!</h1>
          <p>Sign in to continue learning</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : '🚀 Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create one! 🌟</Link></p>
        </div>
      </div>
    </div>
  );
}