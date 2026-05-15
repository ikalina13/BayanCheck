"use client";

import { Facebook, Link2, Twitter } from "lucide-react";

export function ShareButtons({ title }: { title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";

  const share = (platform: string) => {
    const encoded = encodeURIComponent(url);
    const text = encodeURIComponent(title);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer");
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(url);
  };

  return (
    <div className="mt-6 flex gap-2 print:hidden">
      <span className="text-sm text-muted self-center mr-2">Share:</span>
      <button type="button" onClick={() => share("twitter")} className="p-2 rounded-full border hover:bg-surface" aria-label="Share on Twitter">
        <Twitter className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => share("facebook")} className="p-2 rounded-full border hover:bg-surface" aria-label="Share on Facebook">
        <Facebook className="h-4 w-4" />
      </button>
      <button type="button" onClick={copyLink} className="p-2 rounded-full border hover:bg-surface" aria-label="Copy link">
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}
