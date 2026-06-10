# Hassan's AI Interview Coach

A personal AI-powered mock interview platform built by **Waqar Hassan**. Pick a role, choose your interview type and difficulty, and face a realistic AI interviewer that asks follow-up questions and scores your performance — all for free.

Live at: [waqar-ai-coach.vercel.app](https://waqar-ai-coach.vercel.app)

---

## Why I built this

Most interview prep tools throw the same recycled question bank at everyone. This one actually adapts — paste your CV and the job description, and the AI asks questions relevant to *your* background and *that specific role*. It also supports full HR/behavioral, technical, and practical interview modes so you can practice the type of interview you're actually walking into.

---

## Features

- **Three interview types** — HR/Behavioral (soft skills, motivation, culture fit), Technical (architecture, concepts, depth), and Practical/Coding (live implementation, debugging, real-world tradeoffs)
- **Seven preset roles** — Frontend, React, Backend, Full Stack, DevOps, Data Scientist, Mobile Developer — plus a **Custom Role** option where you can paste your own CV and job description
- **Three difficulty levels** — Easy (fundamentals), Medium (mixed), Hard (senior/staff depth)
- **Voice input and text-to-speech** — speak your answers, hear the questions read aloud; mute the voice when you don't need it
- **English and German** — full bilingual support; switch language before starting and the AI conducts the entire interview in your chosen language, with all UI text switching too
- **Dark mode by default** — no flash, no flicker; the page loads dark from the very first paint
- **Evaluation on completion** — technical, communication, and confidence scores; specific strengths and weaknesses; actionable improvement suggestions

---

## Tech Stack

| What | How |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| AI | Groq — `llama-3.3-70b-versatile` (free tier, no credit card) |
| Database | Turso (cloud SQLite via LibSQL + Prisma 7) |
| Speech | Web Speech API — SpeechRecognition + SpeechSynthesis |
| Hosting | Vercel |
| File parsing | `pdf-parse` for PDFs, `mammoth` for DOCX |

Groq's free tier gives 6,000 requests/day on llama-3.3-70b — more than enough for interview practice.

---

## How to use it

**Choose your language** — English or German. The AI conducts the entire interview in your chosen language, and all UI labels switch too.

**Pick a role** — select from the preset cards or click **Custom Role** to enter any job title and optionally paste your CV and the target job description. The more context you give, the more tailored the questions.

**Choose interview type:**
- *HR / Behavioral* — motivation, teamwork, conflict resolution, culture fit. Zero technical questions.
- *Technical* — architecture decisions, conceptual depth, trade-offs, role-specific knowledge.
- *Practical / Coding* — live implementation thinking, debugging, real-world problem solving.

**Choose difficulty:**
- *Easy* — fundamentals and concepts; good for first-time practice
- *Medium* — the standard mix you'd get in a real interview
- *Hard* — deep dives, edge cases, senior-level expectations

**Do the interview.** Answer in the text box or click the microphone to speak. The AI reads each question aloud — mute it with the speaker button if you prefer silence. After 6–8 exchanges it wraps up naturally.

**Get your results.** Scores across technical, communication, and confidence dimensions, plus specific strengths, weaknesses, and concrete suggestions to improve.

---

## Contact

Built by **Waqar Hassan**

- LinkedIn: [linkedin.com/in/waqar628](https://www.linkedin.com/in/waqar628/)
- GitHub: [github.com/waqar629](https://github.com/waqar629)
- Email: waqarhassan630@gmail.com

---

## License & Copyright

© 2025 Waqar Hassan. All Rights Reserved.

This project and its source code are the exclusive property of Waqar Hassan. No part of this codebase may be copied, modified, distributed, sublicensed, or used in any form — commercially or otherwise — without explicit written permission from the author.

To request permission, contact: waqarhassan630@gmail.com
