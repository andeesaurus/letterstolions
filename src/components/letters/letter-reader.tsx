"use client";

import { useState, useCallback, useEffect } from "react";
import { LetterCard } from "./letter-card";
import { StaticLetter, loadLetters, pickRandom } from "@/lib/letters";

export function LetterReader() {
  const [allLetters, setAllLetters] = useState<StaticLetter[]>([]);
  const [letter, setLetter] = useState<StaticLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    loadLetters()
      .then((letters) => {
        setAllLetters(letters);
        setLetter(pickRandom(letters));
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load letters. Please refresh the page.");
        setLoading(false);
      });
  }, []);

  const showAnother = useCallback(() => {
    if (allLetters.length === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setLetter(pickRandom(allLetters, letter?.id));
      setTransitioning(false);
    }, 250);
  }, [allLetters, letter]);

  if (loading) {
    return (
      <div className="letter-card animate-pulse">
        <div className="h-6 bg-warm-100 rounded w-2/3 mb-6" />
        <div className="w-12 h-px bg-warm-200 mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-warm-100 rounded w-full" />
          <div className="h-4 bg-warm-100 rounded w-5/6" />
          <div className="h-4 bg-warm-100 rounded w-full" />
          <div className="h-4 bg-warm-100 rounded w-4/5" />
          <div className="h-4 bg-warm-100 rounded w-full" />
          <div className="h-4 bg-warm-100 rounded w-3/4" />
        </div>
        <div className="mt-10 pt-6 border-t border-warm-200">
          <div className="h-3 bg-warm-100 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="card-surface text-center py-12">
        <p className="font-sans text-sm text-ink-400">
          {error || "No letters available yet."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`transition-opacity duration-300 ${
        transitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      <LetterCard letter={letter} />

      <div className="text-center mt-10">
        <button
          onClick={showAnother}
          className="btn-secondary"
          disabled={transitioning}
        >
          {transitioning ? "Loading…" : "Read Another Letter"}
        </button>
      </div>
    </div>
  );
}
