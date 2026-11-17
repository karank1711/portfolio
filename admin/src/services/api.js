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

export function uploadWithProgress(path, formData, { onProgress, timeout = 300000 } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiBase()}${path}`);
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = timeout;

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let json = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {}

      if (xhr.status === 401) {
        setToken(null);
        window.dispatchEvent(new Event('admin:unauthorized'));
      }

      if (xhr.status >= 200 && xhr.status < 300 && json.success !== false) {
        resolve(json.data);
      } else {
        reject(new ApiError(json.message || `Upload failed with status ${xhr.status}`, xhr.status));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError('Network error during upload. Please check your connection.', 0));
    };

    xhr.ontimeout = () => {
      reject(new ApiError('Upload timed out. The file took too long to transfer.', 0));
    };

    xhr.onabort = () => {
      reject(new ApiError('Upload was cancelled.', 0));
    };

    xhr.send(formData);
  });
}

export function siteUrl(path = '') {
  const base = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
  return `${base.replace(/\/$/, '')}${path}`;
}
