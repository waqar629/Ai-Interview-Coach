import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        result: true,
      },
    });

    if (!interview) {
      return Response.json({ error: "Interview not found" }, { status: 404 });
    }

    const safeResult = interview.result
      ? {
          ...interview.result,
          strengths: JSON.parse(interview.result.strengths),
          weaknesses: JSON.parse(interview.result.weaknesses),
          suggestions: JSON.parse(interview.result.suggestions),
        }
      : null;

    return Response.json({
      ...interview,
      messages: interview.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
      result: safeResult,
    });
  } catch (err) {
    console.error("[interview/get]", err);
    return Response.json({ error: "Failed to fetch interview" }, { status: 500 });
  }
}
