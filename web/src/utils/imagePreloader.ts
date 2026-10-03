const preloadedCache = new Set<string>();
/** URLs whose Image objects or <img> tags have confirmed pixels in memory/cache. */
const loadedCache = new Set<string>();
/** Retain in-flight Image objects to prevent JavaScript garbage collection from canceling network requests. */
const activePreloadImages = new Set<HTMLImageElement>();

/**
 * Returns true when the given URL has already finished loading in memory/cache,
 * meaning an <img> with this src will paint instantly without black frames.
 */
export function isImagePreloaded(url: string | undefined | null): boolean {
  if (!url) return false;
  return loadedCache.has(url);
}

/**
 * Marks a URL as confirmed loaded in cache (e.g. from an <img> onLoad or complete check).
 */
export function markImageAsLoaded(url: string | undefined | null): void {
  if (!url) return;
  loadedCache.add(url);
  preloadedCache.add(url);
}

/**
 * Preloads an array of image URLs into browser cache silently in the background,
 * decoding them off-main-thread so they paint instantly when mounted.
 */
export function preloadImages(urls: (string | undefined | null)[]): void {
  if (!urls || urls.length === 0) return;

  urls.forEach(url => {
    if (!url || preloadedCache.has(url) || url.startsWith('data:')) return;

    preloadedCache.add(url);
    const img = new Image();
    activePreloadImages.add(img);

    const cleanup = () => {
      activePreloadImages.delete(img);
    };

    img.onload = () => {
      loadedCache.add(url);
      cleanup();
    };

    img.onerror = () => {
      cleanup();
    };

    img.src = url;

    // Check if the browser already had it cached synchronously
    if (img.complete && img.naturalWidth > 0) {
      loadedCache.add(url);
      cleanup();
    } else if (typeof img.decode === 'function') {
      // Decode off-thread so GPU bitmap is ready before paint
      img.decode()
        .then(() => {
          loadedCache.add(url);
          cleanup();
        })
        .catch(() => {
          // Fall back to onload handler or ignore
        });
    }
  });
}
