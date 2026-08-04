import { FinancialDonation, Player } from "./types";

function csvEscape(value: string | number | boolean) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function donationsToCsv(donations: FinancialDonation[], players: Player[]): string {
  const headers = [
    "Donation ID", "Date", "Player", "Donor Name", "Donor Email", "Anonymous",
    "Gross (USD)", "Fee Estimate (USD)", "Net Estimate (USD)", "Status", "Source",
    "Payment Method", "Checkout Session ID", "Payment Intent ID", "Refunded", "Admin Notes", "Donor Message",
  ];

  const rows = donations.map((d) => {
    const player = players.find((p) => p.id === d.player_id);
    return [
      d.id, d.created_at, player?.display_name || "", d.donor_name, d.donor_email, d.anonymous,
      (d.gross_cents / 100).toFixed(2), (d.fee_cents / 100).toFixed(2), (d.net_cents / 100).toFixed(2),
      d.status, d.source, d.payment_method, d.checkout_session_id, d.payment_intent_id, d.refunded, d.admin_notes, d.donor_message,
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
