import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-rampage-black/95 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 focus-ring rounded">
          <div className="relative h-11 w-11 shrink-0 rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden">
            <Image
              src={brand.logoUrl}
              alt={`${brand.teamName} logo`}
              fill
              sizes="44px"
              className="object-contain p-1"
            />
          </div>
          <span className="font-display text-white text-lg sm:text-xl tracking-wide leading-none">
            {brand.teamName}
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-white/80">
          <Link href="/#players" className="hover:text-white focus-ring rounded">
            Players
          </Link>
          <Link href="/#leaderboard" className="hover:text-white focus-ring rounded">
            Leaderboard
          </Link>
          <Link href="/#faq" className="hover:text-white focus-ring rounded">
            FAQ
          </Link>
          <Link href="/#contact" className="hover:text-white focus-ring rounded">
            Contact
          </Link>
        </nav>
        <Link
          href="/#players"
          className="inline-flex items-center rounded-full bg-rampage-purple px-4 py-2 text-sm font-bold text-white hover:bg-rampage-purple-dark transition focus-ring"
        >
          Donate
        </Link>
      </div>
    </header>
  );
}
