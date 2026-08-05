import Link from "next/link";
import { adminSignOut } from "@/app/admin/auth-actions";
import * as data from "@/lib/data";

export default async function UnauthorizedPage() {
  const fundraiser = await data.getFundraiser();
  const settings = fundraiser ? await data.getSiteSettings(fundraiser.id) : null;
  const teamName = settings?.team_name || "Team Fundraiser";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-rampage-purple font-semibold mb-1">{teamName}</p>
        <h1 className="font-display text-2xl text-rampage-purple-dark mb-3">Access Not Approved</h1>
        <p className="text-sm text-rampage-gray mb-6">
          You're signed in, but this account isn't set up as an approved administrator yet. Ask your team owner to
          add you in the Administrators section, then try again.
        </p>
        <form action={adminSignOut}>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-3 hover:bg-rampage-purple-dark transition focus-ring"
          >
            Log Out
          </button>
        </form>
        <Link href="/" className="block mt-4 text-sm text-rampage-purple hover:underline focus-ring rounded">
          Return to the public site
        </Link>
      </div>
    </div>
  );
}
