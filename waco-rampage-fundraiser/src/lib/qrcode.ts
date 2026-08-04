import QRCode from "qrcode";

// Generates a QR code as a PNG data URL entirely in-process (no paid
// external QR service, and no network call at all). The URL passed in
// should always be built from NEXT_PUBLIC_SITE_URL so it stays correct
// automatically if the domain changes later.
export async function generateQrDataUrl(targetUrl: string): Promise<string> {
  return QRCode.toDataURL(targetUrl, {
    margin: 2,
    width: 480,
    color: {
      dark: "#2A1240",
      light: "#FFFFFF",
    },
  });
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function getPlayerUrl(slug: string): string {
  return `${getSiteUrl()}/support/${slug}`;
}
