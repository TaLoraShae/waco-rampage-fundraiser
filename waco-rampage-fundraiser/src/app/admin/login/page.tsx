import { adminLogin } from "@/app/actions";
import { brand } from "@/lib/config";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; from?: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <p className="text-xs uppercase tracking-widest text-rampage-purple font-semibold mb-1">{brand.teamName}</p>
        <h1 className="font-display text-2xl text-rampage-purple-dark mb-6">Admin Dashboard Login</h1>

        {searchParams.error && (
          <p role="alert" className="mb-4 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">
            Incorrect email or password. Please try again.
          </p>
        )}

        <form action={adminLogin} className="space-y-4">
          <input type="hidden" name="from" value={searchParams.from || "/admin"} />
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Email
            </label>
            <input id="email" name="email" type="email" required className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Password
            </label>
            <input id="password" name="password" type="password" required className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple" />
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-3 hover:bg-rampage-purple-dark transition focus-ring">
            Log In
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-rampage-gray-light border border-black/10 text-rampage-charcoal text-xs p-3 leading-relaxed">
          <p className="font-semibold mb-1">Prototype demo login</p>
          <p>Email: admin@wacorampage.test</p>
          <p>Password: RampageDemo2026!</p>
          <p className="mt-2">
            This login is for prototype demonstration only and is not secure enough for a live fundraiser. See{" "}
            <code>docs/DEPLOYMENT.md</code> before launch.
          </p>
        </div>
      </div>
    </div>
  );
}
