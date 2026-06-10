"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import type { InterviewResult, InterviewSession } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" className="stroke-gray-200 dark:stroke-zinc-800" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800 dark:text-white">
          {score}
        </span>
      </div>
      <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">{label}</span>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-zinc-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-zinc-200">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [interview, setInterview] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResult();
  }, [id]);

  async function fetchResult() {
    try {
      const res = await fetch(`/api/interview/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setInterview(data);
      setResult(data.result);
    } catch {
      setError("Could not load results.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-zinc-500 text-sm">Loading results…</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 dark:text-red-400">{error ?? "Results not available yet."}</p>
          <button onClick={() => router.push("/")} className="text-violet-600 dark:text-violet-400 hover:underline">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const grade =
    result.overallScore >= 85 ? { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400" } :
    result.overallScore >= 70 ? { label: "Good", color: "text-cyan-600 dark:text-cyan-400" } :
    result.overallScore >= 55 ? { label: "Fair", color: "text-amber-600 dark:text-amber-400" } :
    { label: "Needs Work", color: "text-red-600 dark:text-red-400" };

  return (
    <main className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-10">
        <div className={`text-5xl font-black mb-1 ${grade.color}`}>{grade.label}</div>
        <p className="text-gray-500 dark:text-zinc-400 text-sm">
          {interview?.role} · {interview?.difficulty} difficulty
        </p>
      </div>

      {/* Score rings */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 mb-6">
        <div className="flex justify-around">
          <ScoreRing score={result.technicalScore} label="Technical" color="#8b5cf6" />
          <ScoreRing score={result.communicationScore} label="Communication" color="#06b6d4" />
          <ScoreRing score={result.confidenceScore} label="Confidence" color="#10b981" />
          <ScoreRing score={result.overallScore} label="Overall" color="#f59e0b" />
        </div>
      </div>

      {/* Score bars */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-zinc-200 mb-4">Score Breakdown</h2>
        <ScoreBar label="Technical Knowledge" score={result.technicalScore} />
        <ScoreBar label="Communication Skills" score={result.communicationScore} />
        <ScoreBar label="Confidence & Clarity" score={result.confidenceScore} />
        <ScoreBar label="Overall Performance" score={result.overallScore} />
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-800 dark:text-zinc-200 mb-3">Interviewer&apos;s Summary</h2>
        <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">{result.summary}</p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5">
          <h2 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
            <span>✓</span> Strengths
          </h2>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-zinc-400 flex gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 rounded-2xl p-5">
          <h2 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
            <span>✗</span> Areas to Improve
          </h2>
          <ul className="space-y-2">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-zinc-400 flex gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-900/40 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-violet-600 dark:text-violet-400 mb-3">Recommended Next Steps</h2>
        <ol className="space-y-3">
          {result.suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-zinc-400">
              <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-medium hover:border-gray-400 dark:hover:border-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
        >
          ← Practice Again
        </button>
        <button
          onClick={() => router.push(`/interview/${id}`)}
          className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors text-sm"
        >
          Review Conversation
        </button>
      </div>
    </main>
  );
}
