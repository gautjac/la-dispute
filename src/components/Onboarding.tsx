import { useState } from "react";
import { useI18n } from "../i18n";
import { Blades, Button } from "../ui";

const STORE_KEY = "la-dispute:onboarded";

export function hasOnboarded(): boolean {
  return localStorage.getItem(STORE_KEY) === "1";
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  const finish = () => {
    localStorage.setItem(STORE_KEY, "1");
    onDone();
  };

  const slides = [
    {
      title: t("ob1Title"),
      body: t("ob1Body"),
      art: (
        <div className="flex items-center justify-center gap-6">
          <span className="banner text-5xl text-mine">TOI</span>
          <Blades className="h-12 w-12 text-parchment animate-thinkPulse" />
          <span className="banner text-5xl text-foe">CLAUDE</span>
        </div>
      ),
    },
    {
      title: t("ob2Title"),
      body: t("ob2Body"),
      art: (
        <div className="flex items-center justify-center gap-3">
          {[t("round1Name"), t("round2Name"), t("round3Name")].map((n, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-chamber-line bg-chamber-panel px-5 py-4"
            >
              <span className="banner text-3xl text-mine-deep">{i + 1}</span>
              <span className="mt-1 font-sans text-[11px] uppercase tracking-widest text-parchment/70">
                {n}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t("ob3Title"),
      body: t("ob3Body"),
      art: (
        <div className="flex items-center justify-center gap-4">
          <span className="rounded-full bg-survive/15 px-4 py-1.5 font-sans text-xs font-700 uppercase tracking-wider text-survive">
            {t("survived")}
          </span>
          <span className="rounded-full bg-dent/15 px-4 py-1.5 font-sans text-xs font-700 uppercase tracking-wider text-dent">
            {t("dented")}
          </span>
          <span className="rounded-full bg-fell/15 px-4 py-1.5 font-sans text-xs font-700 uppercase tracking-wider text-fell">
            {t("fell")}
          </span>
        </div>
      ),
    },
  ];

  const s = slides[step];
  const last = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chamber/90 px-5 backdrop-blur-sm">
      <div
        key={step}
        className="w-full max-w-lg animate-sweepIn rounded-3xl border border-chamber-line bg-chamber-panel p-8 shadow-lift sm:p-10"
      >
        <div className="mb-7 flex min-h-[88px] items-center justify-center">{s.art}</div>
        <h2 className="banner text-3xl text-parchment sm:text-4xl">{s.title}</h2>
        <p className="mt-3 font-serif text-[1.05rem] leading-relaxed text-parchment/85">{s.body}</p>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={finish}
            className="font-sans text-xs uppercase tracking-widest text-parchment/50 transition-colors hover:text-parchment/80"
          >
            {t("obSkip")}
          </button>

          <div className="flex items-center gap-2" aria-hidden="true">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-mine" : "w-1.5 bg-chamber-line"
                }`}
              />
            ))}
          </div>

          <Button onClick={last ? finish : () => setStep((x) => x + 1)}>
            {last ? t("obStart") : t("obNext")}
          </Button>
        </div>
      </div>
    </div>
  );
}
