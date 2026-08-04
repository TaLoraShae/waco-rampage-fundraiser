import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

function csvEscape(value: string | number | boolean) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let donations = db.getDonations();

  const player = searchParams.get("player");
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q");

  if (player) donations = donations.filter((d) => d.playerId === player);
  if (status) donations = donations.filter((d) => d.status === status);
  if (source) donations = donations.filter((d) => d.source === source);
  if (from) donations = donations.filter((d) => new Date(d.createdAt) >= new Date(from));
  if (to) donations = donations.filter((d) => new Date(d.createdAt) <= new Date(to));
  if (q) {
    const needle = q.toLowerCase();
    donations = donations.filter(
      (d) => d.donorName.toLowerCase().includes(needle) || d.donorEmail.toLowerCase().includes(needle)
    );
  }

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
    const player = db.getPlayerById(d.playerId);
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

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waco-rampage-donations-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
