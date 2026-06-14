export const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5001/api'
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
