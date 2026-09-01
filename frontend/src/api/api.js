import axios from 'axios';

// In production (combined deploy), API is on the same origin → use relative path
// In development, React runs on :3000 and backend on :5000
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);

// Notes endpoints
export const getNotes = () => API.get('/notes');
export const createNote = (data) => API.post('/notes', data);
export const updateNote = (id, data) => API.put(`/notes/${id}`, data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);
