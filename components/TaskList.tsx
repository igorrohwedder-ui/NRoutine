import { Sparkles } from "lucide-react";
import type { Priority, RoutineItemUpdate, Recurrence, RoutineItem, Tag } from "@/lib/types";
import { isOverdue } from "@/lib/taskStatus";
import { describeRecurrence } from "@/lib/recurrence";
import TaskItem, { type EditScope } from "./TaskItem";

type Edits = {
  title: string;
  description: string | null;
  tag_ids: string[];
  priority: Priority | null;
  due_date: string | null;
};

type Props = {
  items: RoutineItem[];
  now: Date;
  /** Used to show a recurrence badge on items that belong to a series. */
  recurrences: Map<string, Recurrence>;
  allTags: Tag[];
  onCreateTag: (name: string) => Promise<Tag | null>;
  updatesByItem: Map<string, RoutineItemUpdate[]>;
  onAddUpdate: (taskId: string, text: string) => Promise<void>;
  emptyMessage?: string;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, edits: Edits, scope: EditScope) => void;
  onDelete: (id: string, scope: EditScope) => void;
};

function sortItems(items: RoutineItem[]) {
  return [...items].sort((a, b) => {
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
}

export default function TaskList({
  items,
  now,
  recurrences,
  allTags,
  onCreateTag,
  updatesByItem,
  onAddUpdate,
  emptyMessage,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
        <Sparkles className="h-6 w-6 text-foreground-muted" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">
          {emptyMessage ?? "Nenhuma tarefa por aqui ainda"}
        </p>
        <p className="text-xs text-foreground-muted">Adicione a primeira tarefa do seu dia acima.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sortItems(items).map((item) => {
        const rule = item.recurrence_id ? recurrences.get(item.recurrence_id) : undefined;
        return (
          <TaskItem
            key={item.id}
            item={item}
            overdue={isOverdue(item, now)}
            allTags={allTags}
            onCreateTag={onCreateTag}
            updates={updatesByItem.get(item.id) ?? []}
            onAddUpdate={onAddUpdate}
            recurrenceLabel={rule ? describeRecurrence(rule) : null}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </ul>
  );
}
