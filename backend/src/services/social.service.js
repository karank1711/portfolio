import { ApiError } from '../utils/ApiError.js';
import { createCollection } from './collection.service.js';

function assertUrl(platform, url) {
  if (!platform || !url) return;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url) || /^mailto:/i.test(url);
  const httpOk = /^https?:\/\/\S+$/i.test(url);
  if (platform === 'email' ? !emailOk : !httpOk) {
    throw new ApiError(400, platform === 'email' ? 'Enter a valid email address' : 'Enter a valid http(s) URL');
  }
}

const social = createCollection({
  table: 'social_links',
  columns: {
    platform: 'platform',
    label: 'label',
    url: 'url',
    isEnabled: 'is_enabled',
  },
  filterPublic: (builder) => builder.eq('is_enabled', true),
  normalize: (row, _input, existing) => {
    const platform = row.platform ?? existing?.platform;
    const url = row.url ?? existing?.url;
    if ((row.platform || row.url) && platform && url) assertUrl(platform, url);
    return row;
  },
});

export const listSocialLinks = social.list;
export const createSocialLink = social.create;
export const updateSocialLink = social.update;
export const deleteSocialLink = social.remove;
export const reorderSocialLinks = social.reorder;
