"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InterviewRole, Difficulty } from "@/types";

const ROLES: { label: string; icon: string; description: string }[] = [
  { label: "Frontend Developer", icon: "🎨", description: "HTML, CSS, JS, browser APIs" },
  { label: "React Developer", icon: "⚛️", description: "React, hooks, state management" },
  { label: "Backend Developer", icon: "⚙️", description: "APIs, databases, security" },
  { label: "Full Stack Developer", icon: "🚀", description: "End-to-end web development" },
  { label: "DevOps Engineer", icon: "☁️", description: "CI/CD, Docker, Kubernetes" },
  { label: "Data Scientist", icon: "📊", description: "ML, Python, statistics" },
  { label: "Mobile Developer", icon: "📱", description: "React Native, iOS, Android" },
];

const DIFFICULTIES: { value: Difficulty; label: string; description: string; color: string }[] = [
  { value: "easy", label: "Easy", description: "Fundamentals & concepts", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { value: "medium", label: "Medium", description: "Practical & mixed", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { value: "hard", label: "Hard", description: "Advanced & in-depth", color: "text-red-400 border-red-500/30 bg-red-500/10" },
];

interface CustomRoleData {
  role: string;
  cv: string;
  jd: string;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [customData, setCustomData] = useState<CustomRoleData | null>(null);
  const [draftRole, setDraftRole] = useState("");
  const [draftCv, setDraftCv] = useState("");
  const [draftJd, setDraftJd] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [cvExtracting, setCvExtracting] = useState(false);
  const [cvFileError, setCvFileError] = useState("");

  const isCustomSelected = customData !== null;
  const effectiveRole = customData?.role || selectedRole;
  const effectiveContext = customData
    ? [
        customData.cv.trim() ? `CV / RESUME:\n${customData.cv.trim()}` : "",
        customData.jd.trim() ? `JOB DESCRIPTION:\n${customData.jd.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";

  function openModal() {
    setDraftRole(customData?.role ?? "");
    setDraftCv(customData?.cv ?? "");
    setDraftJd(customData?.jd ?? "");
    setCvFileName("");
    setCvFileError("");
    setModalOpen(true);
  }

  async function handleCvFile(file: File) {
    setCvFileError("");
    setCvFileName(file.name);
    setCvExtracting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract-cv", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");
      setDraftCv(data.text);
    } catch (err: unknown) {
      setCvFileError(err instanceof Error ? err.message : "Could not read file");
      setCvFileName("");
    } finally {
      setCvExtracting(false);
    }
  }

  function confirmModal() {
    if (!draftRole.trim()) return;
    setCustomData({ role: draftRole.trim(), cv: draftCv, jd: draftJd });
    setSelectedRole(null);
    setModalOpen(false);
  }

  async function startInterview() {
    if (!effectiveRole) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: effectiveRole,
          difficulty: selectedDifficulty,
          context: effectiveContext || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to start interview");
      const data = await res.json();
      router.push(`/interview/${data.id}`);
    } catch {
      setError("Could not start the interview. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      {/* Custom Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Custom Role Setup</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Your Role / Job Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={draftRole}
                onChange={(e) => setDraftRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmModal()}
                placeholder="e.g. iOS Engineer, ML Engineer, Security Analyst…"
                autoFocus
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 placeholder-zinc-600 text-sm px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-400">
                  CV / Resume{" "}
                  <span className="text-zinc-600 font-normal">(optional)</span>
                </label>
                <label className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${cvExtracting ? "text-zinc-600 pointer-events-none" : "text-violet-400 hover:text-violet-300"}`}>
                  {cvExtracting ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Reading file…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {cvFileName ? "Change file" : "Upload file"}
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCvFile(f); e.target.value = ""; }}
                  />
                </label>
              </div>

              {cvFileName && !cvExtracting && (
                <div className="flex items-center gap-2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-violet-300 truncate">{cvFileName}</span>
                  <button onClick={() => { setCvFileName(""); setDraftCv(""); }} className="ml-auto text-zinc-600 hover:text-zinc-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {cvFileError && (
                <p className="text-xs text-red-400 mb-1.5">{cvFileError}</p>
              )}

              <textarea
                value={draftCv}
                onChange={(e) => { setDraftCv(e.target.value); if (!e.target.value) setCvFileName(""); }}
                placeholder="Paste your CV or resume, or upload a PDF / DOCX / TXT file above…"
                rows={4}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 placeholder-zinc-600 text-sm px-3 py-2 resize-y focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Job Description{" "}
                <span className="text-zinc-600 font-normal">(optional)</span>
              </label>
              <textarea
                value={draftJd}
                onChange={(e) => setDraftJd(e.target.value)}
                placeholder="Paste the job description so the AI focuses on the right skills…"
                rows={4}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 placeholder-zinc-600 text-sm px-3 py-2 resize-y focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal}
                disabled={!draftRole.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI-Powered Interview Coach
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Practice interviews with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            real AI feedback
          </span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Select your role, pick a difficulty, and face an AI interviewer that asks follow-up questions and scores your performance.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-8">
        {/* Role selection */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            1. Choose Your Role
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.label}
                onClick={() => { setSelectedRole(r.label as InterviewRole); setCustomData(null); }}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                  selectedRole === r.label
                    ? "border-violet-500 bg-violet-500/15 text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="text-sm font-medium leading-tight">{r.label}</span>
                <span className="text-xs text-zinc-500 leading-tight">{r.description}</span>
              </button>
            ))}

            {/* Custom Role card */}
            <button
              onClick={openModal}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                isCustomSelected
                  ? "border-violet-500 bg-violet-500/15 text-white"
                  : "border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              <span className="text-2xl">✏️</span>
              <span className="text-sm font-medium leading-tight">
                {isCustomSelected ? customData!.role : "Custom Role"}
              </span>
              <span className="text-xs text-zinc-500 leading-tight">
                {isCustomSelected ? "Click to edit" : "Your role + CV + JD"}
              </span>
            </button>
          </div>
        </section>

        {/* Difficulty selection */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            2. Select Difficulty
          </h2>
          <div className="flex gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDifficulty(d.value)}
                className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-xl border font-medium transition-all ${
                  selectedDifficulty === d.value
                    ? d.color + " border-current"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                <span className="text-base">{d.label}</span>
                <span className="text-xs font-normal opacity-70">{d.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Start button */}
        <button
          onClick={startInterview}
          disabled={!effectiveRole || loading}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-900/30"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Starting Interview…
            </span>
          ) : (
            "Start Interview →"
          )}
        </button>

        {!effectiveRole && (
          <p className="text-zinc-600 text-sm text-center -mt-4">Select a role to begin</p>
        )}
      </div>

      {/* How it works */}
      <div className="mt-20 w-full max-w-3xl">
        <h2 className="text-center text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
          {[
            { step: "01", title: "Pick a role", desc: "Choose the job you want to practice for" },
            { step: "02", title: "AI interviews you", desc: "Dynamic questions based on your role and level" },
            { step: "03", title: "Answer naturally", desc: "Type your answers like in a real chat interview" },
            { step: "04", title: "Get scored", desc: "Receive technical, communication & confidence scores" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2">
              <span className="text-2xl font-bold text-zinc-700">{item.step}</span>
              <span className="font-semibold text-zinc-300 text-sm">{item.title}</span>
              <span className="text-xs text-zinc-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
