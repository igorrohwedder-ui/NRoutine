"use client";

import { useState } from "react";
import type { RoutineItem } from "@/lib/types";

type Edits = {
  title: string;
  category: string | null;
  time: string | null;
};

type Props = {
  item: RoutineItem;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, edits: Edits) => void;
  onDelete: (id: string) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  "manhã": "bg-amber-50 text-amber-700",
  tarde: "bg-sky-50 text-sky-700",
  noite: "bg-indigo-50 text-indigo-700",
};

function categoryClass(category: string) {
  return CATEGORY_COLORS[category.trim().toLowerCase()] ?? "bg-slate-100 text-slate-600";
}

function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : null;
}

export default function TaskItem({ item, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [categoryDraft, setCategoryDraft] = useState(item.category ?? "");
  const [timeDraft, setTimeDraft] = useState(formatTime(item.time) ?? "");

  function startEdit() {
    setTitleDraft(item.title);
    setCategoryDraft(item.category ?? "");
    setTimeDraft(formatTime(item.time) ?? "");
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
    });
    setEditing(false);
  }

  const time = formatTime(item.time);

  return (
    <li className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => onToggle(item.id, !item.done)}
        aria-label={item.done ? "Marcar como pendente" : "Marcar como concluída"}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          item.done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 text-transparent hover:border-brand"
        }`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.4 7.4a1 1 0 01-1.42 0l-3.6-3.6a1 1 0 111.42-1.42l2.89 2.9 6.69-6.7a1 1 0 011.42 0z"
            clipRule="evenodd"
          />
        </svg>
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
              className="rounded-lg border border-brand/40 px-2 py-1 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand/20"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
                placeholder="Categoria"
                className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="time"
                value={timeDraft}
                onChange={(e) => setTimeDraft(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={commitEdit}
                className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={startEdit} className="flex w-full flex-col items-start gap-1 text-left">
            <span className={`truncate text-sm ${item.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
              {item.title}
            </span>
            {(item.category || time) && (
              <span className="flex flex-wrap items-center gap-1.5">
                {item.category && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryClass(item.category)}`}>
                    {item.category}
                  </span>
                )}
                {time && <span className="text-[11px] text-slate-400">{time}</span>}
              </span>
            )}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label="Excluir tarefa"
        className="shrink-0 rounded-full p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482 41.03 41.03 0 00-2.365-.298V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  );
}
