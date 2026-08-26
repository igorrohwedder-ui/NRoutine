import type { RoutineStats } from "@/lib/taskStatus";

function ProgressRing({ value }: { value: number }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center"
      role="img"
      aria-label={`${value}% das tarefas concluídas`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-brand transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-foreground">{value}%</span>
    </div>
  );
}

export default function PageHeader({ stats }: { stats: RoutineStats }) {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="border-b border-border bg-surface px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium capitalize tracking-wide text-foreground-muted">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">Minha Rotina</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {stats.total === 0
              ? "Nenhuma tarefa hoje ainda."
              : `${stats.completed} de ${stats.total} tarefas concluídas · ${stats.progress}%`}
          </p>
        </div>

        {stats.total > 0 && <ProgressRing value={stats.progress} />}
      </div>
    </div>
  );
}
