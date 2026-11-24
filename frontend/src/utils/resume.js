/**
 * Public resume URL from portfolio API data.
 * Prefer the saved Google Drive link as-is so Drive sharing params stay intact.
 * A version query is added only to help browsers avoid a stale tab for the same link.
 */
export function resumeHref(resume) {
  if (!resume?.fileUrl) return null;
  const version = resume.uploadedAt || '';
  if (!version) return resume.fileUrl;
  const separator = resume.fileUrl.includes('?') ? '&' : '?';
  return `${resume.fileUrl}${separator}v=${encodeURIComponent(version)}`;
}
