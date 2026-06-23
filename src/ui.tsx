import type { ReactNode } from "react";

/** Split a prose blob into paragraphs on blank lines (or single newlines). */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .flatMap((block) => block.split(/\n/))
    .map((p) => p.trim())
    .filter(Boolean);
}

export function Prose({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`prose-arg ${className}`}>
      {paragraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/** The two duelling blades, drawn crossing, used as a chamber motif. */
export function Blades({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <line x1="14" y1="50" x2="48" y2="14" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" opacity="0.9" />
      <line x1="50" y1="50" x2="16" y2="14" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" opacity="0.55" />
      <circle cx="32" cy="32" r="3.6" fill="currentColor" />
    </svg>
  );
}

export function Button({
  children,
  onClick,
  variant = "mine",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "mine" | "foe" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-700 uppercase tracking-wider transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-offset-2";
  const styles: Record<string, string> = {
    mine: "bg-mine text-mine-ink hover:bg-mine-deep hover:-translate-y-0.5 shadow-mine active:translate-y-0",
    foe: "bg-foe text-parchment hover:bg-foe-deep hover:-translate-y-0.5 shadow-foe active:translate-y-0",
    ghost: "border border-chamber-line text-parchment/80 hover:text-parchment hover:border-mine/50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Animated "the opponent is thinking" bars — a fencing-mask rhythm. */
export function Thinking({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-foe-steel/90" role="status" aria-live="polite">
      <div className="flex items-end gap-1" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="block w-1 rounded-full bg-foe-steel animate-thinkPulse"
            style={{ height: 18, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
      <span className="font-sans text-sm tracking-wide">{label}</span>
    </div>
  );
}
