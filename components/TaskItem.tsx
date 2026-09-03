"use client";

import { useState } from "react";
import { Check, Trash2, AlertTriangle, CalendarDays, Repeat, MessageSquare, Plus } from "lucide-react";
import type { Priority, RoutineItem, RoutineItemUpdate, Tag } from "@/lib/types";
import { formatDueDate, formatUpdateTimestamp, PRIORITY_LABELS } from "@/lib/taskStatus";
import { tagTone } from "@/lib/tags";
import { focusRing } from "./Sidebar";
import PriorityToggle from "./PriorityToggle";
import TagPicker from "./TagPicker";

export type EditScope = "occurrence" | "series";

type Edits = {
  title: string;
  description: string | null;
  tag_ids: string[];
  priority: Priority | null;
  due_date: string | null;
};

type Props = {
  item: RoutineItem;
  overdue: boolean;
  allTags: Tag[];
  onCreateTag: (name: string) => Promise<Tag | null>;
  /** Newest first. */
  updates: RoutineItemUpdate[];
  onAddUpdate: (taskId: string, text: string) => Promise<void>;
  onDeleteUpdate: (taskId: string, updateId: string) => Promise<void>;
  /** Human-readable recurrence summary, when this occurrence belongs to a series. */
  recurrenceLabel?: string | null;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, edits: Edits, scope: EditScope) => void;
  onDelete: (id: string, scope: EditScope) => void;
};

const PRIORITY_TONES: Record<Priority, string> = {
  low: "border-border bg-surface-2 text-foreground-muted",
  medium: "border-border bg-surface-2 text-foreground-secondary",
  high: "border-danger/30 bg-danger-soft text-danger",
};

