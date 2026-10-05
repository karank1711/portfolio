import { api } from '@/services/api.js';

export function getPortfolio() {
  return api('/portfolio');
}

export function getProject(slug, preview) {
  const query = preview ? `?preview=${encodeURIComponent(preview)}` : '';
  return api(`/projects/slug/${encodeURIComponent(slug)}${query}`);
}

export function sendMessage(body) {
  return api('/contact', { method: 'POST', body });
}
