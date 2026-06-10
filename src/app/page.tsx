"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InterviewRole, Difficulty, InterviewType } from "@/types";

const ROLES: { label: string; icon: string; description: string }[] = [
  { label: "Frontend Developer", icon: "🎨", description: "HTML, CSS, JS, browser APIs" },
  { label: "React Developer", icon: "⚛️", description: "React, hooks, state management" },
  { label: "Backend Developer", icon: "⚙️", description: "APIs, databases, security" },
  { label: "Full Stack Developer", icon: "🚀", description: "End-to-end web development" },
  { label: "DevOps Engineer", icon: "☁️", description: "CI/CD, Docker, Kubernetes" },
  { label: "Data Scientist", icon: "📊", description: "ML, Python, statistics" },
  { label: "Mobile Developer", icon: "📱", description: "React Native, iOS, Android" },
];

const DIFF_COLORS = {
  easy: "text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10",
  medium: "text-amber-700 dark:text-amber-400 border-amber-500/40 bg-amber-50 dark:bg-amber-500/10",
  hard: "text-red-700 dark:text-red-400 border-red-500/40 bg-red-50 dark:bg-red-500/10",
};

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

  const [language, setLanguage] = useState<"en" | "de">("en");
  const [interviewType, setInterviewType] = useState<InterviewType>("technical");
  const [modalOpen, setModalOpen] = useState(false);
  const [customData, setCustomData] = useState<CustomRoleData | null>(null);
  const [draftRole, setDraftRole] = useState("");
  const [draftCv, setDraftCv] = useState("");
  const [draftJd, setDraftJd] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [cvExtracting, setCvExtracting] = useState(false);
  const [cvFileError, setCvFileError] = useState("");

  const t = language === "de"
    ? {
        badge: "KI-gestützter Interview-Coach",
        heroTitle1: "Übe Vorstellungsgespräche mit",
        heroTitle2: "echtem KI-Feedback",
        heroSubtitle:
          "Wähle deine Rolle, den Schwierigkeitsgrad und stelle dich einem KI-Interviewer, der Folgefragen stellt und deine Leistung bewertet.",
        languageLabel: "Sprache",
        step1: "1. Wähle deine Rolle",
        step2: "2. Interviewtyp",
        step3: "3. Schwierigkeitsgrad",
        customRoleLabel: "Eigene Rolle",
        customRoleSub: "Deine Rolle + Lebenslauf + Stelle",
        customRoleEdit: "Klicken zum Bearbeiten",
        interviewTypes: [
          { value: "hr" as InterviewType, icon: "🤝", label: "HR / Verhalten", description: "Kommunikation, Motivation, Teamarbeit, Kulturfit" },
          { value: "technical" as InterviewType, icon: "🧠", label: "Technisch", description: "Technisches Wissen, Architektur, Konzepte, Problemlösung" },
          { value: "practical" as InterviewType, icon: "💻", label: "Praktisch / Coding", description: "Live-Coding, Aufgaben, Praxis-Implementierung, Debugging" },
        ],
        difficulties: [
          { value: "easy" as Difficulty, label: "Einfach", description: "Grundlagen & Konzepte", color: DIFF_COLORS.easy },
          { value: "medium" as Difficulty, label: "Mittel", description: "Praktisch & gemischt", color: DIFF_COLORS.medium },
          { value: "hard" as Difficulty, label: "Schwer", description: "Fortgeschritten & detailliert", color: DIFF_COLORS.hard },
        ],
        startBtn: "Interview starten →",
        startingBtn: "Interview wird gestartet…",
        selectRoleHint: "Wähle eine Rolle um zu beginnen",
        errorMsg: "Das Interview konnte nicht gestartet werden. Bitte versuche es erneut.",
        modalTitle: "Eigene Rolle einrichten",
        modalRoleLabel: "Deine Rolle / Berufsbezeichnung",
        modalRolePlaceholder: "z.B. iOS-Entwickler, ML-Ingenieur, Sicherheitsanalyst…",
        modalCvLabel: "Lebenslauf",
        modalOptional: "(optional)",
        modalUploadFile: "Datei hochladen",
        modalChangeFile: "Datei ändern",
        modalReadingFile: "Datei wird gelesen…",
        modalCvPlaceholder: "Lebenslauf einfügen oder PDF/DOCX/TXT-Datei hochladen…",
        modalJdLabel: "Stellenbeschreibung",
        modalJdPlaceholder: "Stellenbeschreibung einfügen, damit die KI auf die richtigen Fähigkeiten eingeht…",
        modalCancel: "Abbrechen",
        modalConfirm: "Bestätigen",
        howItWorks: "So funktioniert es",
        howSteps: [
          { step: "01", title: "Rolle wählen", desc: "Wähle den Job, für den du üben möchtest" },
          { step: "02", title: "KI interviewt dich", desc: "Dynamische Fragen basierend auf Rolle und Level" },
          { step: "03", title: "Natürlich antworten", desc: "Schreibe Antworten wie in einem echten Chat-Interview" },
          { step: "04", title: "Bewertung erhalten", desc: "Erhalte Wertungen für Technik, Kommunikation & Selbstsicherheit" },
        ],
      }
    : {
        badge: "AI-Powered Interview Coach",
        heroTitle1: "Practice interviews with",
        heroTitle2: "real AI feedback",
        heroSubtitle:
          "Select your role, pick a difficulty, and face an AI interviewer that asks follow-up questions and scores your performance.",
        languageLabel: "Language",
        step1: "1. Choose Your Role",
        step2: "2. Interview Type",
        step3: "3. Select Difficulty",
        customRoleLabel: "Custom Role",
        customRoleSub: "Your role + CV + JD",
        customRoleEdit: "Click to edit",
        interviewTypes: [
          { value: "hr" as InterviewType, icon: "🤝", label: "HR / Behavioral", description: "Communication, motivation, teamwork, culture fit" },
          { value: "technical" as InterviewType, icon: "🧠", label: "Technical", description: "Technical knowledge, architecture, concepts, problem solving" },
          { value: "practical" as InterviewType, icon: "💻", label: "Practical / Coding", description: "Live coding, assignments, real-world implementation, debugging" },
        ],
        difficulties: [
          { value: "easy" as Difficulty, label: "Easy", description: "Fundamentals & concepts", color: DIFF_COLORS.easy },
          { value: "medium" as Difficulty, label: "Medium", description: "Practical & mixed", color: DIFF_COLORS.medium },
          { value: "hard" as Difficulty, label: "Hard", description: "Advanced & in-depth", color: DIFF_COLORS.hard },
        ],
        startBtn: "Start Interview →",
        startingBtn: "Starting Interview…",
        selectRoleHint: "Select a role to begin",
        errorMsg: "Could not start the interview. Please try again.",
        modalTitle: "Custom Role Setup",
        modalRoleLabel: "Your Role / Job Title",
        modalRolePlaceholder: "e.g. iOS Engineer, ML Engineer, Security Analyst…",
        modalCvLabel: "CV / Resume",
        modalOptional: "(optional)",
        modalUploadFile: "Upload file",
        modalChangeFile: "Change file",
        modalReadingFile: "Reading file…",
        modalCvPlaceholder: "Paste your CV or resume, or upload a PDF / DOCX / TXT file above…",
        modalJdLabel: "Job Description",
        modalJdPlaceholder: "Paste the job description so the AI focuses on the right skills…",
        modalCancel: "Cancel",
        modalConfirm: "Confirm",
        howItWorks: "How it works",
        howSteps: [
          { step: "01", title: "Pick a role", desc: "Choose the job you want to practice for" },
          { step: "02", title: "AI interviews you", desc: "Dynamic questions based on your role and level" },
          { step: "03", title: "Answer naturally", desc: "Type your answers like in a real chat interview" },
          { step: "04", title: "Get scored", desc: "Receive technical, communication & confidence scores" },
        ],
      };

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
          language,
          interviewType,
        }),
      });
      if (!res.ok) throw new Error("Failed to start interview");
      const data = await res.json();
      router.push(`/interview/${data.id}`);
    } catch {
      setError(t.errorMsg);
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
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{t.modalTitle}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1 uppercase tracking-wide">
                {t.modalRoleLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={draftRole}
                onChange={(e) => setDraftRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmModal()}
                placeholder={t.modalRolePlaceholder}
                autoFocus
                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 text-sm px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-400 uppercase tracking-wide">
                  {t.modalCvLabel}{" "}
                  <span className="text-gray-500 dark:text-zinc-600 font-normal normal-case">{t.modalOptional}</span>
                </label>
                <label className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${cvExtracting ? "text-gray-400 dark:text-zinc-600 pointer-events-none" : "text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"}`}>
                  {cvExtracting ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      {t.modalReadingFile}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {cvFileName ? t.modalChangeFile : t.modalUploadFile}
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
                <div className="flex items-center gap-2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                  <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-violet-700 dark:text-violet-300 truncate font-medium">{cvFileName}</span>
                  <button onClick={() => { setCvFileName(""); setDraftCv(""); }} className="ml-auto text-gray-500 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {cvFileError && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-1.5">{cvFileError}</p>
              )}

              <textarea
                value={draftCv}
                onChange={(e) => { setDraftCv(e.target.value); if (!e.target.value) setCvFileName(""); }}
                placeholder={t.modalCvPlaceholder}
                rows={4}
                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 text-sm px-3 py-2 resize-y focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1 uppercase tracking-wide">
                {t.modalJdLabel}{" "}
                <span className="text-gray-500 dark:text-zinc-600 font-normal normal-case">{t.modalOptional}</span>
              </label>
              <textarea
                value={draftJd}
                onChange={(e) => setDraftJd(e.target.value)}
                placeholder={t.modalJdPlaceholder}
                rows={4}
                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 text-sm px-3 py-2 resize-y focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-400 text-sm font-semibold hover:border-gray-500 dark:hover:border-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 transition-all"
              >
                {t.modalCancel}
              </button>
              <button
                onClick={confirmModal}
                disabled={!draftRole.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {t.modalConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-400/40 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          {t.badge}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-gray-900 dark:text-zinc-100">
          {t.heroTitle1}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
            {t.heroTitle2}
          </span>
        </h1>
        <p className="text-gray-600 dark:text-zinc-400 text-lg max-w-xl mx-auto font-medium">
          {t.heroSubtitle}
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-8">
        {/* Language selector */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-gray-600 dark:text-zinc-500 uppercase tracking-wider font-bold">{t.languageLabel}</span>
          <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
            <button
              onClick={() => setLanguage("en")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all ${
                language === "en"
                  ? "bg-violet-600 text-white"
                  : "text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLanguage("de")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all ${
                language === "de"
                  ? "bg-violet-600 text-white"
                  : "text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              🇩🇪 Deutsch
            </button>
          </div>
        </div>

        {/* Role selection */}
        <section>
          <h2 className="text-sm font-black text-gray-700 dark:text-zinc-400 uppercase tracking-wider mb-3">
            {t.step1}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.label}
                onClick={() => { setSelectedRole(r.label as InterviewRole); setCustomData(null); }}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                  selectedRole === r.label
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-gray-900 dark:text-white shadow-sm shadow-violet-200 dark:shadow-none"
                    : "border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-400 hover:border-violet-400 dark:hover:border-zinc-600 hover:bg-violet-50/50 dark:hover:text-zinc-200"
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="text-sm font-bold leading-tight">{r.label}</span>
                <span className="text-xs text-gray-500 dark:text-zinc-500 leading-tight font-medium">{r.description}</span>
              </button>
            ))}

            {/* Custom Role card */}
            <button
              onClick={openModal}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                isCustomSelected
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-gray-900 dark:text-white shadow-sm shadow-violet-200 dark:shadow-none"
                  : "border-dashed border-gray-400 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 text-gray-700 dark:text-zinc-400 hover:border-violet-400 dark:hover:border-zinc-500 hover:bg-violet-50/50 dark:hover:text-zinc-200"
              }`}
            >
              <span className="text-2xl">✏️</span>
              <span className="text-sm font-bold leading-tight">
                {isCustomSelected ? customData!.role : t.customRoleLabel}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-500 leading-tight font-medium">
                {isCustomSelected ? t.customRoleEdit : t.customRoleSub}
              </span>
            </button>
          </div>
        </section>

        {/* Interview Type */}
        <section>
          <h2 className="text-sm font-black text-gray-700 dark:text-zinc-400 uppercase tracking-wider mb-3">
            {t.step2}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {t.interviewTypes.map((itype) => (
              <button
                key={itype.value}
                onClick={() => setInterviewType(itype.value)}
                className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all ${
                  interviewType === itype.value
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-gray-900 dark:text-white shadow-sm shadow-violet-200 dark:shadow-none"
                    : "border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-400 hover:border-violet-400 dark:hover:border-zinc-600 hover:bg-violet-50/50 dark:hover:text-zinc-200"
                }`}
              >
                <span className="text-2xl">{itype.icon}</span>
                <span className="text-sm font-bold leading-tight">{itype.label}</span>
                <span className="text-xs text-gray-500 dark:text-zinc-500 leading-snug font-medium">{itype.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty selection */}
        <section>
          <h2 className="text-sm font-black text-gray-700 dark:text-zinc-400 uppercase tracking-wider mb-3">
            {t.step3}
          </h2>
          <div className="flex gap-3">
            {t.difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDifficulty(d.value)}
                className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-xl border font-bold transition-all ${
                  selectedDifficulty === d.value
                    ? d.color + " border-current"
                    : "border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-500 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-gray-900 dark:hover:text-zinc-300"
                }`}
              >
                <span className="text-base">{d.label}</span>
                <span className="text-xs font-medium opacity-80">{d.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm text-center font-semibold">{error}</p>
        )}

        {/* Start button */}
        <button
          onClick={startInterview}
          disabled={!effectiveRole || loading}
          className="w-full py-4 rounded-xl font-black text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/25"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {t.startingBtn}
            </span>
          ) : (
            t.startBtn
          )}
        </button>

        {!effectiveRole && (
          <p className="text-gray-500 dark:text-zinc-600 text-sm text-center font-medium -mt-4">{t.selectRoleHint}</p>
        )}
      </div>

      {/* How it works */}
      <div className="mt-20 w-full max-w-3xl">
        <h2 className="text-center text-sm font-black text-gray-600 dark:text-zinc-500 uppercase tracking-widest mb-10">
          {t.howItWorks}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
          {t.howSteps.map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-violet-200 dark:text-zinc-800">{item.step}</span>
              <span className="font-black text-gray-900 dark:text-zinc-200 text-sm">{item.title}</span>
              <span className="text-sm text-gray-600 dark:text-zinc-500 font-medium leading-snug">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
