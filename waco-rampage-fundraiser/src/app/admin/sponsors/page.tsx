"use client";

import Image from "next/image";
import { useState } from "react";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import { Sponsor } from "@/lib/types";

export default function AdminSponsorsPage() {
  const { db, createSponsor, deleteSponsorById } = useDataStore();
  const sponsors = sel.getSponsors(db);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [level, setLevel] = useState<Sponsor["level"]>("Gold");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createSponsor({
      name: name.trim(),
      website: website.trim(),
      level,
      logoUrl: logoUrl.trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`,
    });
    setName("");
    setWebsite("");
    setLogoUrl("");
    setLevel("Gold");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Sponsor Management</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="bg-white rounded-2xl border border-black/5 shadow-card-light overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-rampage-gray-light text-left">
              <tr>
                <th className="px-4 py-3">Logo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10">
                      <Image src={s.logoUrl} alt={`${s.name} logo`} fill className="object-contain" unoptimized />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-rampage-charcoal">{s.name}</td>
                  <td className="px-4 py-3">{s.level}</td>
                  <td className="px-4 py-3 truncate max-w-[160px]">
                    <a href={s.website} target="_blank" rel="noreferrer" className="text-rampage-purple hover:underline focus-ring rounded">
                      {s.website}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => deleteSponsorById(s.id)} className="text-xs font-semibold text-red-600 hover:underline focus-ring rounded">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-rampage-gray">
                    No sponsors added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-5 space-y-4 h-fit">
          <h2 className="font-display text-lg text-rampage-purple-dark">Add Sponsor</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-rampage-charcoal mb-1">Sponsor name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-rampage-charcoal mb-1">Website</label>
            <input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-semibold text-rampage-charcoal mb-1">Logo URL (optional)</label>
            <input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-semibold text-rampage-charcoal mb-1">Sponsor level</label>
            <select id="level" value={level} onChange={(e) => setLevel(e.target.value as Sponsor["level"])} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm">
              <option>Gold</option>
              <option>Silver</option>
              <option>Bronze</option>
              <option>Community</option>
            </select>
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-2.5 hover:bg-rampage-purple-dark transition focus-ring">
            Add Sponsor
          </button>
        </form>
      </div>
    </div>
  );
}
