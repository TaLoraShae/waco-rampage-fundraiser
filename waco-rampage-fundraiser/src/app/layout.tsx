import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/lib/config";

export const metadata: Metadata = {
  title: `${brand.teamName} Fundraiser`,
  description: brand.fundraiserHeadline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-rampage-black min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
