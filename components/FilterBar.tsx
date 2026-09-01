export type RoutineFilter =
  | "all"
  | "projects"
  | "recurring"
  | "completed"
  | "pending"
  | "overdue";

const FILTERS: { value: RoutineFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "projects", label: "Projetos" },
  { value: "recurring", label: "Recorrentes" },
  { value: "pending", label: "Pendentes" },
  { value: "completed", label: "Concluídas" },
  { value: "overdue", label: "Atrasadas" },
];

type Props = {
  value: RoutineFilter;
  onChange: (value: RoutineFilter) => void;
};

/** Status filters only — filtering by tag lives in the sidebar. */
export default function FilterBar({ value, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Filtrar tarefas" className="flex flex-wrap gap-1.5">
      {FILTERS.map((filter) => {
        const selected = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(filter.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              selected
                ? "border-brand bg-brand-soft text-brand"
                : "border-border bg-surface text-foreground-secondary hover:border-border-strong"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
