import Link from "next/link";
import { heroContent, supportDisclaimer, siteConfig } from "@/config/content";
import { LetterReader } from "@/components/letters/letter-reader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: heroContent.subheadline,
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-20 sm:pt-28 pb-16 px-6 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink-900 mb-6 tracking-tight animate-fade-up">
            {heroContent.headline}
          </h1>
          <p
            className="font-sans text-lg sm:text-xl text-ink-500 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {heroContent.subheadline}
          </p>
          <div
            className="flex flex-wrap justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <a href="#letter" className="btn-primary">
              {heroContent.ctaRead}
            </a>
            <Link href="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Letter */}
      <section id="letter" className="pb-20 px-6 sm:px-8 scroll-mt-8">
        <div className="max-w-letter mx-auto">
          <LetterReader />
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 sm:px-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="letter-divider mb-8" aria-hidden="true">
            <span className="text-xs text-warm-400 font-sans">✦</span>
          </div>
          <h2 className="font-display text-2xl text-ink-800 mb-3">
            Every letter is a hand extended.
          </h2>
          <p className="font-sans text-sm text-ink-400 mb-8 leading-relaxed">
            These letters were written by Columbia students and alumni who remember
            what the beginning felt like.
          </p>
          <Link href="/letters" className="btn-primary">
            Read More Letters
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-16 px-6 sm:px-8 text-center">
        <p className="font-sans text-xs text-ink-300 max-w-prose mx-auto leading-relaxed">
          {supportDisclaimer}
        </p>
      </section>
    </>
  );
}
