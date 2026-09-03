"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2, Plus, CalendarDays } from "lucide-react";
import type { Priority, Project, ProjectStatus, RoutineItem, Tag } from "@/lib/types";
import { computeProjectProgress, projectDeadlineStatus, PROJECT_STATUS_LABELS } from "@/lib/projects";
import { PRIORITY_LABELS, isOverdue } from "@/lib/taskStatus";
import { focusRing } from "./Sidebar";
import PriorityToggle from "./PriorityToggle";
import TaskItem, { type EditScope } from "./TaskItem";

type Edits = {
  title: string;
  tag_ids: string[];
  priority: Priority | null;
  due_date: string | null;
};

type ProjectEdits = Partial<
  Pick<Project, "name" | "description" | "status" | "priority" | "target_date" | "start_date" | "progress_override">
>;

type Props = {
  project: Project;
  tasks: RoutineItem[];
  now: Date;
  allTags: Tag[];
  onCreateTag: (name: string) => Promise<Tag | null>;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (id: string, edits: ProjectEdits) => void;
  onDelete: (id: string) => void;
  onAddTask: (projectId: string, title: string) => void;
  onToggleTask: (id: string, done: boolean) => void;
  onEditTask: (id: string, edits: Edits, scope: EditScope) => void;
  onDeleteTask: (id: string, scope: EditScope) => void;
};

const STATUS_TONES: Record<ProjectStatus, string> = {
  not_started: "border-border bg-surface-2 text-foreground-secondary",
  in_progress: "border-brand/30 bg-brand-soft text-brand",
  on_hold: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  completed: "border-success/30 bg-success-soft text-success",
  cancelled: "border-border bg-surface-2 text-foreground-muted",
};

const DEADLINE_TONES = {
  danger: "border-danger/30 bg-danger-soft text-danger",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  neutral: "border-border bg-surface-2 text-foreground-muted",
};

const PROJECT_STATUSES: ProjectStatus[] = ["not_started", "in_progress", "on_hold", "completed", "cancelled"];

const inputBase =
  "rounded-md border border-border bg-surface-2 text-foreground placeholder:text-foreground-muted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function ProjectCard({
  project,
  tasks,
  now,
  allTags,
  onCreateTag,
  expanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: Props) {
  const [editingInfo, setEditingInfo] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [descriptionDraft, setDescriptionDraft] = useState(project.description ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [manualProgress, setManualProgress] = useState(project.progress_override !== null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const progress = computeProjectProgress(project, tasks);
  const deadline = projectDeadlineStatus(project, now);
  const completedCount = tasks.filter((t) => t.done).length;

  function commitInfo() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setEditingInfo(false);
      return;
    }
    onUpdate(project.id, { name: trimmed, description: descriptionDraft.trim() || null });
    setEditingInfo(false);
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    onAddTask(project.id, trimmed);
    setNewTaskTitle("");
  }

  return (
    <div className="rounded-xl border border-border bg-surface transition hover:border-border-strong">
      <div className="group flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-label={expanded ? "Recolher projeto" : "Expandir projeto"}
          className={`mt-0.5 shrink-0 rounded-md p-0.5 text-foreground-muted hover:text-foreground ${focusRing}`}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          {editingInfo ? (
            <div className="flex flex-col gap-2">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                aria-label="Nome do projeto"
                className={`px-2 py-1 text-sm font-medium ${inputBase}`}
              />
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                rows={2}
                placeholder="Descrição"
                aria-label="Descrição do projeto"
                className={`resize-none px-2 py-1 text-xs ${inputBase}`}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={commitInfo}
                  className={`rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand/90 ${focusRing}`}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingInfo(false)}
                  className={`rounded-md px-3 py-1 text-xs font-medium text-foreground-secondary hover:bg-surface-2 ${focusRing}`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNameDraft(project.name);
                setDescriptionDraft(project.description ?? "");
                setEditingInfo(true);
              }}
              className={`flex w-full flex-col items-start gap-0.5 rounded-md text-left ${focusRing}`}
            >
              <span className="line-clamp-2 w-full break-words text-sm font-semibold text-foreground">{project.name}</span>
              {project.description && (
                <span className="line-clamp-1 w-full break-words text-xs text-foreground-secondary">{project.description}</span>
              )}
            </button>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_TONES[project.status]}`}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
            {project.priority && (
              <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-foreground-secondary">
                {PRIORITY_LABELS[project.priority]}
              </span>
            )}
            {deadline && (
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${DEADLINE_TONES[deadline.tone]}`}>
                {deadline.label}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-medium text-foreground-secondary">
              {tasks.length > 0 && (
                <span className="text-foreground-muted">
                  {completedCount}/{tasks.length} ·{" "}
                </span>
              )}
              {progress}%
            </span>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setConfirmingDelete((c) => !c)}
            aria-label={`Excluir projeto: ${project.name}`}
            className={`rounded-md p-1.5 text-foreground-muted opacity-0 transition hover:bg-danger-soft hover:text-danger group-hover:opacity-100 focus-visible:opacity-100 ${focusRing} ${confirmingDelete ? "!opacity-100" : ""}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
          {confirmingDelete && (
            <div className="absolute right-0 top-9 z-10 flex w-44 flex-col gap-1 rounded-lg border border-border bg-surface p-2 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  onDelete(project.id);
                }}
                className="rounded-md px-2 py-1.5 text-left text-xs text-danger hover:bg-danger-soft"
              >
                Excluir projeto
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md px-2 py-1.5 text-left text-xs text-foreground-muted hover:bg-surface-2"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-foreground-secondary">
              Status
              <select
                value={project.status}
                onChange={(e) => onUpdate(project.id, { status: e.target.value as ProjectStatus })}
                className={`px-2 py-1 text-xs ${inputBase}`}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
              <CalendarDays className="h-3.5 w-3.5 text-foreground-muted" aria-hidden="true" />
              Prazo
              <input
                type="date"
                value={project.target_date ?? ""}
                onChange={(e) => onUpdate(project.id, { target_date: e.target.value || null })}
                className={`px-2 py-1 text-xs ${inputBase}`}
              />
            </div>

            <PriorityToggle
              value={project.priority}
              onChange={(priority) => onUpdate(project.id, { priority })}
              compact
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-secondary">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={manualProgress}
                onChange={(e) => {
                  setManualProgress(e.target.checked);
                  if (!e.target.checked) onUpdate(project.id, { progress_override: null });
                  else onUpdate(project.id, { progress_override: progress });
                }}
              />
              Definir progresso manualmente
            </label>
            {manualProgress && (
              <input
                type="number"
                min={0}
                max={100}
                value={project.progress_override ?? 0}
                onChange={(e) =>
                  onUpdate(project.id, {
                    progress_override: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                className={`w-16 px-2 py-1 text-xs ${inputBase}`}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Tarefas do projeto
            </p>
            {tasks.length > 0 && (
              <ul className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    item={task}
                    overdue={isOverdue(task, now)}
                    allTags={allTags}
                    onCreateTag={onCreateTag}
                    onToggle={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </ul>
            )}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Adicionar tarefa ao projeto"
                aria-label="Nova tarefa do projeto"
                className={`flex-1 px-2 py-1.5 text-xs ${inputBase}`}
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className={`flex shrink-0 items-center gap-1 rounded-md bg-brand px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
