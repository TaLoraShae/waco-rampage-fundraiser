"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

export default function QrCodeBox({
  url,
  fileName,
  compact = false,
}: {
  url: string;
  fileName: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setOpen(true);
    if (dataUrl) return;
    setLoading(true);
    try {
      const generated = await QRCode.toDataURL(url, {
        margin: 4,
        width: 640,
        errorCorrectionLevel: "Q",
        color: { dark: "#1E0E30", light: "#FFFFFF" },
      });
      setDataUrl(generated);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          compact
            ? "inline-flex items-center justify-center rounded border border-rampage-silver-dark/40 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 hover:bg-white/10 transition focus-ring"
            : "inline-flex items-center justify-center rounded border border-white/40 text-white text-sm font-semibold px-4 py-2 hover:bg-white/10 transition focus-ring"
        }
      >
        {compact ? "QR Code" : "View / Download QR Code"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-rampage-charcoal metal-border rounded-2xl p-6 max-w-xs w-full text-center shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-white text-lg mb-3 tracking-wide">SCAN TO DONATE</p>
            <div className="relative w-full aspect-square mb-4 bg-white rounded-lg overflow-hidden">
              {loading || !dataUrl ? (
                <div className="absolute inset-0 flex items-center justify-center text-rampage-charcoal text-xs">
                  Generating...
                </div>
              ) : (
                <Image src={dataUrl} alt="QR code linking to fundraiser page" fill className="object-contain" unoptimized />
              )}
            </div>
            {dataUrl && (
              <a
                href={dataUrl}
                download={`${fileName}-qr-code.png`}
                className="inline-flex w-full items-center justify-center rounded bg-rampage-purple text-white text-sm font-bold px-4 py-2.5 hover:bg-rampage-purple-light transition focus-ring mb-2"
              >
                Download PNG
              </a>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-rampage-gray hover:text-white focus-ring rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
