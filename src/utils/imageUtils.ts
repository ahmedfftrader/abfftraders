/**
 * Utility functions for image URL handling and cache busting.
 * Automatically appends ?v=${Date.now()} to image URLs when updated
 * so new images render immediately without browser caching issues.
 */

export function withImageCacheBuster(url: string, version: number = Date.now()): string {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Data URLs (base64) and blob URLs are unique in-memory objects and don't need cache-busting
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  try {
    // If it's a full absolute URL (e.g. https://i.ibb.co/...)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const urlObj = new URL(trimmed);
      urlObj.searchParams.set('v', String(version));
      return urlObj.toString();
    }

    // If it's a relative path (e.g. /assets/...)
    const [pathAndQuery, hash] = trimmed.split('#');
    const [path, query] = pathAndQuery.split('?');
    const params = new URLSearchParams(query || '');
    params.set('v', String(version));
    const qs = params.toString();
    return `${path}?${qs}${hash ? `#${hash}` : ''}`;
  } catch {
    // Fallback regex replacement if URL parsing fails
    const clean = trimmed.replace(/([?&])v=\d+(&|$)/, '$1').replace(/[?&]$/, '');
    const joinChar = clean.includes('?') ? '&' : '?';
    return `${clean}${joinChar}v=${version}`;
  }
}

/**
 * Returns the optimized image URL for rendering.
 * If the URL already contains a cache-buster query parameter (?v=),
 * it preserves it so existing images don't refetch on unrelated state updates.
 * If it lacks one, it appends a fallback version.
 */
export function getOptimizedImageUrl(url: string, fallbackVersion?: number): string {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  // If already tagged with ?v= or &v=, keep as-is
  if (/[?&]v=\d+/.test(trimmed)) {
    return trimmed;
  }
  return withImageCacheBuster(trimmed, fallbackVersion || Date.now());
}
