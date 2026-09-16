const BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

// Base fetch helper
export async function api(path, options = {}) {
  const token = localStorage.getItem('eventforge_token');
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }

  // Ensure query functions never return undefined (which TanStack Query rejects)
  if (body.data !== undefined && body.data !== null) {
    return body.data;
  }
  return body !== undefined ? body : null;
}

// Axios-style wrappers used across components (api.get / api.post etc.)
api.get = (path, options = {}) =>
  api(path, { method: 'GET', ...options });

api.post = (path, data, options = {}) =>
  api(path, { method: 'POST', body: JSON.stringify(data), ...options });

api.put = (path, data, options = {}) =>
  api(path, { method: 'PUT', body: JSON.stringify(data), ...options });

api.patch = (path, data, options = {}) =>
  api(path, { method: 'PATCH', body: JSON.stringify(data), ...options });

api.delete = (path, options = {}) =>
  api(path, { method: 'DELETE', ...options });

export default api;
