import { headers } from "next/headers";

// =====================================================================
// Builds the canonical, absolute public URL for a player's fundraiser
// page. Used for the displayed QR code, the downloaded QR image, the
// Copy Link button, and the Share button — all four always derive
// from this single function, so they can never disagree with each
// other or with the site's real production domain.
//
// Priority order:
//   1. NEXT_PUBLIC_SITE_URL (trimmed, trailing slash removed) — the
//      explicit production base URL. This always wins when set.
//   2. The current request's real host (via next/headers), so a
//      preview deployment or a temporarily-missing env var still
//      resolves to wherever the site is actually being served from —
//      never localhost.
//   3. The known production URL, as a last-resort safety net if
//      neither of the above is available (e.g. during static
//      generation with no request context).
// =====================================================================

const KNOWN_PRODUCTION_URL = "https://waco-rampage-fundraiser.vercel.app";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return normalizeBaseUrl(envUrl);

  if (typeof window !== "undefined") {
    return normalizeBaseUrl(window.location.origin);
  }

  try {
    const requestHeaders = headers();
    const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
    const proto = requestHeaders.get("x-forwarded-proto") || "https";
    if (host) return normalizeBaseUrl(`${proto}://${host}`);
  } catch {
    // headers() is only available inside a request (e.g. not during
    // build-time static generation) — fall through to the safe
    // default below rather than ever using localhost.
  }

  return KNOWN_PRODUCTION_URL;
}

export function getPlayerUrl(slug: string): string {
  return `${getSiteUrl()}/support/${slug}`;
}
