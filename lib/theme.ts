// PEEA brand tokens — mirrors peea-app/styles.css :root (converted from HSL).
// Single source of truth for inline RN styles; tailwind.config.js mirrors these.

export const colors = {
  bg: "#f5f1e8", // hsl(40 30% 96%)
  bgSoft: "#faf8f2", // hsl(40 30% 98%)
  card: "#ffffff",
  fg: "#3b2102", // hsl(32 94% 12%)
  fgMuted: "#996933", // hsl(32 50% 40%)
  fgSoft: "#af8f6a", // hsl(32 30% 55%)
  border: "#e8e0d1", // hsl(40 30% 88%)
  borderSoft: "#f0ebe0", // hsl(40 30% 92%)
  primary: "#eeaf01", // hsl(44 99% 47%)
  primarySoft: "#fef3d4", // hsl(44 99% 92%)
  primaryDark: "#a16a02", // hsl(40 98% 32%)
  accent: "#7d3403", // hsl(29 97% 25%)
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
} as const;

// A soft pastel avatar background derived deterministically from initials.
const AVATAR_BGS = [
  "#FCD34D",
  "#A5B4FC",
  "#FCA5A5",
  "#86EFAC",
  "#FDBA74",
  "#C4B5FD",
  "#A5F3FC",
  "#F9A8D4",
  "#FBBF24",
  "#93C5FD",
  "#FDA4AF",
  "#A7F3D0",
];

export function avatarBg(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_BGS[h % AVATAR_BGS.length];
}

export function initialsOf(firstName?: string, lastName?: string): string {
  return ((firstName?.[0] ?? "") + (lastName?.[0] ?? "")).toUpperCase();
}
