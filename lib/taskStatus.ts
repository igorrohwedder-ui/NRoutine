import type { Priority, RoutineItem } from "./types";

/** "08:00:00" -> "08:00" */
export function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : null;
}

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

/**
 * A task is overdue when it isn't done yet and either:
 * - it has a scheduled time-of-day that already passed today (this app
 *   models a *daily* routine, so "today" is the only reference we have), or
 * - it has a due date that is strictly before today.
 */
export function isOverdue(item: Pick<RoutineItem, "done" | "time" | "due_date">, now: Date) {
  if (item.done) return false;

  if (item.time) {
    const [hours, minutes] = item.time.split(":").map(Number);
    const scheduledMinutes = hours * 60 + (minutes ?? 0);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes > scheduledMinutes) return true;
  }

  if (item.due_date) {
    const due = startOfDay(new Date(`${item.due_date}T00:00:00`));
    if (due < startOfDay(now)) return true;
  }

  return false;
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
