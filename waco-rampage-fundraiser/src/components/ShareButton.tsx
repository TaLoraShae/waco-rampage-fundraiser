"use client";

export default function ShareButton({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text: string;
}) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User canceled the share sheet — no action needed.
      }
    } else {
      await navigator.clipboard.writeText(url);
      window.alert("Link copied! Sharing isn't supported on this browser, so paste the link anywhere you'd like.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white text-sm font-semibold px-4 py-2 hover:bg-rampage-purple-dark transition focus-ring"
    >
      Share
    </button>
  );
}
