"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RoutineItem } from "@/lib/types";
import { computeStats } from "@/lib/taskStatus";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import StatsRow from "@/components/StatsRow";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";

export default function Home() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Keeps "overdue" detection fresh without requiring a page reload.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function loadItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("routine_items")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setItems(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;

    supabase
      .from("routine_items")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          setError(error.message);
        } else {
          setError(null);
          setItems(data ?? []);
        }
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleAdd(task: { title: string; category: string | null; time: string | null }) {
    const { data, error } = await supabase.from("routine_items").insert(task).select().single();

    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => [...prev, data]);
  }

  async function handleToggle(id: string, done: boolean) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done } : item)));
    const { error } = await supabase.from("routine_items").update({ done }).eq("id", id);
    if (error) {
      setError(error.message);
      loadItems();
    }
  }

  async function handleEdit(
    id: string,
    edits: { title: string; category: string | null; time: string | null },
  ) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...edits } : item)));
    const { error } = await supabase.from("routine_items").update(edits).eq("id", id);
    if (error) {
      setError(error.message);
      loadItems();
    }
  }

  async function handleDelete(id: string) {
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));
    const { error } = await supabase.from("routine_items").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setItems(previous);
    }
  }

  const stats = computeStats(items, now);

  return (
    <AppShell>
      <PageHeader stats={stats} />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        {stats.total > 0 && <StatsRow stats={stats} />}

        <TaskForm onAdd={handleAdd} />

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando tarefas...</p>
        ) : (
          <TaskList
            items={items}
            now={now}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppShell>
  );
}
