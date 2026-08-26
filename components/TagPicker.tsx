"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Tag } from "@/lib/types";
import { findExistingTag } from "@/lib/tags";
import { focusRing } from "./Sidebar";

type Props = {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Persists a brand-new tag and returns it (or an existing match, if the name already exists). */
  onCreateTag: (name: string) => Promise<Tag | null>;
};

export default function TagPicker({ allTags, selectedIds, onChange, onCreateTag }: Props) {
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  }

  async function handleCreate() {
    const name = draft.trim();
    if (!name || creating) return;

    const existing = findExistingTag(allTags, name);
    if (existing) {
      if (!selectedIds.includes(existing.id)) onChange([...selectedIds, existing.id]);
      setDraft("");
      return;
    }

    setCreating(true);
    try {
      const tag = await onCreateTag(name);
      if (tag) onChange([...selectedIds, tag.id]);
      setDraft("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allTags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            aria-pressed={selected}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              selected ? "bg-brand text-white" : "bg-surface-2 text-foreground-secondary hover:bg-surface"
            } ${focusRing}`}
          >
            {tag.name}
          </button>
        );
      })}

      <div className="flex items-center gap-1">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder="+ nova tag"
          aria-label="Criar nova tag"
          className={`w-24 rounded-full border border-dashed border-border bg-surface-2 px-2.5 py-1 text-xs text-foreground placeholder:text-foreground-muted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 ${focusRing}`}
        />
        {draft.trim() && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            aria-label="Adicionar tag"
            className={`rounded-full bg-brand p-1 text-white hover:bg-brand/90 disabled:opacity-50 ${focusRing}`}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
