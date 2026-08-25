import type { RoutineItem } from "@/lib/types";
import TaskItem from "./TaskItem";

type Edits = {
  title: string;
  category: string | null;
  time: string | null;
};

type Props = {
  items: RoutineItem[];
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, edits: Edits) => void;
  onDelete: (id: string) => void;
};

const UNCATEGORIZED = "Sem categoria";

function sortItems(items: RoutineItem[]) {
  return [...items].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
}

export default function TaskList({ items, onToggle, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
        <span className="text-3xl">🌤️</span>
        <p className="text-sm font-medium text-slate-600">Nenhuma tarefa por aqui ainda</p>
        <p className="text-xs text-slate-400">Adicione a primeira tarefa do seu dia acima.</p>
      </div>
    );
  }

  const hasCategories = items.some((item) => item.category);

  if (!hasCategories) {
    return (
      <ul className="flex flex-col gap-2">
        {sortItems(items).map((item) => (
          <TaskItem key={item.id} item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    );
  }

  const groups = new Map<string, RoutineItem[]>();
  for (const item of items) {
    const key = item.category?.trim() || UNCATEGORIZED;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const orderedKeys = [...groups.keys()].sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return a.localeCompare(b, "pt-BR");
  });

  return (
    <div className="flex flex-col gap-5">
      {orderedKeys.map((key) => (
        <div key={key} className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{key}</h2>
          <ul className="flex flex-col gap-2">
            {sortItems(groups.get(key)!).map((item) => (
              <TaskItem key={item.id} item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
