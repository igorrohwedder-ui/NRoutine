type Tone = "brand" | "neutral" | "success";

type Props = {
  title: string;
  count: number;
  tone?: Tone;
};

const DOT_TONES: Record<Tone, string> = {
  brand: "bg-brand",
  neutral: "bg-foreground-muted",
  success: "bg-success",
};

export default function SectionHeader({ title, count, tone = "neutral" }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONES[tone]}`} aria-hidden="true" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <span
        className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-foreground-muted"
        aria-label={`${count} ${count === 1 ? "item" : "itens"}`}
      >
        {count}
      </span>
    </div>
  );
}
