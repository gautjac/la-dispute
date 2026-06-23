import { useI18n } from "../i18n";
import type { ClaimStatus, Verdict } from "../types";
import { Button } from "../ui";

const STATUS_STYLE: Record<
  ClaimStatus,
  { ring: string; chip: string; dot: string; bar: string }
> = {
  survived: {
    ring: "border-survive/40",
    chip: "bg-survive/15 text-survive",
    dot: "bg-survive",
    bar: "bg-survive",
  },
  dented: {
    ring: "border-dent/40",
    chip: "bg-dent/15 text-dent",
    dot: "bg-dent",
    bar: "bg-dent",
  },
  fell: {
    ring: "border-fell/40",
    chip: "bg-fell/15 text-fell",
    dot: "bg-fell",
    bar: "bg-fell",
  },
};

export function VerdictView({
  verdict,
  onRematch,
  onHome,
}: {
  verdict: Verdict;
  onRematch: () => void;
  onHome: () => void;
}) {
  const { t } = useI18n();
  const statusLabel = (s: ClaimStatus) => t(s);
  const total = verdict.claims.length || 1;

  return (
    <div className="mx-auto w-full max-w-3xl animate-sweepIn px-5 pb-24 pt-10">
      <div className="text-center">
        <p className="font-sans text-xs uppercase tracking-[0.35em] text-mine-deep">
          {t("appName")}
        </p>
        <h1 className="banner mt-2 text-6xl text-parchment sm:text-7xl">{t("verdictTitle")}</h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-lg italic leading-relaxed text-parchment/90">
          {verdict.headline}
        </p>
      </div>

      {/* Tally bar */}
      <div className="mt-8 overflow-hidden rounded-full border border-chamber-line bg-chamber-panel">
        <div className="flex h-3 w-full">
          {(["survived", "dented", "fell"] as ClaimStatus[]).map((s) => {
            const n = verdict.tally[s];
            if (!n) return null;
            return (
              <div
                key={s}
                className={STATUS_STYLE[s].bar}
                style={{ width: `${(n / total) * 100}%` }}
                title={`${n} ${statusLabel(s)}`}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 font-sans text-xs uppercase tracking-wider text-parchment/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-survive" /> {verdict.tally.survived}{" "}
          {t("tallySurvived")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-dent" /> {verdict.tally.dented}{" "}
          {t("tallyDented")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-fell" /> {verdict.tally.fell} {t("tallyFell")}
        </span>
      </div>

      {/* Scorecard */}
      <div className="mt-8 space-y-3">
        {verdict.claims.map((c, i) => {
          const st = STATUS_STYLE[c.status];
          return (
            <div
              key={i}
              className={`animate-riseIn rounded-2xl border ${st.ring} bg-chamber-panel p-5`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-serif text-[1.05rem] leading-snug text-parchment">
                  <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${st.dot}`} />
                  {c.claim}
                </p>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-sans text-[11px] font-700 uppercase tracking-wider ${st.chip}`}
                >
                  {statusLabel(c.status)}
                </span>
              </div>
              <p className="mt-2 pl-4 font-sans text-sm leading-relaxed text-parchment/70">
                {c.why}
              </p>
            </div>
          );
        })}
      </div>

      {/* Concession + reframing */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-foe/30 bg-foe-wash/60 p-5">
          <h3 className="font-sans text-xs font-700 uppercase tracking-widest text-foe-steel">
            {t("concessionTitle")}
          </h3>
          <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-parchment/90">
            {verdict.concession}
          </p>
        </div>
        <div className="rounded-2xl border border-mine/30 bg-mine-wash/60 p-5">
          <h3 className="font-sans text-xs font-700 uppercase tracking-widest text-mine-deep">
            {t("reframeTitle")}
          </h3>
          <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-parchment/90">
            {verdict.reframing}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button onClick={onRematch}>{t("rematch")}</Button>
        <Button variant="ghost" onClick={onHome}>
          {t("backHome")}
        </Button>
      </div>
    </div>
  );
}
