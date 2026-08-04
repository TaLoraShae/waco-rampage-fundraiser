// Small helpers for building the per-player fundraiser URL used by
// copy-link, native share, and the QR code (generated client-side in
// components/QrCodeBox.tsx).

export function getSiteUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function getPlayerUrl(slug: string): string {
  return `${getSiteUrl()}/support/${slug}`;
}
