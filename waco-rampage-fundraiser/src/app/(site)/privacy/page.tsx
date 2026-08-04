import { brand } from "@/lib/config";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl text-rampage-purple-dark mb-6">Privacy Statement</h1>
      <div className="bg-white rounded-2xl border border-black/5 shadow-card p-6 sm:p-8 space-y-4 text-rampage-charcoal leading-relaxed">
        <p>{brand.privacyStatement}</p>
        <h2 className="font-display text-xl text-rampage-purple-dark pt-2">What we never publish</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-rampage-gray">
          <li>Full legal names — only first name and last initial</li>
          <li>Birthdates, addresses, or phone numbers</li>
          <li>School names, schedules, or travel schedules</li>
          <li>Donor email addresses</li>
          <li>Private donor messages, unless the donor and administrator both choose to display them</li>
        </ul>
        <h2 className="font-display text-xl text-rampage-purple-dark pt-2">Photo consent</h2>
        <p className="text-sm text-rampage-gray">
          Team and player photos are only used on this site with a parent or guardian&apos;s consent. If you have a
          concern about a photo, please contact the booster club using the information in the footer.
        </p>
        <h2 className="font-display text-xl text-rampage-purple-dark pt-2">Prototype notice</h2>
        <p className="text-sm text-rampage-gray">
          This site is currently a prototype. No real donations are collected, and this page does not constitute a
          final legal privacy policy. A complete privacy policy will be added before any real fundraiser launch.
        </p>
      </div>
    </div>
  );
}
