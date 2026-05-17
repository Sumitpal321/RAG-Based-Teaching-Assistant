import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const api = (authHeader = {}) => axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', ...authHeader }
});

export const login = (username, password) => {
  const encoded = btoa(`${username}:${password}`);
  return axios.get(`${BASE_URL}/login`, {
    headers: { Authorization: `Basic ${encoded}` }
  });
};

export const register = (data) => {
  const endpoint = data.role === 'teacher' ? '/Signup/teacher' : '/Signup/student';
  return axios.post(`${BASE_URL}${endpoint}`, data);
};

export const sendChat = (query, authHeader) =>
  api(authHeader).post('/chat', { query });

export const generateQuiz = (topic, num_questions, authHeader) =>
  api(authHeader).post('/quiz', { topic, num_questions });

export const checkQuiz = (quiz_id, answers, authHeader) =>
  api(authHeader).post('/quiz/check', { quiz_id, answers });

export const getQuizHistory = (authHeader) =>
  api(authHeader).get('/quiz/history');

export const uploadDocs = (formData, authHeader) =>
  axios.post(`${BASE_URL}/upload_docs`, formData, {
    headers: { ...authHeader }
  });
