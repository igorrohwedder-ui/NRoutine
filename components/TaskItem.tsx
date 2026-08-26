"use client";

import { useState } from "react";
import { Check, Trash2, Tag, Clock, AlertTriangle, CalendarDays, ArrowDown, Minus, ArrowUp, type LucideIcon } from "lucide-react";
import type { Priority, RoutineItem } from "@/lib/types";
import { formatTime, formatDueDate, PRIORITY_LABELS } from "@/lib/taskStatus";
import { focusRing } from "./Sidebar";

type Edits = {
  title: string;
  category: string | null;
  time: string | null;
  priority: Priority | null;
  due_date: string | null;
};

type Props = {
  item: RoutineItem;
  overdue: boolean;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, edits: Edits) => void;
  onDelete: (id: string) => void;
};

const CATEGORY_TONES: Record<string, string> = {
  "manhã": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  tarde: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  noite: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
};

function categoryTone(category: string) {
  return CATEGORY_TONES[category.trim().toLowerCase()] ?? "border-border bg-surface-2 text-foreground-secondary";
}

const PRIORITY_ICONS: Record<Priority, LucideIcon> = { low: ArrowDown, medium: Minus, high: ArrowUp };

const PRIORITY_TONES: Record<Priority, string> = {
  low: "border-border bg-surface-2 text-foreground-muted",
  medium: "border-border bg-surface-2 text-foreground-secondary",
  high: "border-danger/30 bg-danger-soft text-danger",
};

const PRIORITIES: Priority[] = ["low", "medium", "high"];

const inputBase =
  "rounded-md border border-border bg-surface-2 text-foreground placeholder:text-foreground-muted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function TaskItem({ item, overdue, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [categoryDraft, setCategoryDraft] = useState(item.category ?? "");
  const [timeDraft, setTimeDraft] = useState(formatTime(item.time) ?? "");
  const [priorityDraft, setPriorityDraft] = useState<Priority | null>(item.priority);
  const [dueDateDraft, setDueDateDraft] = useState(item.due_date ?? "");

  function startEdit() {
    setTitleDraft(item.title);
    setCategoryDraft(item.category ?? "");
    setTimeDraft(formatTime(item.time) ?? "");
    setPriorityDraft(item.priority);
    setDueDateDraft(item.due_date ?? "");
    setEditing(true);
  }

  function commitEdit() {
    const trimmedTitle = titleDraft.trim();
    if (!trimmedTitle) {
      setEditing(false);
      return;
    }
    onEdit(item.id, {
      title: trimmedTitle,
      category: categoryDraft.trim() || null,
      time: timeDraft || null,
      priority: priorityDraft,
      due_date: dueDateDraft || null,
    });
    setEditing(false);
  }

  const time = formatTime(item.time);
  const dueDate = formatDueDate(item.due_date);

  return (
    <li
      className={`group flex items-start gap-3 rounded-xl border bg-surface px-4 py-3 transition ${
        overdue ? "border-danger/30" : "border-border hover:border-border-strong"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id, !item.done)}
        aria-label={item.done ? "Marcar como pendente" : "Marcar como concluída"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          item.done
            ? "border-success bg-success text-surface"
            : "border-border-strong text-transparent hover:border-brand"
        } ${focusRing}`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              aria-label="Editar título da tarefa"
              className={`px-2 py-1 text-sm ${inputBase}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
                placeholder="Categoria"
                aria-label="Editar categoria"
                className={`w-28 px-2 py-1 text-xs ${inputBase}`}
              />
              <input
                type="time"
                value={timeDraft}
                onChange={(e) => setTimeDraft(e.target.value)}
                aria-label="Editar horário"
                className={`px-2 py-1 text-xs ${inputBase}`}
              />
              <input
                type="date"
                value={dueDateDraft}
                onChange={(e) => setDueDateDraft(e.target.value)}
                aria-label="Editar data de vencimento"
                className={`px-2 py-1 text-xs ${inputBase}`}
              />
              <div
                role="group"
                aria-label="Editar prioridade"
                className="flex overflow-hidden rounded-md border border-border"
              >
                {PRIORITIES.map((value) => {
                  const Icon = PRIORITY_ICONS[value];
                  const selected = priorityDraft === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPriorityDraft(selected ? null : value)}
                      aria-pressed={selected}
                      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition ${
                        selected ? "bg-brand text-white" : "bg-surface-2 text-foreground-secondary hover:bg-surface"
                      } ${focusRing}`}
                    >
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={commitEdit}
                className={`rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand/90 ${focusRing}`}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className={`rounded-md px-3 py-1 text-xs font-medium text-foreground-secondary hover:bg-surface-2 ${focusRing}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Editar tarefa: ${item.title}`}
            className={`flex w-full flex-col items-start gap-1.5 rounded-md text-left ${focusRing}`}
          >
            <span
              className={`truncate text-sm ${
                item.done ? "text-foreground-secondary line-through" : "text-foreground"
              }`}
            >
              {item.title}
            </span>
            {(item.category || time || dueDate || item.priority || overdue) && (
              <span className="flex flex-wrap items-center gap-1.5">
                {overdue && (
                  <span className="flex items-center gap-1 rounded-full border border-danger/30 bg-danger-soft px-2 py-0.5 text-[11px] font-medium text-danger">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    Atrasada
                  </span>
                )}
                {item.priority && (
                  <span
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_TONES[item.priority]}`}
                  >
                    {(() => {
                      const Icon = PRIORITY_ICONS[item.priority];
                      return <Icon className="h-3 w-3" aria-hidden="true" />;
                    })()}
                    {PRIORITY_LABELS[item.priority]}
                  </span>
                )}
                {item.category && (
                  <span
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${categoryTone(item.category)}`}
                  >
                    <Tag className="h-3 w-3" aria-hidden="true" />
                    {item.category}
                  </span>
                )}
                {time && (
                  <span className="flex items-center gap-1 text-[11px] text-foreground-muted">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {time}
                  </span>
                )}
                {dueDate && (
                  <span className="flex items-center gap-1 text-[11px] text-foreground-muted">
                    <CalendarDays className="h-3 w-3" aria-hidden="true" />
                    {dueDate}
                  </span>
                )}
              </span>
            )}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label={`Excluir tarefa: ${item.title}`}
        className={`shrink-0 rounded-md p-1.5 text-foreground-muted opacity-0 transition hover:bg-danger-soft hover:text-danger group-hover:opacity-100 group-focus-within:opacity-100 ${focusRing}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}
