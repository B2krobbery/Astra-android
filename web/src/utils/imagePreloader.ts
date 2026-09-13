const preloadedCache = new Set<string>();

/**
 * Preloads an array of image URLs into browser cache silently in the background.
 */
export function preloadImages(urls: (string | undefined | null)[]): void {
  if (!urls || urls.length === 0) return;

  urls.forEach(url => {
    if (!url || preloadedCache.has(url) || url.startsWith('data:')) return;

    preloadedCache.add(url);
    const img = new Image();
    img.src = url;
    // Keep reference briefly to allow browser network queue to handle it
    img.onload = () => {};
    img.onerror = () => {};
  });
}
