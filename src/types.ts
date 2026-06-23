// Shared domain types for La Dispute.

/** Which of the three rounds. */
export type RoundNo = 1 | 2 | 3;

/** One exchange the user and the opponent each take a turn in. */
export interface Turn {
  round: RoundNo;
  /** What the user wrote this round. */
  user: string;
  /** The opponent's argument back (markdown-ish plain prose, paragraphs split on \n\n). */
  foe: string;
}

/** How a single user claim fared in the verdict. */
export type ClaimStatus = "survived" | "dented" | "fell";

export interface ClaimScore {
  /** A faithful, short paraphrase of one claim the user actually made. */
  claim: string;
  status: ClaimStatus;
  /** One sentence on why it survived / was dented / fell. */
  why: string;
}

/** The full, structured verdict — Le Bilan. */
export interface Verdict {
  /** A one-line headline read of how the exchange went. */
  headline: string;
  claims: ClaimScore[];
  /** A genuine concession the opponent makes to the user. */
  concession: string;
  /** "The strongest version of your view is now…" reframing. */
  reframing: string;
  /** Tallies (derived server-side, but mirrored for convenience). */
  tally: { survived: number; dented: number; fell: number };
}

/** A complete, stored duel. */
export interface Duel {
  id?: number;
  /** The user's stated conviction — the title of the duel. */
  conviction: string;
  turns: Turn[];
  verdict: Verdict | null;
  /** 1..3 = which round is next to write; 4 = ready for verdict; 5 = done. */
  stage: number;
  createdAt: number;
  updatedAt: number;
}
