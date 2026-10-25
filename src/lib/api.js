// In production, use the site's same-origin Vercel rewrites so Django session
// and CSRF cookies stay attached to the portfolio domain.
const API_ROOT = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') : '';

let csrfToken = '';
export async function refreshCsrf() {
  let response;
  try {
    response = await fetch(`${API_ROOT}/api/auth/csrf/`, { credentials: 'include' });
  } catch {
    throw new Error('Could not reach the secure session service. Refresh the page and try again.');
  }
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(data?.detail || `Could not start a secure session (HTTP ${response.status}).`);
  if (!data?.csrfToken) throw new Error('The secure session service returned no CSRF token. Check the API proxy and try again.');
  csrfToken = data.csrfToken || '';
  return csrfToken;
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && options.body) headers['Content-Type'] = 'application/json';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
    if (!csrfToken) await refreshCsrf();
    headers['X-CSRFToken'] = csrfToken;
  }
  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers, credentials: 'include' });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const detail = payload?.detail || Object.values(payload || {}).flat().join(' ') || `Request failed (${response.status}).`;
    throw new Error(detail);
  }
  return payload;
}

export const assetUrl = (value) => value ? (value.startsWith('http') ? value : `${API_ROOT}${value}`) : '';

export async function apiList(path) {
  let nextPath = path;
  const items = [];
  while (nextPath) {
    const page = await api(nextPath);
    if (Array.isArray(page)) { items.push(...page); break; }
    items.push(...(page.results || []));
    nextPath = page.next ? `${new URL(page.next, API_ROOT).pathname}${new URL(page.next, API_ROOT).search}` : '';
  }
  return items;
}
