import { aboutContent } from "@/config/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: aboutContent.intro,
};

export default function AboutPage() {
  return (
    <div className="page-container">
      <header className="mb-16 animate-fade-up">
        <h1 className="section-heading">{aboutContent.title}</h1>
        <p className="font-sans text-base text-ink-500 leading-relaxed max-w-prose">
          {aboutContent.intro}
        </p>
      </header>

      <div className="space-y-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {aboutContent.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-serif text-lg font-semibold text-ink-800 mb-3">
              {section.title}
            </h2>
            <p className="font-sans text-sm text-ink-600 leading-relaxed max-w-prose">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-warm-200 animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="bg-warm-100 border border-warm-200 rounded-sm p-6">
          <h2 className="font-serif text-sm font-semibold text-ink-700 mb-2">
            Important Note
          </h2>
          <p className="font-sans text-xs text-ink-500 leading-relaxed">
            {aboutContent.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
