import { useEffect, useRef, useState } from "react";
import { fetchArgument, fetchVerdict } from "../api";
import { getDuel, saveDuel } from "../db";
import { useI18n } from "../i18n";
import type { Duel, RoundNo, Turn } from "../types";
import { Blades, Button, Prose, Thinking } from "../ui";
import { VerdictView } from "./VerdictView";

type Phase = "loading" | "writing" | "arguing" | "rebuttal-shown" | "verdict-pending" | "verdict";

const ROUND_NAME_KEY: Record<RoundNo, "round1Name" | "round2Name" | "round3Name"> = {
  1: "round1Name",
  2: "round2Name",
  3: "round3Name",
};
const ROUND_PLACEHOLDER: Record<RoundNo, "placeholderR1" | "placeholderR2" | "placeholderR3"> = {
  1: "placeholderR1",
  2: "placeholderR2",
  3: "placeholderR3",
};
const ROUND_PROMPT: Record<RoundNo, "yourCase" | "yourRebuttal" | "yourClosing"> = {
  1: "yourCase",
  2: "yourRebuttal",
  3: "yourClosing",
};

export function Arena({ duelId, onHome }: { duelId: number; onHome: () => void }) {
  const { t, lang } = useI18n();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Load the duel and infer phase from its stored stage.
  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await getDuel(duelId);
      if (!alive) return;
      if (!d) {
        onHome();
        return;
      }
      setDuel(d);
      if (d.verdict) setPhase("verdict");
      else if (d.stage >= 4) setPhase("verdict-pending");
      else setPhase(d.turns.length >= d.stage ? "rebuttal-shown" : "writing");
    })();
    return () => {
      alive = false;
    };
  }, [duelId, onHome]);

  // Keep the transcript scrolled to the newest exchange.
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [duel?.turns.length, phase]);

  if (!duel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Thinking label="…" />
      </div>
    );
  }

  const currentRound = Math.min(duel.stage, 3) as RoundNo;
  const completed = duel.turns;

  const persist = async (next: Duel) => {
    setDuel(next);
    await saveDuel(next);
  };

  const submitRound = async () => {
    const text = draft.trim();
    if (text.length < 2 || !duel) return;
    setError(null);
    setPhase("arguing");
    try {
      const priorTurns: Turn[] = duel.turns;
      const { argument } = await fetchArgument({
        conviction: duel.conviction,
        round: currentRound,
        priorTurns,
        currentUser: text,
        lang,
      });
      const newTurn: Turn = { round: currentRound, user: text, foe: argument };
      const turns = [...duel.turns, newTurn];
      const stage = duel.stage + 1; // 1->2, 2->3, 3->4(ready for verdict)
      const next: Duel = { ...duel, turns, stage, updatedAt: Date.now() };
      await persist(next);
      setDraft("");
      setPhase(stage >= 4 ? "verdict-pending" : "rebuttal-shown");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("writing");
    }
  };

  const nextRound = () => {
    setDraft("");
    setError(null);
    setPhase("writing");
  };

  const renderVerdict = async () => {
    if (!duel) return;
    setError(null);
    setPhase("verdict-pending");
    try {
      const v = await fetchVerdict({ conviction: duel.conviction, turns: duel.turns, lang });
      const next: Duel = { ...duel, verdict: v, stage: 5, updatedAt: Date.now() };
      await persist(next);
      setPhase("verdict");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("verdict-pending");
    }
  };

  if (phase === "verdict" && duel.verdict) {
    return <VerdictView verdict={duel.verdict} onRematch={onHome} onHome={onHome} />;
  }

  const showComposer = phase === "writing";
  const promptKey = ROUND_PROMPT[currentRound];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-8 pt-6">
      {/* Header: conviction + round meter */}
      <header className="shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onHome}
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-parchment/50 transition-colors hover:text-parchment"
          >
            <Blades className="h-5 w-5 text-mine" />
            {t("backHome")}
          </button>
          <RoundMeter stage={duel.stage} />
        </div>
        <div className="sel-mine mt-4 rounded-2xl border border-mine/25 bg-mine-wash/40 px-5 py-3">
          <p className="font-sans text-[10px] font-700 uppercase tracking-widest text-mine-deep">
            {t("convictionLabel")}
          </p>
          <p className="mt-0.5 font-serif text-[1.1rem] leading-snug text-parchment">
            “{duel.conviction}”
          </p>
        </div>
      </header>

      {/* Transcript */}
      <div ref={transcriptRef} className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
        {completed.map((turn) => (
          <RoundBlock key={turn.round} turn={turn} t={t} />
        ))}

        {phase === "arguing" && (
          <div className="animate-slideFoe rounded-2xl border border-foe/30 bg-foe-wash/50 p-5">
            <FoeLabel t={t} />
            <div className="mt-3">
              <Thinking label={t("thinking")} />
            </div>
          </div>
        )}

        {phase === "verdict-pending" && (
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-chamber-line bg-chamber-panel p-8 text-center">
            <Blades className="h-10 w-10 text-mine animate-thinkPulse" />
            <p className="font-serif text-lg italic text-parchment/80">
              {t("round")} 1–3 ✓
            </p>
            {error ? (
              <>
                <p className="font-sans text-sm text-fell">{t("loadingError")}{error}</p>
                <Button variant="foe" onClick={renderVerdict}>
                  {t("retry")}
                </Button>
              </>
            ) : (
              <Button onClick={renderVerdict}>{t("toVerdict")}</Button>
            )}
          </div>
        )}
      </div>

      {/* Composer / continue */}
      {(showComposer || phase === "rebuttal-shown") && (
        <footer className="shrink-0 pt-5">
          {showComposer ? (
            <div className="sel-mine animate-slideMine rounded-2xl border border-mine/30 bg-chamber-panel p-5 shadow-mine">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-700 uppercase tracking-widest text-mine-deep">
                  {t("youLabel")} · {t("round")} {currentRound} — {t(ROUND_NAME_KEY[currentRound])}
                </span>
              </div>
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    void submitRound();
                  }
                }}
                rows={4}
                placeholder={t(ROUND_PLACEHOLDER[currentRound])}
                className="mt-3 w-full resize-none rounded-xl border border-chamber-line bg-chamber px-4 py-3 font-serif text-[1.05rem] leading-relaxed text-parchment placeholder:text-chamber-mist focus:border-mine/60 focus:outline-none"
              />
              {error && <p className="mt-2 font-sans text-sm text-fell">{t("loadingError")}{error}</p>}
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="font-sans text-xs text-parchment/40">{t(promptKey)}</span>
                <Button onClick={submitRound} disabled={draft.trim().length < 2}>
                  {t("submitRound")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={duel.stage >= 4 ? renderVerdict : nextRound}
              >
                {duel.stage >= 4
                  ? t("toVerdict")
                  : `${t("round")} ${Math.min(duel.stage, 3)} →`}
              </Button>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}

function RoundMeter({ stage }: { stage: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[1, 2, 3].map((r) => {
        const done = stage > r || stage >= 4;
        const active = stage === r;
        return (
          <span
            key={r}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              done ? "w-6 bg-mine" : active ? "w-6 bg-foe" : "w-3 bg-chamber-line"
            }`}
          />
        );
      })}
    </div>
  );
}

function FoeLabel({ t }: { t: (k: "foeLabel") => string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-foe" />
      <span className="font-sans text-[11px] font-700 uppercase tracking-widest text-foe-steel">
        {t("foeLabel")}
      </span>
    </div>
  );
}

function RoundBlock({
  turn,
  t,
}: {
  turn: Turn;
  t: (k: "youLabel" | "foeLabel" | "round" | "round1Name" | "round2Name" | "round3Name") => string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="banner text-lg text-parchment/40">
          {t("round")} {turn.round}
        </span>
        <span className="font-sans text-[10px] uppercase tracking-widest text-parchment/35">
          {t(ROUND_NAME_KEY[turn.round])}
        </span>
        <span className="h-px flex-1 bg-chamber-line" />
      </div>

      {/* User side — warm, left-leaning */}
      <div className="sel-mine animate-slideMine rounded-2xl border border-mine/25 bg-mine-wash/30 p-4 sm:mr-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-mine" />
          <span className="font-sans text-[11px] font-700 uppercase tracking-widest text-mine-deep">
            {t("youLabel")}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-wrap font-serif text-[1.02rem] leading-relaxed text-parchment/90">
          {turn.user}
        </p>
      </div>

      {/* Opponent side — cold, right-leaning */}
      <div className="sel-foe animate-slideFoe rounded-2xl border border-foe/30 bg-foe-wash/40 p-4 sm:ml-8">
        <FoeLabel t={t} />
        <Prose text={turn.foe} className="mt-2 text-parchment/90" />
      </div>
    </div>
  );
}
