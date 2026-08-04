import { brand } from "@/lib/config";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl text-white mb-6">PRIVACY STATEMENT</h1>
      <div className="bg-rampage-charcoal metal-border rounded-2xl p-6 sm:p-8 space-y-4 text-white/80 leading-relaxed">
        <p>{brand.privacyStatement}</p>
        <h2 className="font-display text-xl text-white pt-2">What we never publish</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-rampage-gray">
          <li>Full legal names — only first name and last initial</li>
          <li>Birthdates, addresses, or phone numbers</li>
          <li>School names, schedules, or travel schedules</li>
          <li>Donor email addresses</li>
          <li>Private donor messages, unless the donor and administrator both choose to display them</li>
        </ul>
        <h2 className="font-display text-xl text-white pt-2">Photo consent</h2>
        <p className="text-sm text-rampage-gray">
          Team and player photos are only used on this site with a parent or guardian&apos;s consent. If you have a
          concern about a photo, please contact the booster club using the information in the footer.
        </p>
        <h2 className="font-display text-xl text-white pt-2">Prototype notice</h2>
        <p className="text-sm text-rampage-gray">
          This site is currently a prototype. No real donations are collected, and this page does not constitute a
          final legal privacy policy. A complete privacy policy will be added before any real fundraiser launch.
        </p>
      </div>
    </div>
  );
}
