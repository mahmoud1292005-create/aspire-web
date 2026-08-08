import axios from 'axios';

// In production, VITE_API_URL points at the deployed Worker (e.g.
// https://aspire-server.<subdomain>.workers.dev/api). Locally it falls back
// to '/api', proxied to the local server by vite.config.js.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  // The backend authenticates via an httpOnly JWT cookie (see
  // server/controllers/authController.js), not a bearer token, so every
  // request needs to carry cookies - including cross-site ones, since the
  // frontend (Pages) and backend (Workers) are on different domains.
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      if (!window.location.pathname.startsWith('/signup') && !window.location.pathname.startsWith('/forgot-password') && !window.location.pathname.startsWith('/reset-password')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;