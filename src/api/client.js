import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}

export async function getUserSessions(userId) {
  const res = await api.get(`/user/${userId}`);
  return res.data;
}

export async function getUserAnalysis(userId) {
  const res = await api.get(`/user/${userId}/analyse`);
  return res.data;
}

export async function getUserForecast(userId) {
  const res = await api.get(`/user/${userId}/forecast`);
  return res.data;
}
