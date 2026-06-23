import type { Lang } from "./i18n";
import type { RoundNo, Turn, Verdict } from "./types";

/**
 * Both engines stream NDJSON: the function emits bare-newline heartbeats while
 * the (slow) Opus call runs, then a final JSON line carrying { result } or
 * { error }. We read the whole stream and parse the last non-empty line. This
 * survives Netlify's idle timeout on long Opus calls.
 */
async function callNdjson<T>(endpoint: string, payload: unknown): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const last = lines[lines.length - 1] ?? "";

  let parsed: { result?: T; error?: string } | null = null;
  try {
    parsed = last ? JSON.parse(last) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const msg = parsed?.error || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  if (!parsed) throw new Error("Réponse invalide du serveur.");
  if (parsed.error) throw new Error(parsed.error);
  if (parsed.result !== undefined) return parsed.result;
  throw new Error("Réponse invalide du serveur.");
}

export interface ArgueResult {
  /** The opponent's argument for this round, as plain prose. */
  argument: string;
}

/**
 * Ask the opponent for its argument this round.
 * `priorTurns` are the completed turns so far (each with user + foe text).
 * `currentUser` is what the user just wrote for the round we're answering.
 */
export function fetchArgument(input: {
  conviction: string;
  round: RoundNo;
  priorTurns: Turn[];
  currentUser: string;
  lang: Lang;
}): Promise<ArgueResult> {
  return callNdjson<ArgueResult>("/api/argue", input);
}

/** Ask for the structured final verdict (Le Bilan). */
export function fetchVerdict(input: {
  conviction: string;
  turns: Turn[];
  lang: Lang;
}): Promise<Verdict> {
  return callNdjson<Verdict>("/api/verdict", input);
}
