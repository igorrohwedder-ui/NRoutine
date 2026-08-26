import { Sparkles } from "lucide-react";
import type { Priority, RoutineItem } from "@/lib/types";
import { isOverdue } from "@/lib/taskStatus";
import TaskItem from "./TaskItem";

type Edits = {
  title: string;
  category: string | null;
  time: string | null;
  priority: Priority | null;
  due_date: string | null;
};

type Props = {
  items: RoutineItem[];
  now: Date;
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

function taskCountLabel(count: number) {
  return count === 1 ? "1 tarefa" : `${count} tarefas`;
}

export default function TaskList({ items, now, onToggle, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
        <Sparkles className="h-6 w-6 text-foreground-muted" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Nenhuma tarefa por aqui ainda</p>
        <p className="text-xs text-foreground-muted">Adicione a primeira tarefa do seu dia acima.</p>
      </div>
    );
  }

  const renderItem = (item: RoutineItem) => (
    <TaskItem
      key={item.id}
      item={item}
      overdue={isOverdue(item, now)}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );

  const hasCategories = items.some((item) => item.category);

  if (!hasCategories) {
    return <ul className="flex flex-col gap-2">{sortItems(items).map(renderItem)}</ul>;
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
      {orderedKeys.map((key) => {
        const groupItems = groups.get(key)!;
        return (
          <div key={key} className="flex flex-col gap-2">
            <h2 className="flex items-baseline gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <span>{key}</span>
              <span className="font-normal normal-case tracking-normal text-foreground-muted/70">
                {taskCountLabel(groupItems.length)}
              </span>
            </h2>
            <ul className="flex flex-col gap-2">{sortItems(groupItems).map(renderItem)}</ul>
          </div>
        );
      })}
    </div>
  );
}
