import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export async function getPatients() {
  const res = await api.get('/patients');
  return res.data;
}

export async function getPatientSessions(patientId) {
  const res = await api.get(`/patient/${patientId}`);
  return res.data;
}

export async function getPatientAnalysis(patientId) {
  const res = await api.get(`/patient/${patientId}/analyse`);
  return res.data;
}

export async function getPatientForecast(patientId) {
  const res = await api.get(`/patient/${patientId}/forecast`);
  return res.data;
}
