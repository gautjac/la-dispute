import type { Context } from "@netlify/functions";
import { verdict, type Lang, type Turn } from "./lib/sparring.ts";

interface Body {
  conviction?: string;
  turns?: Turn[];
  lang?: Lang;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const lang: Lang = body.lang === "en" ? "en" : "fr";
  const conviction = (body.conviction ?? "").trim();
  const turns = Array.isArray(body.turns) ? body.turns : [];

  if (!conviction || turns.length < 1) {
    return json(
      {
        error:
          lang === "en"
            ? "A verdict needs at least one completed round."
            : "Un bilan exige au moins une manche complétée.",
      },
      400,
    );
  }

  // Forced tool-use structured verdict on Opus — also slow. NDJSON keepalive.
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* closed */
          }
        }
      }, 3000);

      try {
        const result = await verdict({ conviction, turns, lang });
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message =
          err instanceof Error ? err.message : lang === "en" ? "Unknown error" : "Erreur inconnue";
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};
