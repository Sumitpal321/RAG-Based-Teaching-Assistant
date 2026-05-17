import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Brain, History, Upload, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/chat', icon: <MessageCircle size={18} />, label: 'Chat' },
    { to: '/quiz', icon: <Brain size={18} />, label: 'Quiz' },
    { to: '/quiz/history', icon: <History size={18} />, label: 'History' },
  ];

  const teacherLinks = [
    { to: '/upload', icon: <Upload size={18} />, label: 'Upload Docs' },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🎓</span>
        <span className="brand-name">AI Guru</span>
      </div>
      <div className="navbar-links">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
      <div className="navbar-user">
        <span className="user-badge">{user?.role === 'teacher' ? '👩‍🏫' : '🧑‍🎓'}</span>
        <span className="username">{user?.username}</span>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
