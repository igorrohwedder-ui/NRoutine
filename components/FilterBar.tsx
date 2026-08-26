import type { Tag } from "@/lib/types";

export type RoutineFilter = "all" | "projects" | "recurring" | "completed" | "pending" | "overdue";

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
  tags: Tag[];
  activeTagId: string | null;
  onTagChange: (tagId: string | null) => void;
};

export default function FilterBar({ value, onChange, tags, activeTagId, onTagChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
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

      {tags.length > 0 && (
        <div role="tablist" aria-label="Filtrar por tag" className="flex flex-wrap gap-1.5">
          <button
            type="button"
            role="tab"
            aria-selected={activeTagId === null}
            onClick={() => onTagChange(null)}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
              activeTagId === null
                ? "bg-foreground text-background"
                : "bg-surface-2 text-foreground-muted hover:text-foreground-secondary"
            }`}
          >
            Todas as tags
          </button>
          {tags.map((tag) => {
            const selected = activeTagId === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onTagChange(selected ? null : tag.id)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                  selected
                    ? "bg-foreground text-background"
                    : "bg-surface-2 text-foreground-muted hover:text-foreground-secondary"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
