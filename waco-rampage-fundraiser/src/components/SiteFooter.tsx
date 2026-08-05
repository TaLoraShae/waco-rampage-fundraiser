import Link from "next/link";
import Image from "next/image";
import { SiteSettings } from "@/lib/types";

export default function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const teamName = settings?.team_name || "Team Fundraiser";
  const footerLogo = settings?.footer_logo_url || settings?.logo_url;
  const hasSocial = settings?.facebook_url || settings?.instagram_url || settings?.twitter_url;
  const hasContact = settings?.contact_email || settings?.contact_phone || settings?.website_url;

  return (
    <footer id="contact" className="bg-rampage-black text-white/70 border-t border-white/10 texture-grain">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-3">
        <div>
          {footerLogo && (
            <div className="relative h-14 w-28 mb-4 opacity-90">
              <Image src={footerLogo} alt={`${teamName} logo`} fill sizes="112px" className="object-contain object-left" unoptimized={footerLogo.startsWith("http")} />
            </div>
          )}
          {settings?.footer_description && <p className="text-sm leading-relaxed">{settings.footer_description}</p>}
          {settings?.team_photo_url && (
            <div className="relative mt-4 h-24 w-full max-w-[200px] rounded-lg overflow-hidden">
              <Image src={settings.team_photo_url} alt={`${teamName} team photo`} fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        {hasContact && (
          <div>
            <p className="font-display text-white mb-2 text-sm tracking-wide">CONTACT</p>
            {settings?.contact_email && <p className="text-sm">{settings.contact_email}</p>}
            {settings?.contact_phone && <p className="text-sm">{settings.contact_phone}</p>}
            {settings?.website_url && (
              <a href={settings.website_url} target="_blank" rel="noreferrer" className="text-sm hover:text-white focus-ring rounded block mt-1">
                {settings.website_url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}

        <div>
          {hasSocial && (
            <>
              <p className="font-display text-white mb-2 text-sm tracking-wide">FOLLOW THE TEAM</p>
              <div className="flex gap-4 text-sm">
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} className="hover:text-white focus-ring rounded" target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                )}
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} className="hover:text-white focus-ring rounded" target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                )}
                {settings?.twitter_url && (
                  <a href={settings.twitter_url} className="hover:text-white focus-ring rounded" target="_blank" rel="noreferrer">
                    X
                  </a>
                )}
              </div>
            </>
          )}
          <Link
            href={settings?.privacy_policy_url || "/privacy"}
            target={settings?.privacy_policy_url ? "_blank" : undefined}
            rel={settings?.privacy_policy_url ? "noreferrer" : undefined}
            className="block mt-4 text-sm hover:text-white focus-ring rounded"
          >
            Privacy statement
          </Link>
          {settings?.terms_url && (
            <a href={settings.terms_url} target="_blank" rel="noreferrer" className="block mt-1 text-sm hover:text-white focus-ring rounded">
              Terms of Service
            </a>
          )}
          <Link href="/admin/login" className="block mt-1 text-xs text-white/40 hover:text-white/70 focus-ring rounded">
            Admin login
          </Link>
        </div>
      </div>
      {settings?.copyright_text && (
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">{settings.copyright_text}</div>
      )}
    </footer>
  );
}
