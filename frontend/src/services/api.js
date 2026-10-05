export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

function apiBase() {
  const configured = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const base = configured.replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}

export async function api(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check that the API is running.', 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new ApiError(payload.message || 'Request failed', response.status);
  }
  return payload.data;
}
