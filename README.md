# AI Interview Platform

A mock interview tool that actually knows who you are. Paste your CV and the job description before you start, and the AI asks questions relevant to *your* background — not just generic "what's your greatest weakness" fluff.

Built with Next.js, Prisma (SQLite), and Google Gemini. Runs entirely on your machine. The only external call is to Gemini's API, which has a generous free tier — no credit card, no monthly bill.

---

## Why I built this

Most mock interview tools are static. They cycle through the same question bank regardless of whether you're a fresh graduate or a ten-year senior. This one reads your actual CV and the job description before the interview starts, so the questions feel like they came from a recruiter who actually read your application.

---

## What it does

- Pick a role (Frontend, Backend, Full Stack, DevOps, Data Scientist, React, Mobile, or define your own)
- Optionally paste your CV and the job description — the AI uses both to personalise the questions
- Choose difficulty: Easy for revision, Medium for typical interviews, Hard for senior/staff-level prep
- The AI conducts a real back-and-forth interview — one question at a time, follow-ups included
- When it's done, you get a proper evaluation: technical score, communication score, confidence score, strengths, weaknesses, and concrete suggestions

---

## Tech Stack

| What | How |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Styling | Tailwind CSS v4 |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Database | SQLite via Prisma 7 + LibSQL adapter |
| File parsing | `pdf-parse` for PDFs, `mammoth` for DOCX |

I chose Gemini over other providers because it has a genuinely usable free tier — 15 requests/minute and 1 million tokens per day. For interview practice that's effectively unlimited.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com) and sign in with your Google account
2. Click **Get API key** in the sidebar → **Create API key**
3. Copy the key (it starts with `AI...`)

That's it. No billing info, no credit card.

### 3. Add the key to your environment

Open `.env.local` in the project root — it already exists with placeholders:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL="file:./dev.db"
```

Replace `your_gemini_api_key_here` with your actual key and save the file.

> **Keep this key safe.** Don't paste it into your README, don't commit it to git. The `.env.local` file is already in `.gitignore` so as long as you only edit that file you're fine.

After changing `.env.local`, restart the dev server for the new value to take effect.

### 4. Set up the database

```bash
npx prisma migrate dev
```

This creates a local SQLite file at `prisma/dev.db`. Nothing to configure — it just works.

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the role picker immediately.

---

## How to use it

**Pick a role.** The preset cards cover the most common technical roles. If your target role isn't listed, click the **Custom Role** card (the dashed one at the end).

**Add your context** (highly recommended for Custom Role, available for any role). A modal opens where you can:
- Paste your CV or resume text directly
- Or click "Upload file" to attach a PDF, DOCX, or TXT — the text is extracted server-side automatically
- Paste the job description for the role you're applying to

The more context you give, the more relevant the questions will be. Without any context, the AI asks solid general questions for the role. With your CV and JD, it digs into the specific technologies, experience gaps, and requirements that actually matter for that application.

**Choose difficulty.**
- *Easy* — fundamentals and concepts; good for first-time practice or quick revision
- *Medium* — the standard mix of theory and scenario-based questions you'd get in a real interview
- *Hard* — deep technical dives, trade-off discussions, architecture decisions; aims at senior-level depth

**Do the interview.** The AI greets you and asks the first question. Answer in the text box as you would in a real interview — full sentences, as much detail as you want. It follows up, probes your answers, and moves through different topics. After 6–8 exchanges it wraps up naturally.

**Check your results.** After the interview ends (automatically or via the End Interview button), you're taken to a results page with scores across four categories, a list of specific strengths and weaknesses, and improvement suggestions.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── extract-cv/          # Handles file uploads, extracts text from PDF/DOCX/TXT
│   │   └── interview/
│   │       ├── start/           # Creates the interview record, gets the first question from Gemini
│   │       ├── [id]/
│   │       │   ├── route.ts     # GET — fetches a full interview with all messages and result
│   │       │   ├── message/     # POST — sends your answer, gets the AI's next question
│   │       │   └── end/         # POST — runs the evaluation, saves scores to the database
│   ├── interview/[id]/          # The live interview chat page
│   ├── results/[id]/            # Results and breakdown page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Home page — role picker and difficulty selector
├── lib/
│   ├── prisma.ts                # Prisma client (singleton to avoid connection issues in Next.js dev)
│   └── prompts.ts               # Builds the system prompt and evaluation prompt from role/difficulty/context
└── types/
    └── index.ts                 # Shared TypeScript interfaces
prisma/
├── schema.prisma                # Interview, Message, and Result models
└── dev.db                       # SQLite database — auto-created, gitignored
```

---

## Environment Variables

| Variable | What it's for |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key — get one free at aistudio.google.com |
| `DATABASE_URL` | Path to the SQLite file — default `file:./dev.db` is fine, don't change it unless you have a reason |

---

## Useful Commands

```bash
# Run the dev server
npm run dev

# Inspect your database visually (interviews, messages, results)
npx prisma studio

# Apply schema changes after editing prisma/schema.prisma
npx prisma migrate dev

# Build and run in production mode
npm run build
npm run start
```

I find it useful to keep two terminal tabs open during development — one for `npm run dev` and one for `npx prisma studio`. The studio lets you browse interviews and messages in real time while you test.

---

## Troubleshooting

**"Failed to start interview" on the home page**
Almost always a missing or invalid Gemini API key. Check that `.env.local` has your real key (not the placeholder), then restart the dev server. Changes to `.env.local` don't hot-reload — you need to kill and restart `npm run dev`.

**File upload returns empty text**
Scanned PDFs (where the content is just an image with no text layer) won't extract correctly. Copy-paste the text manually instead. Regular PDFs exported from Word or text editors work fine.

**The AI ends the interview after only a few messages**
This is intentional — the prompt tells it to wrap up after 6–8 exchanges to keep sessions focused. If you want longer, more in-depth sessions, try Hard difficulty; it tends to go deeper on each topic before moving on.

**Prisma errors on first run**
Make sure you ran `npx prisma migrate dev` before starting the server. If the `prisma/dev.db` file doesn't exist, the app can't save or retrieve any data.

---

## License

MIT — use it however you like.
