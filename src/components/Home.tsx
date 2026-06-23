import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, createDuel, deleteDuel } from "../db";
import { useI18n } from "../i18n";
import { Blades, Button } from "../ui";

export function Home({ onOpen }: { onOpen: (id: number) => void }) {
  const { t, lang, setLang } = useI18n();
  const [conviction, setConviction] = useState("");

  const duels = useLiveQuery(
    () => db.duels.orderBy("updatedAt").reverse().toArray(),
    [],
    [],
  );

  const start = async () => {
    const text = conviction.trim();
    if (text.length < 6) return;
    const id = await createDuel(text);
    onOpen(id);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void start();
    }
  };

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const statusFor = (stage: number, hasVerdict: boolean) => {
    if (hasVerdict) return t("reread");
    if (stage > 1) return `${t("round")} ${Math.min(stage, 3)}`;
    return t("reopen");
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Blades className="h-7 w-7 text-mine" />
          <span className="font-sans text-sm font-700 uppercase tracking-[0.25em] text-parchment/80">
            {t("appName")}
          </span>
        </div>
        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          className="rounded-full border border-chamber-line px-3 py-1.5 font-sans text-xs font-600 tracking-wider text-parchment/70 transition-colors hover:border-mine/50 hover:text-parchment"
          aria-label="Toggle language"
        >
          {t("langToggle")}
        </button>
      </div>

      {/* Hero */}
      <div className="mt-12 text-center sm:mt-16">
        <h1 className="banner text-7xl text-parchment sm:text-8xl">
          La <span className="text-foe">Dis</span>pute
        </h1>
        <p className="mt-3 font-serif text-xl italic text-mine">{t("tagline")}</p>
        <p className="mx-auto mt-4 max-w-xl font-sans text-[0.95rem] leading-relaxed text-parchment/70">
          {t("blurb")}
        </p>
      </div>

      {/* Conviction composer */}
      <div className="sel-mine mt-10 rounded-3xl border border-mine/25 bg-chamber-panel p-6 shadow-mine sm:p-7">
        <label
          htmlFor="conviction"
          className="font-sans text-xs font-700 uppercase tracking-widest text-mine-deep"
        >
          {t("convictionLabel")}
        </label>
        <textarea
          id="conviction"
          value={conviction}
          onChange={(e) => setConviction(e.target.value)}
          onKeyDown={onKey}
          rows={3}
          placeholder={t("convictionPlaceholder")}
          className="mt-3 w-full resize-none rounded-xl border border-chamber-line bg-chamber px-4 py-3 font-serif text-[1.08rem] leading-relaxed text-parchment placeholder:text-chamber-mist focus:border-mine/60 focus:outline-none"
        />
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="font-sans text-xs text-parchment/45">{t("convictionHint")}</p>
          <Button onClick={start} disabled={conviction.trim().length < 6}>
            {t("enterArena")}
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="mt-14">
        <h2 className="font-sans text-xs font-700 uppercase tracking-widest text-parchment/50">
          {t("historyTitle")}
        </h2>
        {duels && duels.length > 0 ? (
          <ul className="mt-4 space-y-2.5">
            {duels.map((d) => (
              <li
                key={d.id}
                className="group flex items-center gap-3 rounded-2xl border border-chamber-line bg-chamber-panel/70 p-4 transition-colors hover:border-mine/40"
              >
                <button
                  onClick={() => d.id != null && onOpen(d.id)}
                  className="flex-1 text-left"
                >
                  <p className="font-serif text-[1.05rem] leading-snug text-parchment">
                    {d.conviction}
                  </p>
                  <p className="mt-1 font-sans text-xs text-parchment/45">
                    {fmtDate(d.updatedAt)} · {statusFor(d.stage, !!d.verdict)}
                  </p>
                </button>
                <button
                  onClick={async () => {
                    if (d.id != null && confirm(t("confirmDelete"))) await deleteDuel(d.id);
                  }}
                  className="shrink-0 rounded-full p-2 text-parchment/30 transition-colors hover:bg-fell/15 hover:text-fell"
                  aria-label={t("delete")}
                  title={t("delete")}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2m-9 0v14a1 1 0 001 1h8a1 1 0 001-1V6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-chamber-line p-6 text-center font-serif italic text-parchment/45">
            {t("historyEmpty")}
          </p>
        )}
      </div>
    </div>
  );
}
