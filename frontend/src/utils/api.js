export const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://127.0.0.1:5001/api'
  : 'https://shirly-cosmetics-api.onrender.com/api';

export const fetchTreatments = async () => {
  const res = await fetch(`${API_URL}/treatments`);
  if (!res.ok) throw new Error('Failed to fetch treatments');
  return res.json();
};

export const fetchAppointments = async () => {
  const res = await fetch(`${API_URL}/appointments`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
};

export const fetchClients = async () => {
  const res = await fetch(`${API_URL}/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
};
