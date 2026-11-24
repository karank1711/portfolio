import { api } from '@/services/api.js';

const projectCache = new Map();

export function getPortfolio() {
  // Always revalidate so admin resume URL changes appear without a redeploy.
  return api('/portfolio', { method: 'GET', cache: 'no-store' });
}

export function getProject(slug, preview) {
  const cacheKey = `${slug}:${preview || ''}`;
  if (!preview && projectCache.has(cacheKey)) {
    return projectCache.get(cacheKey);
  }
  const query = preview ? `?preview=${encodeURIComponent(preview)}` : '';
  const promise = api(`/projects/slug/${encodeURIComponent(slug)}${query}`).catch((err) => {
    projectCache.delete(cacheKey);
    throw err;
  });
  if (!preview) {
    projectCache.set(cacheKey, promise);
  }
  return promise;
}

export function prefetchProject(slug) {
  if (!slug || projectCache.has(`${slug}:`)) return;
  getProject(slug).catch(() => {});
}

export function sendMessage(body) {
  return api('/contact', { method: 'POST', body });
}
