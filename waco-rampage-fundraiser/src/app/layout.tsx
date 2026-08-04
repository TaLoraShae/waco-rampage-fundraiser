import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/lib/config";
import { DataStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: `${brand.teamName} Fundraiser`,
  description: brand.fundraiserHeadline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-rampage-black min-h-screen flex flex-col">
        <DataStoreProvider>{children}</DataStoreProvider>
      </body>
    </html>
  );
}
