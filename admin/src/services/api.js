const TOKEN_KEY = 'portfolio.admin.token';

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function apiBase() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
}

export async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${apiBase()}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Unable to reach the server.', 0);
  }

  const json = await response.json().catch(() => ({}));
  if (response.status === 401 && !path.startsWith('/auth/login')) {
    setToken(null);
    window.dispatchEvent(new Event('admin:unauthorized'));
  }
  if (!response.ok || json.success === false) {
    throw new ApiError(json.message || 'Request failed', response.status);
  }
  return json.data;
}

export function siteUrl(path = '') {
  const base = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
  return `${base.replace(/\/$/, '')}${path}`;
}
