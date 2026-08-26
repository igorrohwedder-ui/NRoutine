import type { RoutineItem } from "./types";

/** "08:00:00" -> "08:00" */
export function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : null;
}

/**
 * A task is overdue when it has a scheduled time, isn't done yet, and that
 * time has already passed today. There's no due-date field in the schema —
 * this app models a *daily* routine, so "today" is the only meaningful
 * reference point we have.
 */
export function isOverdue(item: Pick<RoutineItem, "done" | "time">, now: Date) {
  if (item.done || !item.time) return false;
  const [hours, minutes] = item.time.split(":").map(Number);
  const scheduledMinutes = hours * 60 + (minutes ?? 0);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes > scheduledMinutes;
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
