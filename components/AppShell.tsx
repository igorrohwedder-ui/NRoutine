"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import Sidebar, { Brand, SidebarNav, focusRing } from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <Sidebar />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative flex h-full w-64 flex-col border-r border-border bg-surface">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className={`rounded-md p-2 text-foreground-secondary hover:bg-surface-2 ${focusRing}`}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
              N
            </div>
            <span className="text-sm font-semibold text-foreground">NRoutine</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className={`rounded-md p-2 text-foreground-secondary hover:bg-surface-2 ${focusRing}`}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
