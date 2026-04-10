import { LetterReader } from "@/components/letters/letter-reader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Read Letters",
  description:
    "Read letters from Columbia students and alumni to incoming freshmen.",
};

export default function LettersPage() {
  return (
    <div className="page-container">
      <header className="mb-10 text-center animate-fade-up">
        <h1 className="section-heading">Letters</h1>
        <p className="font-sans text-base text-ink-500">
          Letters from those who came before you, for those who come next.
        </p>
      </header>

      <div className="max-w-letter mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <LetterReader />
      </div>

      {/* Demo notice */}
      <div className="mt-16 text-center">
        <div className="inline-block bg-columbia-50 border border-columbia-100 rounded-sm px-6 py-4 max-w-md">
          <p className="font-sans text-sm text-columbia-700">
            This is a read-only public demo. Letter submissions are not available in this version.
          </p>
        </div>
      </div>
    </div>
  );
}
