"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Priority, Project, Recurrence, RoutineItem } from "@/lib/types";
import { computeStats, isOverdue } from "@/lib/taskStatus";
import { computeNextOccurrenceDate, seriesHasEnded, toDateString, type RecurrenceDraft } from "@/lib/recurrence";
import { projectDeadlineStatus } from "@/lib/projects";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import StatsRow from "@/components/StatsRow";
import TaskForm, { type NewTask, type NewProject } from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import RecurringTaskList from "@/components/RecurringTaskList";
import ProjectsSection from "@/components/ProjectsSection";
import FilterBar, { type RoutineFilter } from "@/components/FilterBar";
import type { EditScope } from "@/components/TaskItem";

type TaskEdits = {
  title: string;
  category: string | null;
  time: string | null;
  priority: Priority | null;
  due_date: string | null;
};

type ProjectEdits = Partial<
  Pick<Project, "name" | "description" | "status" | "priority" | "target_date" | "start_date" | "progress_override">
>;

function sectionVisibility(filter: RoutineFilter) {
  return {
    operational: filter === "all" || filter === "operational" || ["completed", "pending", "overdue"].includes(filter),
    recurring: filter === "all" || filter === "recurring" || ["completed", "pending", "overdue"].includes(filter),
    projects: filter === "all" || filter === "projects" || ["completed", "pending", "overdue"].includes(filter),
  };
}

function filterRoutineItems(items: RoutineItem[], filter: RoutineFilter, now: Date) {
  switch (filter) {
    case "completed":
      return items.filter((i) => i.done);
    case "pending":
      return items.filter((i) => !i.done && !isOverdue(i, now));
    case "overdue":
      return items.filter((i) => isOverdue(i, now));
    default:
      return items;
  }
}

function filterProjects(projects: Project[], filter: RoutineFilter, now: Date) {
  switch (filter) {
    case "completed":
      return projects.filter((p) => p.status === "completed");
    case "pending":
      return projects.filter(
        (p) => p.status !== "completed" && p.status !== "cancelled" && projectDeadlineStatus(p, now)?.tone !== "danger",
      );
    case "overdue":
      return projects.filter((p) => projectDeadlineStatus(p, now)?.tone === "danger");
    case "projects":
      return projects;
    default:
      return projects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
  }
}

