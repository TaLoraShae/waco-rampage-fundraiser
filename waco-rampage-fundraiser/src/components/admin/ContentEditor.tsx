"use client";

import { useRef, useState } from "react";
import { SiteContentItem } from "@/lib/types";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  buttons: "Button Labels",
  faq: "FAQ",
};

export default function ContentEditor({
  fundraiserId,
  items,
  action,
}: {
  fundraiserId: string;
  items: SiteContentItem[];
  action: (formData: FormData) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const item of items) map[`${item.section}.${item.key}`] = item.value;
    return map;
  });
  const hiddenRef = useRef<HTMLInputElement>(null);

  const sections = Array.from(new Set(items.map((i) => i.section)));

  function handleSubmit() {
    const payload = items.map((item) => ({
      section: item.section,
      key: item.key,
      value: values[`${item.section}.${item.key}`] ?? item.value,
    }));
    if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(payload);
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="fundraiserId" value={fundraiserId} />
      <input type="hidden" name="items" ref={hiddenRef} />

      {sections.map((section) => (
        <div key={section} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-4">
          <h2 className="font-display text-lg text-rampage-purple-dark">{SECTION_LABELS[section] || section}</h2>
          {items
            .filter((i) => i.section === section)
            .map((item) => (
              <div key={`${item.section}.${item.key}`}>
                <label className="block text-xs font-semibold text-rampage-gray uppercase tracking-wide mb-1">{item.key.replace(/_/g, " ")}</label>
                <textarea
                  rows={item.value.length > 80 ? 3 : 1}
                  value={values[`${item.section}.${item.key}`] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [`${item.section}.${item.key}`]: e.target.value }))}
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
                />
              </div>
            ))}
        </div>
      ))}

      <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
        Save Wording
      </button>
    </form>
  );
}
