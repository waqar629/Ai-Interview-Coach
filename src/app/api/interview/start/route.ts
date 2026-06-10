import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { getSystemPrompt } from "@/lib/prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { role, difficulty = "medium", context, language = "en" } = await request.json();

    if (!role) {
      return Response.json({ error: "Role is required" }, { status: 400 });
    }

    const interview = await prisma.interview.create({
      data: { role, difficulty, status: "in_progress", context: context || null, language },
    });

    const systemPrompt = getSystemPrompt(role, difficulty, context, language);
    const greeting = language === "de" ? "Hallo, ich bin bereit zu beginnen." : "Hello, I'm ready to start.";

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: greeting },
      ],
    });

    const firstQuestion = response.choices[0].message.content ?? "";

    const message = await prisma.message.create({
      data: { interviewId: interview.id, role: "assistant", content: firstQuestion },
    });

    return Response.json({
      id: interview.id,
      role: interview.role,
      difficulty: interview.difficulty,
      language: interview.language,
      messages: [{ id: message.id, role: message.role, content: message.content, createdAt: message.createdAt }],
    });
  } catch (err) {
    console.error("[interview/start]", err);
    return Response.json({ error: "Failed to start interview" }, { status: 500 });
  }
}