export default function Home() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [recurrences, setRecurrences] = useState<Map<string, Recurrence>>(new Map());
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [filter, setFilter] = useState<RoutineFilter>("all");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function loadItems() {
    const { data, error } = await supabase
      .from("routine_items")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setItems(data ?? []);
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setProjects(data ?? []);
  }

  useEffect(() => {
    let ignore = false;

    Promise.all([
      supabase.from("routine_items").select("*").order("created_at", { ascending: true }),
      supabase.from("recurrences").select("*"),
      supabase.from("projects").select("*").order("created_at", { ascending: true }),
    ]).then(([itemsRes, recurrencesRes, projectsRes]) => {
      if (ignore) return;
      const firstError = itemsRes.error ?? recurrencesRes.error ?? projectsRes.error;
      if (firstError) {
        setError(firstError.message);
      } else {
        setError(null);
        setItems(itemsRes.data ?? []);
        setRecurrences(new Map((recurrencesRes.data ?? []).map((r) => [r.id, r as Recurrence])));
        setProjects(projectsRes.data ?? []);
      }
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  // ---------- Operational / recurring tasks ----------

  async function handleAddTask(task: NewTask) {
    if (task.recurrence) {
      const draft: RecurrenceDraft = task.recurrence;
      const startsOn = task.due_date ?? toDateString(now);

      const { data: rule, error: recError } = await supabase
        .from("recurrences")
        .insert({
          title: task.title,
          category: task.category,
          time: task.time,
          priority: task.priority,
          frequency: draft.frequency,
          unit: draft.unit,
          interval: draft.interval,
          by_weekday: draft.unit === "week" ? draft.by_weekday : null,
          by_monthday: draft.unit === "month" || draft.unit === "year" ? draft.by_monthday : null,
          by_month: draft.unit === "year" ? draft.by_month : null,
          starts_on: startsOn,
          ends_on: draft.end_type === "on_date" ? draft.ends_on : null,
          max_occurrences: draft.end_type === "after_count" ? draft.max_occurrences : null,
        })
        .select()
        .single();

      if (recError || !rule) {
        setError(recError?.message ?? "Não foi possível criar a recorrência.");
        return;
      }

      const { data, error } = await supabase
        .from("routine_items")
        .insert({
          title: task.title,
          category: task.category,
          time: task.time,
          priority: task.priority,
          due_date: startsOn,
          recurrence_id: rule.id,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }
      setRecurrences((prev) => new Map(prev).set(rule.id, rule as Recurrence));
      setItems((prev) => [...prev, data]);
      return;
    }

    const { data, error } = await supabase
      .from("routine_items")
      .insert({
        title: task.title,
        category: task.category,
        time: task.time,
        priority: task.priority,
        due_date: task.due_date,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => [...prev, data]);
  }

  async function generateNextOccurrence(completedItem: RoutineItem) {
    if (!completedItem.recurrence_id) return;
    const rule = recurrences.get(completedItem.recurrence_id);
    if (!rule || !rule.active) return;

    // Avoid duplicating the next occurrence if one is already pending
    // (e.g. the user toggled done/undone quickly).
    const alreadyPending = items.some(
      (i) => i.recurrence_id === rule.id && i.id !== completedItem.id && !i.done,
    );
    if (alreadyPending) return;

    const fromDate = completedItem.due_date
      ? new Date(`${completedItem.due_date}T00:00:00`)
      : now;
    const nextDate = computeNextOccurrenceDate(rule, fromDate);

    const { count } = await supabase
      .from("routine_items")
      .select("id", { count: "exact", head: true })
      .eq("recurrence_id", rule.id);

    if (seriesHasEnded(rule, nextDate, count ?? 0)) return;

    const { data, error } = await supabase
      .from("routine_items")
      .insert({
        title: rule.title,
        category: rule.category,
        time: rule.time,
        priority: rule.priority,
        due_date: toDateString(nextDate),
        recurrence_id: rule.id,
      })
      .select()
      .single();

    if (!error && data) {
      setItems((prev) => [...prev, data]);
    }
  }

  async function handleToggle(id: string, done: boolean) {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
    const { error } = await supabase.from("routine_items").update({ done }).eq("id", id);
    if (error) {
      setError(error.message);
      loadItems();
      return;
    }
    if (done && item) {
      await generateNextOccurrence({ ...item, done: true });
    }
  }

  async function handleEditTask(id: string, edits: TaskEdits, scope: EditScope) {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...edits } : i)));
    const { error } = await supabase.from("routine_items").update(edits).eq("id", id);
    if (error) {
      setError(error.message);
      loadItems();
      return;
    }

    if (scope === "series" && item?.recurrence_id) {
      const templateEdits = {
        title: edits.title,
        category: edits.category,
        time: edits.time,
        priority: edits.priority,
      };
      const { error: recErr } = await supabase
        .from("recurrences")
        .update(templateEdits)
        .eq("id", item.recurrence_id);
      if (!recErr) {
        setRecurrences((prev) => {
          const next = new Map(prev);
          const existing = next.get(item.recurrence_id!);
          if (existing) next.set(item.recurrence_id!, { ...existing, ...templateEdits });
          return next;
        });
      }
    }
  }

  async function handleDeleteTask(id: string, scope: EditScope) {
    const item = items.find((i) => i.id === id);
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from("routine_items").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setItems(previous);
      return;
    }

    if (scope === "series" && item?.recurrence_id) {
      const { error: recErr } = await supabase
        .from("recurrences")
        .update({ active: false })
        .eq("id", item.recurrence_id);
      if (!recErr) {
        setRecurrences((prev) => {
          const next = new Map(prev);
          const existing = next.get(item.recurrence_id!);
          if (existing) next.set(item.recurrence_id!, { ...existing, active: false });
          return next;
        });
      }
    }
  }

  // ---------- Projects ----------

  async function handleAddProject(project: NewProject) {
    const { data, error } = await supabase.from("projects").insert(project).select().single();
    if (error) {
      setError(error.message);
      return;
    }
    setProjects((prev) => [...prev, data]);
  }

  async function handleUpdateProject(id: string, edits: ProjectEdits) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...edits } : p)));
    const { error } = await supabase.from("projects").update(edits).eq("id", id);
    if (error) {
      setError(error.message);
      loadProjects();
    }
  }

  async function handleDeleteProject(id: string) {
    const previousProjects = projects;
    const previousItems = items;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // The FK is ON DELETE SET NULL, so related tasks survive as standalone tasks.
    setItems((prev) => prev.map((i) => (i.project_id === id ? { ...i, project_id: null } : i)));
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setProjects(previousProjects);
      setItems(previousItems);
    }
  }

  async function handleAddProjectTask(projectId: string, title: string) {
    const { data, error } = await supabase
      .from("routine_items")
      .insert({ title, project_id: projectId })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => [...prev, data]);
  }

  // ---------- Derived view state ----------

  const dailyItems = items.filter((i) => !i.project_id);
  const operationalItems = dailyItems.filter((i) => !i.recurrence_id);
  const recurringItems = dailyItems.filter((i) => i.recurrence_id);

  const tasksByProject = new Map<string, RoutineItem[]>();
  for (const item of items) {
    if (!item.project_id) continue;
    if (!tasksByProject.has(item.project_id)) tasksByProject.set(item.project_id, []);
    tasksByProject.get(item.project_id)!.push(item);
  }

  const stats = computeStats(dailyItems, now);
  const visibility = sectionVisibility(filter);
  const visibleOperational = filterRoutineItems(operationalItems, filter, now);
  const visibleRecurring = filterRoutineItems(recurringItems, filter, now);
  const visibleProjects = filterProjects(projects, filter, now);

  return (
    <AppShell>
      <PageHeader stats={stats} />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        {stats.total > 0 && <StatsRow stats={stats} />}

        <TaskForm onAddTask={handleAddTask} onAddProject={handleAddProject} />

        <FilterBar value={filter} onChange={setFilter} />

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-8">
            {visibility.operational && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">Tarefas de hoje</h2>
                <TaskList
                  items={visibleOperational}
                  now={now}
                  onToggle={handleToggle}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </section>
            )}

            {visibility.recurring && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">Tarefas recorrentes</h2>
                <RecurringTaskList
                  items={visibleRecurring}
                  recurrences={recurrences}
                  now={now}
                  onToggle={handleToggle}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </section>
            )}

            {visibility.projects && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">Projetos ativos</h2>
                <ProjectsSection
                  projects={visibleProjects}
                  tasksByProject={tasksByProject}
                  now={now}
                  onUpdate={handleUpdateProject}
                  onDelete={handleDeleteProject}
                  onAddTask={handleAddProjectTask}
                  onToggleTask={handleToggle}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
