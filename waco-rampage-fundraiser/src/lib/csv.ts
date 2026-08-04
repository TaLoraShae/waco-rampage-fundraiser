import { Database, Donation } from "./types";
import { getPlayerById } from "./selectors";

function csvEscape(value: string | number | boolean) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function donationsToCsv(db: Database, donations: Donation[]): string {
  const headers = [
    "Donation ID",
    "Date",
    "Player",
    "Donor Name",
    "Donor Email",
    "Anonymous",
    "Gross (USD)",
    "Fee Estimate (USD)",
    "Net Estimate (USD)",
    "Status",
    "Source",
    "Payment Method",
    "Checkout Session ID",
    "Payment Intent ID",
    "Refunded",
    "Admin Notes",
    "Donor Message",
  ];

  const rows = donations.map((d) => {
    const player = getPlayerById(db, d.playerId);
    return [
      d.id,
      d.createdAt,
      player?.displayName || "",
      d.donorName,
      d.donorEmail,
      d.anonymous,
      (d.grossCents / 100).toFixed(2),
      (d.feeCents / 100).toFixed(2),
      (d.netCents / 100).toFixed(2),
      d.status,
      d.source,
      d.paymentMethod,
      d.checkoutSessionId,
      d.paymentIntentId,
      d.refunded,
      d.adminNotes,
      d.donorMessage,
    ];
  });

  return [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
