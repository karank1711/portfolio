export function socialHref(link) {
  if (!link?.url) return '';
  if (link.platform === 'email') {
    return link.url.startsWith('mailto:') ? link.url : `mailto:${link.url}`;
  }
  return link.url;
}

export function isExternal(link) {
  return link?.platform !== 'email';
}
