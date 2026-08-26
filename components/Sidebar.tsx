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

export function SidebarNav() {
  return (
    <nav aria-label="Navegação principal" className="flex-1 space-y-0.5 px-3 py-2">
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
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </span>
            <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium">
              em breve
            </span>
          </div>
        );
      })}
    </nav>
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

/** Persistent desktop sidebar. Hidden on small screens in favor of MobileNav. */
export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface">
      <Brand />
      <SidebarNav />
      <div className="border-t border-border px-5 py-4 text-xs text-foreground-muted">
        NewByte © {new Date().getFullYear()}
      </div>
    </aside>
  );
}

export { Brand, focusRing };
