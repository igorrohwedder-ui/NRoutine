import type { Project, ProjectStatus, RoutineItem } from "./types";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  on_hold: "Em espera",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export function computeProjectProgress(
  project: Pick<Project, "progress_override">,
  tasks: Pick<RoutineItem, "done">[],
): number {
  if (project.progress_override !== null && project.progress_override !== undefined) {
    return project.progress_override;
  }
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);
}

export type DeadlineStatus = { label: string; tone: "danger" | "warning" | "neutral" };

export function projectDeadlineStatus(
  project: Pick<Project, "target_date" | "status">,
  now: Date,
): DeadlineStatus | null {
  if (!project.target_date) return null;
  if (project.status === "completed" || project.status === "cancelled") return null;

  const target = new Date(`${project.target_date}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((targetDay.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return { label: `Atrasado há ${days} dia${days === 1 ? "" : "s"}`, tone: "danger" };
  }
  if (diffDays === 0) return { label: "Vence hoje", tone: "warning" };
  if (diffDays <= 7) return { label: `Vence em ${diffDays} dia${diffDays === 1 ? "" : "s"}`, tone: "warning" };
  return { label: `Vence em ${diffDays} dias`, tone: "neutral" };
}
