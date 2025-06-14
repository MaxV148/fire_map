import axios from 'axios';
import { BASE_URL } from './constants';

// Zentrale axios Instanz erstellen
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Für Session-Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor für 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    // Bei erfolgreichen Antworten nichts tun
    return response;
  },
  (error) => {
    // Bei 401 Unauthorized zur Login-Seite weiterleiten
    if (error.response?.status === 401) {
      // User zur Login-Seite weiterleiten
      if (!window.location.href.includes('login')) {
        window.location.href = '/login';
      }
      Promise.reject('Unauthorized');
    }
    
    // Fehler weiterwerfen für weitere Behandlung
    return Promise.reject(error);
  }
); 