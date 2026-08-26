"use client";

import { useState } from "react";
import { Plus, Tag, Clock, ChevronDown, CalendarDays } from "lucide-react";
import type { Priority, ProjectStatus } from "@/lib/types";
import { type RecurrenceDraft } from "@/lib/recurrence";
import { PROJECT_STATUS_LABELS } from "@/lib/projects";
import { focusRing } from "./Sidebar";
import PriorityToggle from "./PriorityToggle";
import RecurrencePicker from "./RecurrencePicker";

export type NewTask = {
  title: string;
  category: string | null;
  time: string | null;
  priority: Priority | null;
  due_date: string | null;
  recurrence: RecurrenceDraft | null;
};

export type NewProject = {
  name: string;
  description: string | null;
  start_date: string | null;
  target_date: string | null;
  priority: Priority | null;
  status: ProjectStatus;
};

type Props = {
  onAddTask: (task: NewTask) => Promise<void>;
  onAddProject: (project: NewProject) => Promise<void>;
};

const inputBase =
  "rounded-lg border border-border bg-surface-2 text-foreground placeholder:text-foreground-muted outline-none transition focus:border-brand";

const PROJECT_STATUSES: ProjectStatus[] = ["not_started", "in_progress", "on_hold", "completed", "cancelled"];

export default function TaskForm({ onAddTask, onAddProject }: Props) {
  const [mode, setMode] = useState<"task" | "project">("task");

  // Task fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceDraft | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Project fields
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [projectPriority, setProjectPriority] = useState<Priority | null>(null);
  const [status, setStatus] = useState<ProjectStatus>("not_started");

  const [submitting, setSubmitting] = useState(false);

  function resetTask() {
    setTitle("");
    setCategory("");
    setTime("");
    setPriority(null);
    setDueDate("");
    setRecurrence(null);
    setShowDetails(false);
  }

  function resetProject() {
    setProjectName("");
    setDescription("");
    setStartDate("");
    setTargetDate("");
    setProjectPriority(null);
    setStatus("not_started");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (mode === "task") {
      const trimmed = title.trim();
      if (!trimmed) return;
      setSubmitting(true);
      try {
        await onAddTask({
          title: trimmed,
          category: category.trim() || null,
          time: time || null,
          priority,
          due_date: dueDate || null,
          recurrence,
        });
        resetTask();
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const trimmedName = projectName.trim();
    if (!trimmedName) return;
    setSubmitting(true);
    try {
      await onAddProject({
        name: trimmedName,
        description: description.trim() || null,
        start_date: startDate || null,
        target_date: targetDate || null,
        priority: projectPriority,
        status,
      });
      resetProject();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-3 sm:p-4">
      <div role="tablist" aria-label="Tipo de item" className="mb-3 flex w-fit overflow-hidden rounded-lg border border-border">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "task"}
          onClick={() => setMode("task")}
          className={`px-3 py-1.5 text-xs font-medium transition ${
            mode === "task" ? "bg-brand text-white" : "bg-surface-2 text-foreground-secondary hover:bg-surface"
          }`}
        >
          Tarefa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "project"}
          onClick={() => setMode("project")}
          className={`px-3 py-1.5 text-xs font-medium transition ${
            mode === "project" ? "bg-brand text-white" : "bg-surface-2 text-foreground-secondary hover:bg-surface"
          }`}
        >
          Projeto
        </button>
      </div>

      {mode === "task" ? (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que você precisa fazer hoje?"
              aria-label="Título da nova tarefa"
              className={`flex-1 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 ${inputBase}`}
            />
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>

          {showDetails ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <div className="relative">
                <Tag className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Categoria (ex: Manhã, Trabalho)"
                  aria-label="Categoria da tarefa"
                  className={`w-48 py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-brand/30 ${inputBase}`}
                />
              </div>

              <div className="relative">
                <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-label="Horário da tarefa"
                  className={`py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-brand/30 ${inputBase}`}
                />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  aria-label="Data de vencimento"
                  className={`py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-brand/30 ${inputBase}`}
                />
              </div>

              <PriorityToggle value={priority} onChange={setPriority} />

              <RecurrencePicker
                value={recurrence}
                onChange={setRecurrence}
                referenceDate={dueDate ? new Date(`${dueDate}T00:00:00`) : new Date()}
              />

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className={`rounded-md px-2 py-1 text-xs font-medium text-foreground-muted hover:text-foreground-secondary ${focusRing}`}
              >
                ocultar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className={`mt-2 flex items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium text-foreground-secondary hover:text-foreground ${focusRing}`}
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              Categoria, horário, prioridade, vencimento, repetição
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nome do projeto"
              aria-label="Nome do projeto"
              className={`flex-1 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand/30 ${inputBase}`}
            />
            <button
              type="submit"
              disabled={!projectName.trim() || submitting}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Criar</span>
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            aria-label="Descrição do projeto"
            rows={2}
            className={`w-full resize-none px-3 py-2 text-sm focus:ring-2 focus:ring-brand/30 ${inputBase}`}
          />

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-foreground-secondary">
              Início
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`px-2 py-1.5 text-xs ${inputBase}`}
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-foreground-secondary">
              Prazo
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={`px-2 py-1.5 text-xs ${inputBase}`}
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-foreground-secondary">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className={`px-2 py-1.5 text-xs ${inputBase}`}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <PriorityToggle value={projectPriority} onChange={setProjectPriority} />
          </div>
        </div>
      )}
    </form>
  );
}
