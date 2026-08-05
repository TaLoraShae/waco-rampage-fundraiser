import PrototypeBanner from "@/components/PrototypeBanner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import * as data from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const fundraiser = await data.getFundraiser();
  const settings = fundraiser ? await data.getSiteSettings(fundraiser.id) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <PrototypeBanner />
      <SiteHeader settings={settings} />
      <main className="flex-1 bg-rampage-black">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
