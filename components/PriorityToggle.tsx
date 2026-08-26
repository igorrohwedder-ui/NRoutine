"use client";

import { ArrowDown, Minus, ArrowUp, type LucideIcon } from "lucide-react";
import type { Priority } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/taskStatus";
import { focusRing } from "./Sidebar";

const ICONS: Record<Priority, LucideIcon> = { low: ArrowDown, medium: Minus, high: ArrowUp };
const ORDER: Priority[] = ["low", "medium", "high"];

type Props = {
  value: Priority | null;
  onChange: (value: Priority | null) => void;
  compact?: boolean;
};

export default function PriorityToggle({ value, onChange, compact = false }: Props) {
  return (
    <div role="group" aria-label="Prioridade" className="flex overflow-hidden rounded-lg border border-border">
      {ORDER.map((p) => {
        const Icon = ICONS[p];
        const selected = value === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(selected ? null : p)}
            aria-pressed={selected}
            aria-label={PRIORITY_LABELS[p]}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition ${
              selected ? "bg-brand text-white" : "bg-surface-2 text-foreground-secondary hover:bg-surface"
            } ${focusRing}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {!compact && PRIORITY_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
