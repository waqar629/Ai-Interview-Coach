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

  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const isMutedRef = useRef(false);
  const lastSpokenIdRef = useRef<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speak new AI messages automatically
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    if (lastMsg.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = lastMsg.id;
    if (isMutedRef.current || typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastMsg.content);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

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
    if (textareaRef.current) textareaRef.current.style.height = "48px";

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

      if (data.interviewComplete) endInterview();
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

  function toggleMute() {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
    if (next) window.speechSynthesis.cancel();
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setTimeout(() => {
        const ta = textareaRef.current;
        if (ta) {
          ta.style.height = "auto";
          ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
        }
      }, 0);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
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

          {/* Mute / unmute TTS */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute AI voice" : "Mute AI voice"}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-zinc-800 hover:bg-zinc-700"
          >
            {isMuted ? (
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

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
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                msg.role === "assistant" ? "bg-violet-600 text-white" : "bg-zinc-700 text-zinc-300"
              }`}
            >
              {msg.role === "assistant" ? "AI" : "You"}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-zinc-800 text-zinc-100 rounded-tl-sm"
                    : "bg-violet-600 text-white rounded-tr-sm"
                }`}
              >
                {msg.content}
              </div>
              {/* Replay button on AI messages */}
              {msg.role === "assistant" && (
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(msg.content);
                    u.rate = 0.95;
                    window.speechSynthesis.speak(u);
                  }}
                  className="self-start flex items-center gap-1 text-xs text-zinc-600 hover:text-violet-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Replay
                </button>
              )}
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
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          {/* Mic button */}
          {speechSupported && (
            <button
              onClick={toggleListening}
              disabled={sending || ending}
              title={isListening ? "Stop recording" : "Speak your answer"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isListening
                  ? "bg-red-500 hover:bg-red-400 animate-pulse"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isListening ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening… speak your answer"
                : speechSupported
                ? "Type or use the mic to answer… (Enter to send)"
                : "Type your answer… (Enter to send)"
            }
            rows={1}
            disabled={sending || ending}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            style={{ minHeight: "48px", maxHeight: "160px" }}
          />

          {/* Send button */}
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
          {isListening ? (
            <span className="text-red-400 animate-pulse">● Recording — speak now, then click stop</span>
          ) : (
            "AI speaks each question aloud — use the mic button to reply by voice"
          )}
        </p>
      </div>
    </div>
  );
}
