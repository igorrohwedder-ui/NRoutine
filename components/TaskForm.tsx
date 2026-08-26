"use client";

import { useState } from "react";
import { Plus, Tag, Clock, ChevronDown, ArrowDown, Minus, ArrowUp, CalendarDays, type LucideIcon } from "lucide-react";
import type { Priority } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/taskStatus";
import { focusRing } from "./Sidebar";

type NewTask = {
  title: string;
  category: string | null;
  time: string | null;
  priority: Priority | null;
  due_date: string | null;
};

type Props = {
  onAdd: (task: NewTask) => Promise<void>;
};

const inputBase =
  "rounded-lg border border-border bg-surface-2 text-foreground placeholder:text-foreground-muted outline-none transition focus:border-brand";

const PRIORITIES: { value: Priority; icon: LucideIcon }[] = [
  { value: "low", icon: ArrowDown },
  { value: "medium", icon: Minus },
  { value: "high", icon: ArrowUp },
];

export default function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onAdd({
        title: trimmed,
        category: category.trim() || null,
        time: time || null,
        priority,
        due_date: dueDate || null,
      });
      setTitle("");
      setCategory("");
      setTime("");
      setPriority(null);
      setDueDate("");
      setShowDetails(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-3 sm:p-4">
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

          <div
            role="group"
            aria-label="Prioridade da tarefa"
            className="flex overflow-hidden rounded-lg border border-border"
          >
            {PRIORITIES.map(({ value, icon: Icon }) => {
              const selected = priority === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(selected ? null : value)}
                  aria-pressed={selected}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition ${
                    selected
                      ? "bg-brand text-white"
                      : "bg-surface-2 text-foreground-secondary hover:bg-surface"
                  } ${focusRing}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {PRIORITY_LABELS[value]}
                </button>
              );
            })}
          </div>

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
          Categoria, horário, prioridade, vencimento
        </button>
      )}
    </form>
  );
}
