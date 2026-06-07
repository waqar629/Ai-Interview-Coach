"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import type { Message } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface InterviewData {
  id: string;
  role: string;
  difficulty: string;
  status: string;
  messages: Message[];
}

export default function InterviewPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchInterview() {
    try {
      const res = await fetch(`/api/interview/${id}`);
      if (!res.ok) throw new Error("Interview not found");
      const data = await res.json();
      setInterview(data);
      setMessages(data.messages);
      setQuestionCount(data.messages.filter((m: Message) => m.role === "assistant").length);
    } catch {
      setError("Could not load interview session.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const userMessage = input.trim();
    setInput("");
    setSending(true);

    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/interview/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        data.userMessage,
        data.assistantMessage,
      ]);
      setQuestionCount((q) => q + 1);

      if (data.interviewComplete) {
        endInterview();
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function endInterview() {
    setEnding(true);
    try {
      const res = await fetch(`/api/interview/${id}/end`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to end interview");
      router.push(`/results/${id}`);
    } catch {
      setError("Failed to generate results. Please try again.");
      setEnding(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading interview…</p>
        </div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => router.push("/")} className="text-violet-400 hover:underline">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const difficultyColor = {
    easy: "text-emerald-400",
    medium: "text-amber-400",
    hard: "text-red-400",
  }[interview?.difficulty ?? "medium"] ?? "text-zinc-400";

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            ← Home
          </button>
          <div className="w-px h-4 bg-zinc-700" />
          <div>
            <span className="font-semibold text-sm text-zinc-200">{interview?.role}</span>
            <span className={`ml-2 text-xs font-medium capitalize ${difficultyColor}`}>
              {interview?.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{questionCount} questions</span>
          <button
            onClick={endInterview}
            disabled={ending || messages.length < 2}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ending ? "Generating results…" : "End & Get Results"}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-700 text-zinc-300"
              }`}
            >
              {msg.role === "assistant" ? "AI" : "You"}
            </div>
            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-zinc-800 text-zinc-100 rounded-tl-sm"
                  : "bg-violet-600 text-white rounded-tr-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm text-white flex-shrink-0">
              AI
            </div>
            <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {ending && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-violet-400 text-sm">
              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Generating your evaluation report…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error toast */}
      {error && (
        <div className="mx-4 mb-2 max-w-3xl w-full mx-auto">
          <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-2">
            {error}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-zinc-800 px-4 py-3 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={sending || ending}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            style={{ minHeight: "48px", maxHeight: "160px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending || ending}
            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-zinc-600 text-center mt-2">
          Answer honestly — the AI will ask follow-up questions based on your response
        </p>
      </div>
    </div>
  );
}
