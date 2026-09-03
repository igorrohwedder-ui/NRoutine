type Tone = "brand" | "neutral" | "success";

type Props = {
  title: string;
  count: number;
  tone?: Tone;
  /** Heading level — use "h3" for sub-groups nested inside a section. */
  as?: "h2" | "h3";
};

const DOT_TONES: Record<Tone, string> = {
  brand: "bg-brand",
  neutral: "bg-foreground-muted",
  success: "bg-success",
};

export default function SectionHeader({ title, count, tone = "neutral", as = "h2" }: Props) {
  const Heading = as;
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONES[tone]}`} aria-hidden="true" />
      <Heading className={as === "h2" ? "text-sm font-semibold text-foreground" : "text-xs font-semibold uppercase tracking-wider text-foreground-secondary"}>
        {title}
      </Heading>
      <span
        className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-foreground-muted"
        aria-label={`${count} ${count === 1 ? "item" : "itens"}`}
      >
        {count}
      </span>
    </div>
  );
}
