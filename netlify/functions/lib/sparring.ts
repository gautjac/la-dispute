import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

export type Lang = "fr" | "en";
export type RoundNo = 1 | 2 | 3;

export interface Turn {
  round: RoundNo;
  user: string;
  foe: string;
}

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

function langName(l: Lang): string {
  return l === "fr" ? "French (Québécois, idiomatic — not translated English)" : "English";
}

// The opponent's character. This is the steelman, never the strawman.
const VOICE = `You are the OPPONENT in La Dispute, a sparring app. The user states a conviction they sincerely hold; your job is to argue the OPPOSITE side as well and as fairly as the single smartest, most honest person who genuinely disagrees with them would.

Hard rules:
- STEELMAN, never strawman. Engage the strongest, most charitable version of the user's actual position, then press the best real counter-arguments against it.
- You are not trolling and you are not snide. You are a worthy intellectual opponent: precise, fair, occasionally generous, never smug, never a coach cheering them on. You are HERE TO DISAGREE, well.
- Argue in good faith from a real intellectual tradition or concrete evidence — not contrarianism for its own sake. Use specifics: examples, cases, mechanisms, trade-offs. Avoid platitudes and "both sides" mush.
- Do not concede the whole point and do not hedge into agreement. Hold the opposing line for all three rounds. (You will get one honest concession at the very end, in the verdict — not here.)
- Speak directly to the user ("you"/"tu"). No meta-talk about being an AI, no "as an opponent I would say". Just argue.
- Keep it tight: 2–4 short paragraphs. Quality of thought over length. End with momentum, not a summary.`;

function roundBrief(round: RoundNo, lang: Lang): string {
  const fr = lang === "fr";
  if (round === 1) {
    return fr
      ? "MANCHE 1 — OUVERTURE. L'utilisateur vient de plaider son ouverture. Réponds par la plus forte ouverture adverse : pose ta thèse contraire et tes deux ou trois meilleures raisons. Donne-lui quelque chose de solide à attaquer."
      : "ROUND 1 — OPENING. The user has just made their opening case. Respond with the strongest opposing opening: stake your contrary thesis and your two or three best reasons. Give them something solid to attack.";
  }
  if (round === 2) {
    return fr
      ? "MANCHE 2 — PRESSION. Vise le maillon le plus FAIBLE du raisonnement de l'utilisateur — nomme-le explicitement (une prémisse cachée, un contre-exemple ignoré, une équivoque) — puis enfonce ton meilleur point plus fort. C'est la manche où tu mets de la pression."
      : "ROUND 2 — PRESSURE. Target the WEAKEST joint in the user's reasoning — name it explicitly (a hidden premise, an ignored counter-example, an equivocation) — then press your best point harder. This is the round where you apply pressure.";
  }
  return fr
    ? "MANCHE 3 — CONCLUSION. L'utilisateur a fait sa dernière prise de position. Livre ta conclusion : ramasse le fil de l'échange, rappelle où sa défense a plié, et termine sur ta formulation la plus convaincante. Reste loyal et ferme."
    : "ROUND 3 — CLOSING. The user has made their final stand. Deliver your closing: gather the thread of the exchange, recall where their defence bent, and end on your most persuasive formulation. Stay fair and firm.";
}

function transcript(conviction: string, priorTurns: Turn[], currentUser: string, lang: Lang): string {
  const fr = lang === "fr";
  const youLab = fr ? "UTILISATEUR" : "USER";
  const foeLab = fr ? "TOI (la contrepartie)" : "YOU (the opponent)";
  const parts: string[] = [
    `${fr ? "CONVICTION DE L'UTILISATEUR" : "USER'S CONVICTION"}: "${conviction}"`,
    "",
  ];
  for (const t of priorTurns) {
    parts.push(`— ${fr ? "Manche" : "Round"} ${t.round} —`);
    parts.push(`${youLab}: ${t.user}`);
    parts.push(`${foeLab}: ${t.foe}`);
    parts.push("");
  }
  parts.push(`${fr ? "CE QUE L'UTILISATEUR VIENT D'ÉCRIRE" : "WHAT THE USER JUST WROTE"}:`);
  parts.push(`${youLab}: ${currentUser}`);
  return parts.join("\n");
}

export interface ArgueInput {
  conviction: string;
  round: RoundNo;
  priorTurns: Turn[];
  currentUser: string;
  lang: Lang;
}

export async function argue(input: ArgueInput): Promise<{ argument: string }> {
  const { conviction, round, priorTurns, currentUser, lang } = input;
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1100,
    system: VOICE,
    messages: [
      {
        role: "user",
        content: [
          `Write your argument in ${langName(lang)}.`,
          "",
          roundBrief(round, lang),
          "",
          transcript(conviction, priorTurns, currentUser, lang),
          "",
          lang === "fr"
            ? "Réponds UNIQUEMENT par ton argument (prose, 2–4 paragraphes courts). Pas de titre, pas de préambule, pas de listes à puces."
            : "Respond ONLY with your argument (prose, 2–4 short paragraphs). No heading, no preamble, no bullet lists.",
        ].join("\n"),
      },
    ],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!text) throw new Error(lang === "fr" ? "Aucune réponse de la contrepartie." : "No argument returned.");
  return { argument: text };
}

