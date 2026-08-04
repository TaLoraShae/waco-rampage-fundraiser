import Link from "next/link";
import { brand } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-rampage-black text-white/70 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-white text-lg tracking-wide mb-2">{brand.teamName}</p>
          <p className="text-sm leading-relaxed">{brand.tagline}</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-2 text-sm uppercase tracking-wide">Contact</p>
          <p className="text-sm">{brand.contact.email}</p>
          <p className="text-sm">{brand.contact.phone}</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-2 text-sm uppercase tracking-wide">Follow the team</p>
          <div className="flex gap-4 text-sm">
            {brand.social.instagram && (
              <a href={brand.social.instagram} className="hover:text-white focus-ring rounded" target="_blank" rel="noreferrer">
                Instagram
              </a>
            )}
            {brand.social.facebook && (
              <a href={brand.social.facebook} className="hover:text-white focus-ring rounded" target="_blank" rel="noreferrer">
                Facebook
              </a>
            )}
            {brand.social.twitter && (
              <a href={brand.social.twitter} className="hover:text-white focus-ring rounded" target="_blank" rel="noreferrer">
                X
              </a>
            )}
          </div>
          <Link href="/privacy" className="block mt-4 text-sm hover:text-white focus-ring rounded">
            Privacy statement
          </Link>
          <Link href="/admin/login" className="block mt-1 text-xs text-white/40 hover:text-white/70 focus-ring rounded">
            Admin login
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        {brand.footerText}
      </div>
    </footer>
  );
}
