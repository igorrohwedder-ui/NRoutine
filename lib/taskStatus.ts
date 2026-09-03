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

/** A task scheduled for a day after today (and not done yet). */
export function isUpcoming(item: Pick<RoutineItem, "done" | "due_date">, now: Date) {
  if (item.done || !item.due_date) return false;
  const due = startOfDay(new Date(`${item.due_date}T00:00:00`));
  return due > startOfDay(now);
}

export type UpcomingGroups = {
  week: RoutineItem[];
  month: RoutineItem[];
  later: RoutineItem[];
};

/**
 * Buckets future-dated tasks by how far away they are:
 * - week:  tomorrow through today + 7 days
 * - month: day 8 through the end of the current month
 * - later: anything after that
 *
 * All boundaries are local calendar days (never UTC), matching isOverdue and
 * toDateString. When the 7-day window already runs past the end of the month
 * (e.g. today is the 28th), the "month" bucket is simply empty and everything
 * beyond the week falls into "later" — no double counting.
 */
export function groupUpcoming(items: RoutineItem[], now: Date): UpcomingGroups {
  const today = startOfDay(now);

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthBoundary = monthEnd > weekEnd ? monthEnd : weekEnd;

  const groups: UpcomingGroups = { week: [], month: [], later: [] };

  for (const item of items) {
    if (!item.due_date) continue;
    const due = startOfDay(new Date(`${item.due_date}T00:00:00`));
    if (due <= today) continue;
    if (due <= weekEnd) groups.week.push(item);
    else if (due <= monthBoundary) groups.month.push(item);
    else groups.later.push(item);
  }

  return groups;
}

/** "03/09 às 14:32" — local time, for the update log. */
export function formatUpdateTimestamp(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
