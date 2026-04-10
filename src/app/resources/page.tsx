import { resourcesConfig, supportDisclaimer } from "@/config/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description: "Columbia-specific support resources for students.",
};

function cx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ResourcesPage() {
  return (
    <div className="page-container">
      <header className="mb-16 animate-fade-up">
        <h1 className="section-heading">Resources</h1>
        <p className="font-sans text-base text-ink-500 leading-relaxed max-w-prose">
          {resourcesConfig.intro}
        </p>
      </header>

      <div className="space-y-16">
        {resourcesConfig.sections.map((section, i) => (
          <section
            key={i}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="mb-6">
              <h2
                className={cx(
                  "font-serif text-xl font-semibold mb-1",
                  section.urgent ? "text-red-700" : "text-ink-800"
                )}
              >
                {section.title}
              </h2>
              <p className="font-sans text-sm text-ink-400">
                {section.description}
              </p>
            </div>

            {section.urgent && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-sm">
                <p className="text-xs text-red-700 font-sans font-medium">
                  If you are in immediate danger, call 911 or Columbia Public Safety at (212) 854-5555.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {section.resources.map((resource, j) => (
                <div
                  key={j}
                  className={cx(
                    "card-surface",
                    section.urgent && "border-red-100"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-serif text-sm font-semibold text-ink-800 mb-1">
                        {resource.name}
                      </h3>
                      <p className="font-sans text-xs text-ink-500 leading-relaxed mb-2">
                        {resource.description}
                      </p>
                      {"phone" in resource && resource.phone && (
                        <p className="font-sans text-xs text-ink-400">
                          <span className="text-ink-500 font-medium">Phone:</span>{" "}
                          {resource.phone}
                        </p>
                      )}
                    </div>
                    {resource.url && resource.url !== "#" && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-sans font-medium transition-colors whitespace-nowrap"
                        style={{ color: "#4a6fa5" }}
                      >
                        Visit
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-warm-200">
        <p className="font-sans text-xs text-ink-300 leading-relaxed max-w-prose">
          {supportDisclaimer}
        </p>
      </div>
    </div>
  );
}
