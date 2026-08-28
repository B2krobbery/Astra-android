// Robust SVG Fallback Avatar Generator for Candidate Photos & Avatars

export const getFallbackAvatarSvg = (name: string, isFemale: boolean = true): string => {
  const initial = (name || 'A').charAt(0).toUpperCase();
  const bgGradient = isFemale
    ? 'linear-gradient(135deg, #F43F5E 0%, #818CF8 100%)'
    : 'linear-gradient(135deg, #F59E0B 0%, #4F46E5 100%)';

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isFemale ? '#E11D48' : '#D97706'}" />
        <stop offset="100%" stop-color="${isFemale ? '#4F46E5' : '#1E1B4B'}" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#grad)"/>
    <circle cx="200" cy="160" r="75" fill="rgba(255, 255, 255, 0.25)"/>
    <path d="M 80,360 C 80,260 320,260 320,360 Z" fill="rgba(255, 255, 255, 0.25)"/>
    <text x="200" y="190" font-family="sans-serif" font-size="90" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${initial}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackName: string = 'Astra'
) => {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite loop
  target.src = getFallbackAvatarSvg(fallbackName, true);
};
