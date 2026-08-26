"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";
import type { Priority, Project, RoutineItem } from "@/lib/types";
import { projectDeadlineStatus } from "@/lib/projects";
import ProjectCard from "./ProjectCard";
import type { EditScope } from "./TaskItem";

type Edits = {
  title: string;
  category: string | null;
  time: string | null;
  priority: Priority | null;
  due_date: string | null;
};

type ProjectEdits = Partial<
  Pick<Project, "name" | "description" | "status" | "priority" | "target_date" | "start_date" | "progress_override">
>;

type Props = {
  projects: Project[];
  tasksByProject: Map<string, RoutineItem[]>;
  now: Date;
  onUpdate: (id: string, edits: ProjectEdits) => void;
  onDelete: (id: string) => void;
  onAddTask: (projectId: string, title: string) => void;
  onToggleTask: (id: string, done: boolean) => void;
  onEditTask: (id: string, edits: Edits, scope: EditScope) => void;
  onDeleteTask: (id: string, scope: EditScope) => void;
};

export default function ProjectsSection({
  projects,
  tasksByProject,
  now,
  onUpdate,
  onDelete,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
        <FolderKanban className="h-5 w-5 text-foreground-muted" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Nenhum projeto ativo</p>
        <p className="text-xs text-foreground-muted">
          Crie um projeto acima para acompanhar iniciativas de médio/longo prazo.
        </p>
      </div>
    );
  }

  const dueThisWeek = projects.filter((p) => {
    const status = projectDeadlineStatus(p, now);
    return status && (status.tone === "warning" || status.tone === "danger");
  }).length;

  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-xs text-foreground-muted">
        {projects.length === 1 ? "1 projeto" : `${projects.length} projetos`}
        {dueThisWeek > 0 && ` · ${dueThisWeek} com prazo próximo ou vencido`}
      </p>
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            tasks={tasksByProject.get(project.id) ?? []}
            now={now}
            expanded={expandedIds.has(project.id)}
            onToggleExpand={() => toggleExpand(project.id)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
