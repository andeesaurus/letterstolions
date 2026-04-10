import Link from "next/link";
import { supportDisclaimer } from "@/config/content";

export function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-warm-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        <p className="text-xs text-ink-400 max-w-prose mb-8 leading-relaxed">
          {supportDisclaimer}
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/" className="text-xs text-ink-400 hover:text-ink-600 transition-colors">Home</Link>
            <Link href="/letters" className="text-xs text-ink-400 hover:text-ink-600 transition-colors">Read Letters</Link>
            <Link href="/about" className="text-xs text-ink-400 hover:text-ink-600 transition-colors">About</Link>
            <Link href="/resources" className="text-xs text-ink-400 hover:text-ink-600 transition-colors">Resources</Link>
          </div>
          <p className="text-xs text-ink-300">
            Letters to Lions · A Columbia community project
          </p>
        </div>
      </div>
    </footer>
  );
}
