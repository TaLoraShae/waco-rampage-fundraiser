import * as data from "@/lib/data";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export default async function ResetPasswordPage() {
  const fundraiser = await data.getFundraiser();
  const settings = fundraiser ? await data.getSiteSettings(fundraiser.id) : null;
  const teamName = settings?.team_name || "Team Fundraiser";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <p className="text-xs uppercase tracking-widest text-rampage-purple font-semibold mb-1">{teamName}</p>
        <h1 className="font-display text-2xl text-rampage-purple-dark mb-4">Set a New Password</h1>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
