"use client";

import { StaticLetter, affiliationLabel } from "@/lib/letters";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

interface LetterCardProps {
  letter: StaticLetter;
}

export function LetterCard({ letter }: LetterCardProps) {
  const [feedbackSent, setFeedbackSent] = useState(false);

  const byline = [
    letter.authorDisplayName,
    affiliationLabel(letter.authorAffiliation),
    letter.authorClassYear ? `Class of ${letter.authorClassYear}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="letter-card paper-texture animate-fade-up">
      {letter.title && (
        <h2 className="font-display text-letter-title text-ink-900 mb-6">
          {letter.title}
        </h2>
      )}

      <div className="w-12 h-px bg-warm-300 mb-8" aria-hidden="true" />

      <div className="letter-body">{letter.body}</div>

      <div className="mt-10 pt-6 border-t border-warm-200">
        {byline && (
          <p className="font-sans text-sm text-ink-400">— {byline}</p>
        )}
        {letter.approvedAt && (
          <p className="font-sans text-xs text-ink-300 mt-1">
            {formatDate(letter.approvedAt)}
          </p>
        )}
      </div>

      {/* Decorative feedback — no backend calls */}
      <div className="mt-6 pt-4 border-t border-warm-100">
        {feedbackSent ? (
          <p className="text-xs text-ink-400 font-sans text-center">
            Thanks for your feedback.
          </p>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-ink-300 font-sans mr-2">
              How was this letter?
            </span>
            <button
              onClick={() => setFeedbackSent(true)}
              className="btn-ghost text-xs"
            >
              This helped
            </button>
            <button
              onClick={() => setFeedbackSent(true)}
              className="btn-ghost text-xs"
            >
              Not for me
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