// ── Verdict ────────────────────────────────────────────────────────────────

export interface ClaimScore {
  claim: string;
  status: "survived" | "dented" | "fell";
  why: string;
}
export interface Verdict {
  headline: string;
  claims: ClaimScore[];
  concession: string;
  reframing: string;
  tally: { survived: number; dented: number; fell: number };
}

const VERDICT_VOICE = `You are the judge in La Dispute — but a judge of the USER'S OWN convictions, not a winner-picker. You just argued the opposing side across three rounds. Now you drop the adversarial role and assess, with complete intellectual honesty, how the user's ORIGINAL position held up under your pressure.

You are NOT trying to have "won". Your job is to make the user's surviving convictions stronger and to expose the soft ones. Be honest in BOTH directions: credit the claims that genuinely held, and be candid about the ones that did not. A user who only ever hears "you fell" learns nothing; a user who only ever hears "you survived" learns nothing.

For each of the user's KEY claims (the load-bearing ones they actually made — not your own points):
- "survived": stood up to the strongest counter you could mount.
- "dented": partly true but weakened — needs a qualifier, a narrower scope, or better support.
- "fell": did not hold under pressure as stated.
Give a one-sentence, specific "why" for each — reference the actual exchange, not generic praise.

Then: ONE genuine concession YOU (the opponent) make to the user — a real point of theirs you found persuasive. And a "the strongest version of your view is now…" reframing: the sharpest, most defensible form of their position after this exchange.`;

const VERDICT_TOOL: Anthropic.Tool = {
  name: "deliver_verdict",
  description: "Deliver the structured verdict (Le Bilan) judging how the user's own claims held up.",
  input_schema: {
    type: "object",
    required: ["headline", "claims", "concession", "reframing"],
    properties: {
      headline: {
        type: "string",
        description: "One vivid sentence reading how the exchange went overall (in the requested language).",
      },
      claims: {
        type: "array",
        minItems: 2,
        maxItems: 6,
        description: "The user's key load-bearing claims, each scored. Paraphrase each claim faithfully and briefly.",
        items: {
          type: "object",
          required: ["claim", "status", "why"],
          properties: {
            claim: { type: "string", description: "A faithful short paraphrase of one claim the USER made." },
            status: { type: "string", enum: ["survived", "dented", "fell"] },
            why: { type: "string", description: "One specific sentence on why, referencing the exchange." },
          },
        },
      },
      concession: {
        type: "string",
        description: "One genuine concession the opponent makes to the user — a real point of theirs that persuaded.",
      },
      reframing: {
        type: "string",
        description: "The strongest, most defensible version of the user's view after this exchange. Start naturally; do not literally prefix with a label.",
      },
    },
  },
};

export interface VerdictInput {
  conviction: string;
  turns: Turn[];
  lang: Lang;
}

export async function verdict(input: VerdictInput): Promise<Verdict> {
  const { conviction, turns, lang } = input;
  const fr = lang === "fr";
  const youLab = fr ? "UTILISATEUR" : "USER";
  const foeLab = fr ? "CONTREPARTIE" : "OPPONENT";
  const lines: string[] = [`${fr ? "CONVICTION" : "CONVICTION"}: "${conviction}"`, ""];
  for (const t of turns) {
    lines.push(`— ${fr ? "Manche" : "Round"} ${t.round} —`);
    lines.push(`${youLab}: ${t.user}`);
    lines.push(`${foeLab}: ${t.foe}`);
    lines.push("");
  }

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1800,
    system: VERDICT_VOICE,
    messages: [
      {
        role: "user",
        content: [
          `Write every field in ${langName(lang)}.`,
          "Judge the USER'S claims (not your own). Here is the full exchange:",
          "",
          lines.join("\n"),
          "",
          "Respond only by calling deliver_verdict. Score 2–6 of the user's load-bearing claims honestly.",
        ].join("\n"),
      },
    ],
    tools: [VERDICT_TOOL],
    tool_choice: { type: "tool", name: "deliver_verdict" },
  });

  const tool = res.content.find((b) => b.type === "tool_use");
  if (!tool || tool.type !== "tool_use") {
    throw new Error(fr ? "Aucun bilan rendu." : "No verdict returned.");
  }
  const i = tool.input as Record<string, unknown>;
  const rawClaims = Array.isArray(i.claims) ? (i.claims as Record<string, unknown>[]) : [];
  const claims: ClaimScore[] = rawClaims.map((c) => {
    const status = c.status === "survived" || c.status === "dented" || c.status === "fell" ? c.status : "dented";
    return {
      claim: String(c.claim ?? "").trim(),
      status,
      why: String(c.why ?? "").trim(),
    };
  });
  const tally = {
    survived: claims.filter((c) => c.status === "survived").length,
    dented: claims.filter((c) => c.status === "dented").length,
    fell: claims.filter((c) => c.status === "fell").length,
  };
  return {
    headline: String(i.headline ?? "").trim(),
    claims,
    concession: String(i.concession ?? "").trim(),
    reframing: String(i.reframing ?? "").trim(),
    tally,
  };
}
