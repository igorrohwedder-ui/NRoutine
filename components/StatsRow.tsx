import type { RoutineStats } from "@/lib/taskStatus";

export default function StatsRow({ stats }: { stats: RoutineStats }) {
  const tiles: { label: string; value: string | number; tone: string }[] = [
    { label: "Concluídas", value: stats.completed, tone: "text-success" },
    { label: "Pendentes", value: stats.pending, tone: "text-foreground" },
    {
      label: "Atrasadas",
      value: stats.overdue,
      tone: stats.overdue > 0 ? "text-danger" : "text-foreground",
    },
    { label: "Progresso", value: `${stats.progress}%`, tone: "text-brand" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-xs font-medium text-foreground-muted">{tile.label}</p>
          <p className={`mt-1 text-xl font-semibold ${tile.tone}`}>{tile.value}</p>
        </div>
      ))}
    </div>
  );
}
