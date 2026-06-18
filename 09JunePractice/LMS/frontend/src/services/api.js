/**
 * Centralized API client
 * All Phase 2 paths are proxied via vite.config.js → http://localhost:5000/api
 * In production, set VITE_API_URL to the backend origin.
 */

const BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token') || '';
}

/**
 * JSON request helper.
 * @param {string} endpoint  — e.g. '/announcements' (must start with '/')
 * @param {RequestInit} options
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const url = `${BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Multipart/form-data request helper (file uploads).
 * Does NOT set Content-Type so browser sets the boundary automatically.
 * @param {string} endpoint
 * @param {'POST'|'PUT'|'PATCH'} method
 * @param {FormData} formData
 */
export async function apiUpload(endpoint, method = 'POST', formData) {
  const token = getToken();
  const url = `${BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { method, headers, body: formData });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  return response.json();
}
