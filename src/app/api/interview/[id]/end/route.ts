import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { getEvaluationPrompt } from "@/lib/prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!interview) {
      return Response.json({ error: "Interview not found" }, { status: 404 });
    }

    const existingResult = await prisma.result.findUnique({ where: { interviewId: id } });
    if (existingResult) {
      return Response.json({ success: true });
    }

    const conversation = interview.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const evalPrompt = getEvaluationPrompt(interview.role, interview.difficulty, conversation);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: evalPrompt }],
    });

    const evalText = (response.choices[0].message.content ?? "").trim();

    let evaluation: {
      technicalScore: number;
      communicationScore: number;
      confidenceScore: number;
      overallScore: number;
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
      summary: string;
    };

    try {
      const jsonMatch = evalText.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : evalText);
    } catch {
      evaluation = {
        technicalScore: 60,
        communicationScore: 60,
        confidenceScore: 60,
        overallScore: 60,
        strengths: ["Participated in the interview"],
        weaknesses: ["Evaluation parsing failed"],
        suggestions: ["Review your answers and try again"],
        summary: "Interview completed. Detailed evaluation was unavailable.",
      };
    }

    await prisma.$transaction([
      prisma.interview.update({
        where: { id },
        data: { status: "completed", completedAt: new Date() },
      }),
      prisma.result.create({
        data: {
          interviewId: id,
          technicalScore: Math.min(100, Math.max(0, evaluation.technicalScore)),
          communicationScore: Math.min(100, Math.max(0, evaluation.communicationScore)),
          confidenceScore: Math.min(100, Math.max(0, evaluation.confidenceScore)),
          overallScore: Math.min(100, Math.max(0, evaluation.overallScore)),
          strengths: JSON.stringify(evaluation.strengths),
          weaknesses: JSON.stringify(evaluation.weaknesses),
          suggestions: JSON.stringify(evaluation.suggestions),
          summary: evaluation.summary,
        },
      }),
    ]);

    return Response.json({ success: true });
  } catch (err) {
    console.error("[interview/end]", err);
    return Response.json({ error: "Failed to evaluate interview" }, { status: 500 });
  }
}
