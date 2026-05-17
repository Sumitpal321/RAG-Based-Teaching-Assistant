import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerApi } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
  username: '', password: '', fullname: '', email: '', 
  role: 'student', grade: '12', college: '', major: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(form);
      toast.success('Account created! Please sign in 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="floating-shapes">
        <div className="shape shape-1">🚀</div>
        <div className="shape shape-2">🌈</div>
        <div className="shape shape-3">⭐</div>
        <div className="shape shape-4">🎨</div>
        <div className="shape shape-5">🔬</div>
      </div>
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">🌟</div>
          <h1>Join TutorRAG!</h1>
          <p>Create your account to start learning</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input name="fullname" placeholder="Your full name" value={form.fullname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input name="username" placeholder="Choose username" value={form.username} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Create password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">🧑‍🎓 Student</option>
                <option value="teacher">👩‍🏫 Teacher</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grade</label>
              <input name="grade" placeholder="e.g. 12" value={form.grade} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>🏫 College</label>
            <input name="college" placeholder="Your college name" value={form.college} onChange={handleChange} />
          </div>
          {form.role === 'student' && (
            <div className="form-group">
              <label>📖 Major</label>
              <input name="major" placeholder="Your major" value={form.major} onChange={handleChange} />
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : '🎉 Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in! 🚀</Link></p>
        </div>
      </div>
    </div>
  );
}
