import Link from "next/link";
import { Facebook, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-3">
            Bayan<span className="text-accent">Check</span>
          </h3>
          <p className="text-sm text-white/70">
            Verified Filipino news and political candidate background checks for informed voters.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">News</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/news?category=politics" className="hover:text-accent">Politics</Link></li>
            <li><Link href="/news?category=business" className="hover:text-accent">Business</Link></li>
            <li><Link href="/news?category=regional" className="hover:text-accent">Regional</Link></li>
            <li><Link href="/news" className="hover:text-accent">All News</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Voters</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/candidates" className="hover:text-accent">Check a Candidate</Link></li>
            <li><Link href="/compare" className="hover:text-accent">Compare Candidates</Link></li>
            <li><Link href="/elections" className="hover:text-accent">How to Vote</Link></li>
            <li><Link href="/faq" className="hover:text-accent">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Legal</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/about" className="hover:text-accent">About & Disclaimer</Link></li>
            <li><Link href="/about#privacy" className="hover:text-accent">Data Privacy</Link></li>
            <li><Link href="/about#sources" className="hover:text-accent">Our Sources</Link></li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="https://facebook.com" className="p-2 bg-white/10 rounded-full hover:bg-accent" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" className="p-2 bg-white/10 rounded-full hover:bg-accent" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://youtube.com" className="p-2 bg-white/10 rounded-full hover:bg-accent" aria-label="YouTube">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        <p>© {new Date().getFullYear()} BayanCheck. For voter education only. Not affiliated with COMELEC or any political party.</p>
      </div>
    </footer>
  );
}
