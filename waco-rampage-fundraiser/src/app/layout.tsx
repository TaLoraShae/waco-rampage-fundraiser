import type { Metadata } from "next";
import "./globals.css";
import * as data from "@/lib/data";

const FALLBACK_PRIMARY = "#6B2FA0";
const FALLBACK_SECONDARY = "#1E0E30";
const FALLBACK_ACCENT = "#8A4FC4";

export async function generateMetadata(): Promise<Metadata> {
  const fundraiser = await data.getFundraiser();
  const settings = fundraiser ? await data.getSiteSettings(fundraiser.id) : null;

  const teamName = settings?.team_name || "Team Fundraiser";
  const title = fundraiser ? `${teamName} — ${fundraiser.title}` : `${teamName} Fundraiser`;
  const description = fundraiser?.description || "Support our team's fundraiser.";
  const favicon = settings?.favicon_url;

  return {
    title,
    description,
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const fundraiser = await data.getFundraiser();
  const settings = fundraiser ? await data.getSiteSettings(fundraiser.id) : null;

  const cssVars = {
    "--color-primary": settings?.primary_color || FALLBACK_PRIMARY,
    "--color-secondary": settings?.secondary_color || FALLBACK_SECONDARY,
    "--color-accent": settings?.accent_color || FALLBACK_ACCENT,
  } as React.CSSProperties;

  return (
    <html lang="en">
      <body className="font-body bg-rampage-black min-h-screen flex flex-col" style={cssVars}>
        {children}
      </body>
    </html>
  );
}
