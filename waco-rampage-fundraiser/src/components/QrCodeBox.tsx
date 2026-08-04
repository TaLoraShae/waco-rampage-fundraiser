"use client";

import { useState } from "react";
import Image from "next/image";

export default function QrCodeBox({
  dataUrl,
  fileName,
  compact = false,
}: {
  dataUrl: string;
  fileName: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex items-center justify-center rounded-full border border-rampage-charcoal/20 text-rampage-charcoal text-sm font-semibold px-4 py-2 hover:bg-rampage-charcoal hover:text-white transition focus-ring"
            : "inline-flex items-center justify-center rounded-full border border-white/40 text-white text-sm font-semibold px-4 py-2 hover:bg-white hover:text-rampage-purple-dark transition focus-ring"
        }
      >
        {compact ? "QR Code" : "View / Download QR Code"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-rampage-purple-dark text-lg mb-3">Scan to donate</p>
            <div className="relative w-full aspect-square mb-4">
              <Image src={dataUrl} alt="QR code linking to fundraiser page" fill className="object-contain" />
            </div>
            <a
              href={dataUrl}
              download={`${fileName}-qr-code.png`}
              className="inline-flex w-full items-center justify-center rounded-full bg-rampage-purple text-white text-sm font-semibold px-4 py-2 hover:bg-rampage-purple-dark transition focus-ring mb-2"
            >
              Download PNG
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-rampage-gray hover:text-rampage-charcoal focus-ring rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
