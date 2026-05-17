import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import QuizHistory from './pages/QuizHistory';
import UploadDocs from './pages/UploadDocs';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/chat" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Nunito, sans-serif' }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<PrivateRoute allowedRoles={['student']}><Chat /></PrivateRoute>} />
          <Route path="/quiz" element={<PrivateRoute allowedRoles={['student']}><Quiz /></PrivateRoute>} />
          <Route path="/quiz/history" element={<PrivateRoute allowedRoles={['student']}><QuizHistory /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute allowedRoles={['teacher']}><UploadDocs /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
