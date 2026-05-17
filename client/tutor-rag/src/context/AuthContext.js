import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rag_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('rag_creds');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, creds) => {
    setUser(userData);
    setCredentials(creds);
    localStorage.setItem('rag_user', JSON.stringify(userData));
    localStorage.setItem('rag_creds', JSON.stringify(creds));
  };

  const logout = () => {
    setUser(null);
    setCredentials(null);
    localStorage.removeItem('rag_user');
    localStorage.removeItem('rag_creds');
  };

  const getAuthHeader = () => {
    if (!credentials) return {};
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    return { Authorization: `Basic ${encoded}` };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
