import type { Context } from "@netlify/functions";
import { argue, type Lang, type RoundNo, type Turn } from "./lib/sparring.ts";

interface Body {
  conviction?: string;
  round?: number;
  priorTurns?: Turn[];
  currentUser?: string;
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
  const currentUser = (body.currentUser ?? "").trim();
  const round = body.round as RoundNo;

  if (!conviction || ![1, 2, 3].includes(round) || currentUser.length < 2) {
    return json(
      {
        error:
          lang === "en"
            ? "Write a little more before sending."
            : "Écris un peu plus avant d'envoyer.",
      },
      400,
    );
  }

  // The Opus argument can run 25–55s — beyond Netlify's idle timeout. Stream
  // NDJSON: bare-newline heartbeats keep the socket alive, then a final
  // { result | error } line carries the payload. The client parses the last line.
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
        const result = await argue({
          conviction,
          round,
          priorTurns: Array.isArray(body.priorTurns) ? body.priorTurns : [],
          currentUser,
          lang,
        });
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
