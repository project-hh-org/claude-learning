import { buildStepSystemPrompt } from '@/lib/ai/stepPrompt';
import type { StepContext, StepResponse } from '@/types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function readApiKey(): string | undefined {
  // Server-side first; fallback to EXPO_PUBLIC for early prototyping. The latter
  // is intentionally not recommended — it can leak the key into web bundles.
  return process.env.CLAUDE_API_KEY ?? process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
}

function stripJsonFences(text: string): string {
  return text.replace(/```json|```/g, '').trim();
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = readApiKey();
  if (!apiKey) {
    return Response.json({ error: 'CLAUDE_API_KEY missing on server' }, { status: 500 });
  }

  let context: StepContext;
  try {
    context = (await request.json()) as StepContext;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: buildStepSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: JSON.stringify(context),
          },
        ],
      }),
    });
  } catch (err) {
    return Response.json(
      { error: 'Claude upstream fetch failed', detail: String(err) },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    return Response.json({ error: `Claude returned ${upstream.status}`, detail }, { status: 502 });
  }

  const data = (await upstream.json()) as {
    content?: { text?: string }[];
  };
  const text = data.content?.[0]?.text ?? '{}';

  try {
    const parsed = JSON.parse(stripJsonFences(text)) as StepResponse;
    return Response.json(parsed);
  } catch {
    return Response.json({ error: 'AI response parse failed', raw: text }, { status: 500 });
  }
}
