"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  ListChecks,
  ClipboardList,
  Calendar,
  BarChart3,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Tag } from "@/lib/types";
import { tagDot } from "@/lib/tags";

type NavItem = {
  label: string;
  icon: LucideIcon;
  available: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Painel", icon: LayoutGrid, available: false },
  { label: "Minha Rotina", icon: ListChecks, available: true },
  { label: "Tarefas", icon: ClipboardList, available: false },
  { label: "Calendário", icon: Calendar, available: false },
  { label: "Relatórios", icon: BarChart3, available: false },
  { label: "Equipe", icon: Users, available: false },
  { label: "Configurações", icon: Settings, available: false },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const MAX_VISIBLE_TAGS = 8;

export type TagFilterProps = {
  tags: Tag[];
  /** Open (not done) task count per tag id. */
  tagCounts: Map<string, number>;
  activeTagId: string | null;
  onTagChange: (tagId: string | null) => void;
};

export function SidebarNav() {
  return (
    <nav aria-label="Navegação principal" className="space-y-0.5 px-3 py-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        if (item.available) {
          return (
            <Link
              key={item.label}
              href="/"
              aria-current="page"
              className={`flex items-center gap-3 rounded-lg bg-brand-soft px-3 py-2 text-sm font-medium text-foreground transition ${focusRing}`}
            >
              <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
              {item.label}
            </Link>
          );
        }
        return (
          <div
            key={item.label}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-foreground-muted"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="shrink-0 whitespace-nowrap rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium">
              em breve
            </span>
          </div>
        );
      })}
    </nav>
  );
}

/** Tag list with open-task counts, doubling as the tag filter. */
export function SidebarTags({ tags, tagCounts, activeTagId, onTagChange }: TagFilterProps) {
  const [showAll, setShowAll] = useState(false);

  if (tags.length === 0) return null;

  const sorted = [...tags].sort((a, b) => {
    const diff = (tagCounts.get(b.id) ?? 0) - (tagCounts.get(a.id) ?? 0);
    return diff !== 0 ? diff : a.name.localeCompare(b.name, "pt-BR");
  });
  const visible = showAll ? sorted : sorted.slice(0, MAX_VISIBLE_TAGS);

  return (
    <div className="border-t border-border px-3 py-3">
      <div className="flex items-center justify-between px-3 pb-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Tags</p>
        {activeTagId && (
          <button
            type="button"
            onClick={() => onTagChange(null)}
            className={`rounded text-[11px] font-medium text-brand hover:underline ${focusRing}`}
          >
            limpar
          </button>
        )}
      </div>

      <div className="space-y-0.5">
        {visible.map((tag) => {
          const selected = activeTagId === tag.id;
          const count = tagCounts.get(tag.id) ?? 0;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onTagChange(selected ? null : tag.id)}
              aria-pressed={selected}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                selected
                  ? "bg-brand-soft text-foreground"
                  : "text-foreground-secondary hover:bg-surface-2 hover:text-foreground"
              } ${focusRing}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${tagDot(tag.name)}`} aria-hidden="true" />
                <span className="truncate">{tag.name}</span>
              </span>
              <span className="shrink-0 text-xs text-foreground-muted">{count}</span>
            </button>
          );
        })}
      </div>

      {sorted.length > MAX_VISIBLE_TAGS && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className={`mt-1 rounded px-3 text-[11px] font-medium text-foreground-muted hover:text-foreground-secondary ${focusRing}`}
        >
          {showAll ? "ver menos" : `ver todas (${sorted.length})`}
        </button>
      )}
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
        N
      </div>
      <span className="text-sm font-semibold text-foreground">NRoutine</span>
    </div>
  );
}

/** Persistent desktop sidebar. Hidden on small screens in favor of the drawer. */
export default function Sidebar(props: TagFilterProps) {
  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface">
      <Brand />
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
        <SidebarTags {...props} />
      </div>
      <div className="border-t border-border px-5 py-4 text-xs text-foreground-muted">
        NewByte © {new Date().getFullYear()}
      </div>
    </aside>
  );
}

export { Brand, focusRing };
