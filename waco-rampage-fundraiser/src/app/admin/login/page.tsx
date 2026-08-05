import * as data from "@/lib/data";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  const fundraiser = await data.getFundraiser();
  const settings = fundraiser ? await data.getSiteSettings(fundraiser.id) : null;
  const teamName = settings?.team_name || "Team Fundraiser";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <p className="text-xs uppercase tracking-widest text-rampage-purple font-semibold mb-1">{teamName}</p>
        <h1 className="font-display text-2xl text-rampage-purple-dark mb-6">Admin Dashboard Login</h1>

        <LoginForm />

        <div className="mt-6 rounded-xl bg-rampage-gray-light border border-black/10 text-rampage-charcoal text-xs p-3 leading-relaxed">
          <p>
            Administrator accounts are created by the team owner in Supabase — there's no public sign-up. If you
            don't have an account yet, ask your owner to invite you (see docs/SUPABASE_ONBOARDING.md).
          </p>
        </div>
      </div>
    </div>
  );
}
