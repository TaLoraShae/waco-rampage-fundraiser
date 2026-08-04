import Link from "next/link";
import { adminSignOut } from "@/app/admin/auth-actions";
import { brand } from "@/lib/config";
import { getCurrentAdmin, roleLabel } from "@/lib/adminAuth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/content", label: "Site Wording" },
  { href: "/admin/settings", label: "Fundraiser Settings" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/administrators", label: "Administrators", ownerOnly: true },
  { href: "/admin/audit-log", label: "Audit Log", ownerOnly: true },
  { href: "/admin/setup-and-costs", label: "Setup & Costs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  const nav = NAV.filter((item) => !item.ownerOnly || admin?.role === "owner");

  return (
    <div className="min-h-screen flex bg-rampage-gray-light">
      <aside className="w-60 shrink-0 bg-rampage-charcoal text-white flex flex-col hidden md:flex">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-xs uppercase tracking-widest text-rampage-purple-light font-semibold">{brand.shortName}</p>
          <p className="font-display text-lg">Admin Dashboard</p>
          {admin && (
            <p className="text-xs text-white/50 mt-1">
              {admin.display_name || admin.email} · {roleLabel(admin.role)}
            </p>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white transition focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <Link href="/" className="block rounded-lg px-3 py-2 text-xs text-white/50 hover:text-white transition focus-ring">
            ← View public site
          </Link>
          <form action={adminSignOut}>
            <button
              type="submit"
              className="w-full text-left rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition focus-ring"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden bg-rampage-charcoal text-white px-4 py-3 flex items-center justify-between">
          <p className="font-display text-lg">Admin Dashboard</p>
          <form action={adminSignOut}>
            <button type="submit" className="text-xs text-white/70 underline focus-ring">
              Log out
            </button>
          </form>
        </div>
        <div className="md:hidden bg-rampage-charcoal/95 text-white/80 px-4 pb-3 flex flex-wrap gap-3 text-xs">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white focus-ring rounded">
              {item.label}
            </Link>
          ))}
        </div>
        <main className="p-4 sm:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
