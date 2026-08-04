"use client";

import { FinancialDonation, Player } from "@/lib/types";
import { donationsToCsv, downloadCsv } from "@/lib/csv";

export default function ExportCsvButton({
  donations,
  players,
  filename,
  className,
  label = "Export CSV",
}: {
  donations: FinancialDonation[];
  players: Player[];
  filename: string;
  className?: string;
  label?: string;
}) {
  function handleClick() {
    const csv = donationsToCsv(donations, players);
    downloadCsv(csv, filename);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "inline-flex items-center rounded-full border border-rampage-purple text-rampage-purple text-sm font-semibold px-4 py-2 hover:bg-rampage-purple hover:text-white transition focus-ring"
      }
    >
      {label}
    </button>
  );
}
