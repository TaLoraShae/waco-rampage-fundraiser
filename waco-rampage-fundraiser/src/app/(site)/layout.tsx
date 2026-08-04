import PrototypeBanner from "@/components/PrototypeBanner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PrototypeBanner />
      <SiteHeader />
      <main className="flex-1 bg-rampage-black">{children}</main>
      <SiteFooter />
    </div>
  );
}
