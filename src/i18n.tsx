import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

const STORE_KEY = "la-dispute:lang";

type Dict = Record<string, string>;

const FR: Dict = {
  appName: "La Dispute",
  tagline: "Le gymnase de tes convictions.",
  blurb:
    "Énonce une opinion que tu tiens vraiment. Claude défendra le camp adverse — le mieux et le plus loyalement possible. Trois manches, puis un bilan honnête.",

  // Onboarding
  obSkip: "Passer",
  obNext: "Suivant",
  obStart: "Entrer dans l'arène",
  ob1Title: "Tu défends. Claude attaque.",
  ob1Body:
    "Écris une conviction sincère. Claude prend EXPRÈS le camp opposé — pas un épouvantail, pas pour te narguer : la version la plus forte et la plus honnête du désaccord.",
  ob2Title: "Trois manches",
  ob2Body:
    "Manche 1 — l'ouverture. Manche 2 — la pression : Claude vise le maillon le plus faible de ton raisonnement. Manche 3 — la conclusion. À toi le dernier mot de chaque manche, puis Claude répond.",
  ob3Title: "Le Bilan",
  ob3Body:
    "À la fin, Claude juge tes propres arguments : ce qui a survécu, ce qui a été ébranlé, ce qui est tombé. Le but n'est pas de gagner — c'est de renforcer tes convictions solides et d'exposer les molles.",

  // Home
  newDuel: "Nouvelle dispute",
  convictionLabel: "Énonce ta conviction",
  convictionPlaceholder:
    "Ex. : « Un film ne devrait jamais utiliser de voix hors champ. » — une opinion que tu tiens vraiment.",
  convictionHint: "Une phrase claire et défendable. Claude défendra le contraire.",
  enterArena: "Lancer la dispute",
  historyTitle: "Tes disputes passées",
  historyEmpty: "Aucune dispute encore. Énonce ta première conviction au-dessus.",
  reopen: "Rouvrir",
  delete: "Supprimer",
  confirmDelete: "Supprimer cette dispute ?",

  // Rounds
  round: "Manche",
  round1Name: "Ouverture",
  round2Name: "Pression",
  round3Name: "Conclusion",
  youLabel: "Toi — la défense",
  foeLabel: "La contrepartie",
  yourCase: "Plaide ton ouverture",
  yourRebuttal: "Réplique",
  yourClosing: "Ta dernière prise de position",
  placeholderR1: "Expose ton meilleur argument. Pourquoi tiens-tu à cette conviction ?",
  placeholderR2: "Réponds à son attaque. Renforce le point qu'elle vise.",
  placeholderR3: "Ta conclusion. Que reste-t-il debout, selon toi ?",
  submitRound: "Envoyer",
  thinking: "La contrepartie réfléchit…",
  thinkingVerdict: "Claude pèse les deux camps…",
  toVerdict: "Rendre le bilan",
  retry: "Réessayer",

  // Verdict
  verdictTitle: "Le Bilan",
  survived: "a survécu",
  dented: "ébranlé",
  fell: "est tombé",
  concessionTitle: "La concession de Claude",
  reframeTitle: "La version la plus forte de ton point",
  tallySurvived: "survécu",
  tallyDented: "ébranlé",
  tallyFell: "tombé",
  rematch: "Nouvelle dispute",
  backHome: "Accueil",
  reread: "Relire le bilan",

  // misc
  loadingError: "Quelque chose a coché. ",
  langToggle: "EN",
  closeHistory: "Fermer",
};

const EN: Dict = {
  appName: "La Dispute",
  tagline: "A gym for your convictions.",
  blurb:
    "State an opinion you actually hold. Claude will argue the other side — as well and as fairly as it can. Three rounds, then an honest verdict.",

  obSkip: "Skip",
  obNext: "Next",
  obStart: "Enter the arena",
  ob1Title: "You defend. Claude attacks.",
  ob1Body:
    "Write a sincere conviction. Claude takes the opposite side ON PURPOSE — not a strawman, not to troll: the strongest, most honest version of the disagreement.",
  ob2Title: "Three rounds",
  ob2Body:
    "Round 1 — the opening. Round 2 — pressure: Claude aims at the weakest joint in your reasoning. Round 3 — the closing. You get the last word each round, then Claude answers.",
  ob3Title: "The verdict",
  ob3Body:
    "At the end, Claude judges your own arguments: what survived, what was dented, what fell. The point isn't to win — it's to make your solid convictions stronger and expose the soft ones.",

  newDuel: "New dispute",
  convictionLabel: "State your conviction",
  convictionPlaceholder:
    'e.g. "Film should never use voiceover narration." — an opinion you actually hold.',
  convictionHint: "One clear, defensible sentence. Claude will argue the opposite.",
  enterArena: "Start the dispute",
  historyTitle: "Your past disputes",
  historyEmpty: "No disputes yet. State your first conviction above.",
  reopen: "Reopen",
  delete: "Delete",
  confirmDelete: "Delete this dispute?",

  round: "Round",
  round1Name: "Opening",
  round2Name: "Pressure",
  round3Name: "Closing",
  youLabel: "You — the defence",
  foeLabel: "The opponent",
  yourCase: "Make your opening",
  yourRebuttal: "Rebut",
  yourClosing: "Your final stand",
  placeholderR1: "Lay out your best argument. Why do you hold this conviction?",
  placeholderR2: "Answer its attack. Shore up the point it targets.",
  placeholderR3: "Your closing. What still stands, in your view?",
  submitRound: "Send",
  thinking: "The opponent is thinking…",
  thinkingVerdict: "Claude is weighing both sides…",
  toVerdict: "Deliver the verdict",
  retry: "Try again",

  verdictTitle: "The Verdict",
  survived: "survived",
  dented: "dented",
  fell: "fell",
  concessionTitle: "Claude's concession",
  reframeTitle: "The strongest version of your view",
  tallySurvived: "survived",
  tallyDented: "dented",
  tallyFell: "fell",
  rematch: "New dispute",
  backHome: "Home",
  reread: "Re-read verdict",

  loadingError: "Something snagged. ",
  langToggle: "FR",
  closeHistory: "Close",
};

const DICTS: Record<Lang, Dict> = { fr: FR, en: EN };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof FR) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved === "en" || saved === "fr") return saved;
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "fr";
  });

  useEffect(() => {
    localStorage.setItem(STORE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value: I18nCtx = {
    lang,
    setLang: setLangState,
    t: (k) => DICTS[lang][k] ?? DICTS.fr[k] ?? String(k),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
