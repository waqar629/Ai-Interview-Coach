import Groq from "groq-sdk";
import type { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";

type ChatParams = Omit<ChatCompletionCreateParamsNonStreaming, "model">;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Tried in order. Retired models are skipped automatically, so this list only
// needs to be roughly right; discovery below covers the case where all are gone.
const PREFERRED_MODELS = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b",
  "llama-3.1-8b-instant",
].filter((m): m is string => !!m);

// Models on Groq that are not text chat models.
const NON_CHAT = /whisper|guard|safeguard|tts|playai|orpheus|embed|moderation|transcri/i;

let workingModel: string | null = null;
const dead = new Set<string>();

function isModelUnavailable(err: unknown): boolean {
  const e = err as { status?: number; message?: string; error?: { error?: { code?: string } } };
  const code = e?.error?.error?.code ?? "";
  return (
    code === "model_not_found" ||
    code === "model_decommissioned" ||
    ((e?.status === 404 || e?.status === 400) && /model/i.test(e?.message ?? ""))
  );
}

function paramBillions(id: string): number {
  const m = id.match(/(\d+(?:\.\d+)?)b/i);
  return m ? parseFloat(m[1]) : 0;
}

async function discoverModels(): Promise<string[]> {
  const { data } = await groq.models.list();
  return data
    .map((m) => m.id)
    .filter((id) => !NON_CHAT.test(id))
    // larger parameter count in the name first, as a rough proxy for capability
    .sort((a, b) => paramBillions(b) - paramBillions(a));
}

/** Chat completion that survives Groq retiring or renaming models. */
export async function chatCompletion(params: ChatParams) {
  const queue = workingModel ? [workingModel] : [];
  queue.push(...PREFERRED_MODELS.filter((m) => m !== workingModel && !dead.has(m)));

  let discovered = false;
  let lastErr: unknown;

  while (queue.length) {
    const model = queue.shift()!;
    try {
      const res = await groq.chat.completions.create({ ...params, model, stream: false });
      workingModel = model;
      return res;
    } catch (err) {
      if (!isModelUnavailable(err)) throw err;
      lastErr = err;
      dead.add(model);
      if (model === workingModel) workingModel = null;
      console.warn(`[groq] model unavailable, trying next: ${model}`);

      if (!queue.length && !discovered) {
        discovered = true;
        try {
          queue.push(...(await discoverModels()).filter((m) => !dead.has(m)));
        } catch (listErr) {
          console.error("[groq] model discovery failed", listErr);
        }
      }
    }
  }
  throw lastErr ?? new Error("No Groq chat model available");
}
