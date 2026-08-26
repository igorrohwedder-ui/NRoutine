import type { Priority, RoutineItem } from "./types";

export function formatDueDate(dueDate: string | null) {
  if (!dueDate) return null;
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** A task is overdue when it isn't done yet and its due date is strictly before today. */
export function isOverdue(item: Pick<RoutineItem, "done" | "due_date">, now: Date) {
  if (item.done || !item.due_date) return false;
  const due = startOfDay(new Date(`${item.due_date}T00:00:00`));
  return due < startOfDay(now);
}

export type RoutineStats = {
  total: number;
  completed: number;
  overdue: number;
  pending: number;
  progress: number;
};

export function computeStats(items: RoutineItem[], now: Date): RoutineStats {
  const total = items.length;
  const completed = items.filter((item) => item.done).length;
  const overdue = items.filter((item) => isOverdue(item, now)).length;
  const pending = total - completed - overdue;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, overdue, pending, progress };
}
