"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { brand } from "@/lib/config";
import { LightningBolt } from "./Lightning";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-rampage-black/98 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-20 sm:h-24">
        <Link href="/" className="flex items-center gap-3 focus-ring rounded shrink-0">
          <div className="relative h-14 w-24 sm:h-16 sm:w-28 shrink-0">
            <Image
              src={brand.logoUrl}
              alt={`${brand.teamName} logo`}
              fill
              sizes="120px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-bold tracking-wide text-white/85 uppercase">
          <Link href="/#players" className="hover:text-white focus-ring rounded transition">
            Players
          </Link>
          <Link href="/#leaderboard" className="hover:text-white focus-ring rounded transition">
            Leaderboard
          </Link>
          <Link href="/#faq" className="hover:text-white focus-ring rounded transition">
            FAQ
          </Link>
          <Link href="/#contact" className="hover:text-white focus-ring rounded transition">
            Contact
          </Link>
        </nav>

        <Link
          href="/#players"
          className="hidden sm:inline-flex items-center gap-2 rounded bg-rampage-purple px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-rampage-purple-light transition focus-ring shadow-glow"
        >
          <LightningBolt className="h-4 w-4" />
          Donate
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="md:hidden inline-flex flex-col gap-1.5 p-2 focus-ring rounded"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-rampage-black px-4 py-4 flex flex-col gap-4 text-sm font-bold uppercase tracking-wide text-white/85">
          <Link href="/#players" onClick={() => setOpen(false)} className="focus-ring rounded">
            Players
          </Link>
          <Link href="/#leaderboard" onClick={() => setOpen(false)} className="focus-ring rounded">
            Leaderboard
          </Link>
          <Link href="/#faq" onClick={() => setOpen(false)} className="focus-ring rounded">
            FAQ
          </Link>
          <Link href="/#contact" onClick={() => setOpen(false)} className="focus-ring rounded">
            Contact
          </Link>
          <Link
            href="/#players"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center gap-2 rounded bg-rampage-purple px-5 py-3 font-bold text-white focus-ring"
          >
            <LightningBolt className="h-4 w-4" />
            Donate
          </Link>
        </div>
      )}
    </header>
  );
}
