"use client";

import { useState } from "react";

type NewTask = {
  title: string;
  category: string | null;
  time: string | null;
};

type Props = {
  onAdd: (task: NewTask) => Promise<void>;
};

export default function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [time, setTime] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onAdd({ title: trimmed, category: category.trim() || null, time: time || null });
      setTitle("");
      setCategory("");
      setTime("");
      setShowDetails(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O que você precisa fazer hoje?"
          className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="shrink-0 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      {showDetails ? (
        <div className="flex flex-wrap items-center gap-2 pl-1">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Categoria (ex: Manhã, Trabalho)"
            className="w-48 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            onClick={() => setShowDetails(false)}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            ocultar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="self-start pl-1 text-xs font-medium text-brand hover:underline"
        >
          + categoria / horário
        </button>
      )}
    </form>
  );
}
