/**
 * Avatar generation and resolution utilities for UniSwap SA
 */

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'SP';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Generates an SVG data URI avatar using Sol Plaatje University colors
 */
export function generateInitialsAvatar(name?: string, bg = '0b2545', fg = 'ffffff'): string {
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="50" fill="#${bg}"/>
    <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', Roboto, sans-serif" font-size="38" font-weight="700" fill="#${fg}" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getUserAvatar(user?: { avatar_url?: string; full_name?: string; email?: string } | null): string {
  if (user?.avatar_url && user.avatar_url.trim()) {
    return user.avatar_url;
  }
  return generateInitialsAvatar(user?.full_name || user?.email || 'SPU Student', '0b2545', 'ffffff');
}
