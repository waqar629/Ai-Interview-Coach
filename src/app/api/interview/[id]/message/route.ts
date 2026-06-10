import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { getSystemPrompt } from "@/lib/prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const INTERVIEW_COMPLETE_PHRASES = [
  "that concludes our interview",
  "thank you for your time",
  "the interview is now complete",
  "that wraps up our interview",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { content } = await request.json();
    if (!content?.trim()) {
      return Response.json({ error: "Message content is required" }, { status: 400 });
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!interview) {
      return Response.json({ error: "Interview not found" }, { status: 404 });
    }
    if (interview.status !== "in_progress") {
      return Response.json({ error: "Interview is already completed" }, { status: 400 });
    }

    const userMessage = await prisma.message.create({
      data: { interviewId: id, role: "user", content: content.trim() },
    });

    const systemPrompt = getSystemPrompt(
      interview.role,
      interview.difficulty,
      interview.context ?? undefined,
      interview.language ?? "en",
      interview.interviewType ?? "technical"
    );

    const history = interview.messages.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: content.trim() },
      ],
    });

    const aiText = response.choices[0].message.content ?? "";

    const assistantMessage = await prisma.message.create({
      data: { interviewId: id, role: "assistant", content: aiText },
    });

    const interviewComplete = INTERVIEW_COMPLETE_PHRASES.some((phrase) =>
      aiText.toLowerCase().includes(phrase)
    );

    return Response.json({
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
      interviewComplete,
    });
  } catch (err) {
    console.error("[interview/message]", err);
    return Response.json({ error: "Failed to process message" }, { status: 500 });
  }
}