const inputBase =
  "rounded-md border border-border bg-surface-2 text-foreground placeholder:text-foreground-muted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function TaskItem({
  item,
  overdue,
  allTags,
  onCreateTag,
  updates,
  onAddUpdate,
  onDeleteUpdate,
  recurrenceLabel,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [descriptionDraft, setDescriptionDraft] = useState(item.description ?? "");
  const [tagIdsDraft, setTagIdsDraft] = useState<string[]>(item.tag_ids);
  const [priorityDraft, setPriorityDraft] = useState<Priority | null>(item.priority);
  const [dueDateDraft, setDueDateDraft] = useState(item.due_date ?? "");
  const [updateDraft, setUpdateDraft] = useState("");
  const [savingUpdate, setSavingUpdate] = useState(false);

  const isRecurring = Boolean(item.recurrence_id);
  const itemTags = allTags.filter((tag) => item.tag_ids.includes(tag.id));

  function startEdit() {
    setTitleDraft(item.title);
    setDescriptionDraft(item.description ?? "");
    setTagIdsDraft(item.tag_ids);
    setPriorityDraft(item.priority);
    setDueDateDraft(item.due_date ?? "");
    setEditing(true);
  }

  function commitEdit(scope: EditScope) {
    const trimmedTitle = titleDraft.trim();
    if (!trimmedTitle) {
      setEditing(false);
      return;
    }
    onEdit(
      item.id,
      {
        title: trimmedTitle,
        description: descriptionDraft.trim() || null,
        tag_ids: tagIdsDraft,
        priority: priorityDraft,
        due_date: dueDateDraft || null,
      },
      scope,
    );
    setEditing(false);
  }

  /** Updates are append-only and save immediately — they don't wait for "Salvar". */
  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    const text = updateDraft.trim();
    if (!text || savingUpdate) return;

    setSavingUpdate(true);
    try {
      await onAddUpdate(item.id, text);
      setUpdateDraft("");
    } finally {
      setSavingUpdate(false);
    }
  }

  const dueDate = formatDueDate(item.due_date);
  const hasMeta = Boolean(dueDate || item.priority || overdue || recurrenceLabel || updates.length > 0);

  return (
    <li
      className={`group relative flex items-start gap-3 rounded-xl border bg-surface px-4 py-3 transition ${
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
                if (e.key === "Enter" && !isRecurring) commitEdit("occurrence");
                if (e.key === "Escape") setEditing(false);
              }}
              aria-label="Editar título da tarefa"
              className={`px-2 py-1 text-sm ${inputBase}`}
            />

            <textarea
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              rows={3}
              placeholder="Descrição — detalhes do que precisa ser feito"
              aria-label="Descrição da tarefa"
              className={`resize-y px-2 py-1 text-xs ${inputBase}`}
            />

            <TagPicker allTags={allTags} selectedIds={tagIdsDraft} onChange={setTagIdsDraft} onCreateTag={onCreateTag} />

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={dueDateDraft}
                onChange={(e) => setDueDateDraft(e.target.value)}
                aria-label="Editar data de vencimento"
                className={`px-2 py-1 text-xs ${inputBase}`}
              />
              <PriorityToggle value={priorityDraft} onChange={setPriorityDraft} compact />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isRecurring ? (
                <>
                  <button
                    type="button"
                    onClick={() => commitEdit("occurrence")}
                    className={`rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand/90 ${focusRing}`}
                  >
                    Salvar apenas esta
                  </button>
                  <button
                    type="button"
                    onClick={() => commitEdit("series")}
                    className={`rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground-secondary hover:bg-surface-2 ${focusRing}`}
                  >
                    Salvar toda a série
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => commitEdit("occurrence")}
                  className={`rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand/90 ${focusRing}`}
                >
                  Salvar
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditing(false)}
                className={`rounded-md px-3 py-1 text-xs font-medium text-foreground-secondary hover:bg-surface-2 ${focusRing}`}
              >
                Cancelar
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                Atualizações
              </p>

              <form onSubmit={handleAddUpdate} className="flex gap-2">
                <input
                  value={updateDraft}
                  onChange={(e) => setUpdateDraft(e.target.value)}
                  placeholder="Registrar uma atualização"
                  aria-label="Nova atualização"
                  className={`flex-1 px-2 py-1 text-xs ${inputBase}`}
                />
                <button
                  type="submit"
                  disabled={!updateDraft.trim() || savingUpdate}
                  className={`flex shrink-0 items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  Adicionar
                </button>
              </form>

              {updates.length === 0 ? (
                <p className="text-[11px] text-foreground-muted">
                  Nenhuma atualização ainda. As anotações ficam registradas aqui, com data e hora.
                </p>
              ) : (
                <ol className="flex flex-col gap-1.5">
                  {updates.map((update) => (
                    <li
                      key={update.id}
                      className="group/update flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap break-words text-xs text-foreground">{update.text}</p>
                        <p className="mt-0.5 text-[11px] text-foreground-muted">
                          {formatUpdateTimestamp(update.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteUpdate(item.id, update.id)}
                        aria-label={`Excluir atualização de ${formatUpdateTimestamp(update.created_at)}`}
                        className={`shrink-0 rounded p-1 text-foreground-muted opacity-0 transition hover:bg-danger-soft hover:text-danger group-hover/update:opacity-100 focus-visible:opacity-100 ${focusRing}`}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Abrir tarefa: ${item.title}`}
            className={`flex w-full flex-col items-start gap-1.5 rounded-md text-left ${focusRing}`}
          >
            {itemTags.length > 0 && (
              <span className="flex flex-wrap items-center gap-1">
                {itemTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${tagTone(tag.name)}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </span>
            )}

            <span
              className={`line-clamp-3 w-full break-words text-sm ${
                item.done ? "text-foreground-secondary line-through" : "text-foreground"
              }`}
            >
              {item.title}
            </span>

            {item.description && (
              <span className="line-clamp-2 w-full break-words text-xs text-foreground-secondary">
                {item.description}
              </span>
            )}

            {hasMeta && (
              <span className="flex flex-wrap items-center gap-1.5">
                {overdue && (
                  <span className="flex items-center gap-1 rounded-full border border-danger/30 bg-danger-soft px-2 py-0.5 text-[11px] font-medium text-danger">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    Atrasada
                  </span>
                )}
                {recurrenceLabel && (
                  <span className="flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-foreground-secondary">
                    <Repeat className="h-3 w-3" aria-hidden="true" />
                    {recurrenceLabel}
                  </span>
                )}
                {item.priority && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_TONES[item.priority]}`}
                  >
                    {PRIORITY_LABELS[item.priority]}
                  </span>
                )}
                {dueDate && (
                  <span className="flex items-center gap-1 text-[11px] text-foreground-muted">
                    <CalendarDays className="h-3 w-3" aria-hidden="true" />
                    {dueDate}
                  </span>
                )}
                {updates.length > 0 && (
                  <span
                    className="flex items-center gap-1 text-[11px] text-foreground-muted"
                    aria-label={`${updates.length} ${updates.length === 1 ? "atualização" : "atualizações"}`}
                  >
                    <MessageSquare className="h-3 w-3" aria-hidden="true" />
                    {updates.length}
                  </span>
                )}
              </span>
            )}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => (isRecurring ? setConfirmingDelete((c) => !c) : onDelete(item.id, "occurrence"))}
        aria-label={`Excluir tarefa: ${item.title}`}
        aria-expanded={isRecurring ? confirmingDelete : undefined}
        className={`shrink-0 rounded-md p-1.5 text-foreground-muted opacity-0 transition hover:bg-danger-soft hover:text-danger group-hover:opacity-100 group-focus-within:opacity-100 ${focusRing} ${
          confirmingDelete ? "!opacity-100 bg-danger-soft text-danger" : ""
        }`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {confirmingDelete && (
        <div className="absolute right-2 top-11 z-10 flex w-52 flex-col gap-1 rounded-lg border border-border bg-surface p-2 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setConfirmingDelete(false);
              onDelete(item.id, "occurrence");
            }}
            className="rounded-md px-2 py-1.5 text-left text-xs text-foreground hover:bg-surface-2"
          >
            Excluir esta ocorrência
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmingDelete(false);
              onDelete(item.id, "series");
            }}
            className="rounded-md px-2 py-1.5 text-left text-xs text-danger hover:bg-danger-soft"
          >
            Encerrar série
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
    </li>
  );
}
