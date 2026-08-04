"use client";

import { useState } from "react";

export default function CopyLinkButton({ url, className = "" }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fall back to a manual prompt.
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ||
        "inline-flex items-center justify-center rounded-full border border-rampage-purple text-rampage-purple text-sm font-semibold px-4 py-2 hover:bg-rampage-purple hover:text-white transition focus-ring"
      }
    >
      {copied ? "Link copied!" : "Copy Link"}
    </button>
  );
}
