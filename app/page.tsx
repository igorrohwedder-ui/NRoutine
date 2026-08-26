"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Priority, Project, Recurrence, RoutineItem, Tag } from "@/lib/types";
import { computeStats, isOverdue } from "@/lib/taskStatus";
import {
  computeNextOccurrenceDate,
  firstMonthPeriodOccurrence,
  seriesHasEnded,
  toDateString,
  type RecurrenceDraft,
} from "@/lib/recurrence";
import { projectDeadlineStatus } from "@/lib/projects";
import { findExistingTag } from "@/lib/tags";
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
  tag_ids: string[];
  priority: Priority | null;
  due_date: string | null;
};

type ProjectEdits = Partial<
  Pick<Project, "name" | "description" | "status" | "priority" | "target_date" | "start_date" | "progress_override">
>;

function sectionVisibility(filter: RoutineFilter) {
  return {
    operational: filter === "all" || ["completed", "pending", "overdue"].includes(filter),
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

function filterByTag(items: RoutineItem[], tagId: string | null) {
  if (!tagId) return items;
  return items.filter((i) => i.tag_ids.includes(tagId));
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

async function fetchItemsWithTags(): Promise<{ data: RoutineItem[] | null; error: string | null }> {
  const [itemsRes, itemTagsRes] = await Promise.all([
    supabase.from("routine_items").select("*").order("created_at", { ascending: true }),
    supabase.from("routine_item_tags").select("*"),
  ]);
  if (itemsRes.error) return { data: null, error: itemsRes.error.message };
  if (itemTagsRes.error) return { data: null, error: itemTagsRes.error.message };

  const tagsByItem = new Map<string, string[]>();
  for (const row of itemTagsRes.data ?? []) {
    const list = tagsByItem.get(row.routine_item_id) ?? [];
    list.push(row.tag_id);
    tagsByItem.set(row.routine_item_id, list);
  }
  const withTags = (itemsRes.data ?? []).map((item) => ({ ...item, tag_ids: tagsByItem.get(item.id) ?? [] }));
  return { data: withTags, error: null };
}

async function attachTagsToItem(itemId: string, tagIds: string[]) {
  if (tagIds.length === 0) return;
  const rows = tagIds.map((tagId) => ({ routine_item_id: itemId, tag_id: tagId }));
  await supabase.from("routine_item_tags").insert(rows);
}

async function replaceTagsForItem(itemId: string, tagIds: string[]) {
  await supabase.from("routine_item_tags").delete().eq("routine_item_id", itemId);
  if (tagIds.length > 0) {
    await supabase.from("routine_item_tags").insert(tagIds.map((tagId) => ({ routine_item_id: itemId, tag_id: tagId })));
  }
}

export default function Home() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [recurrences, setRecurrences] = useState<Map<string, Recurrence>>(new Map());
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [filter, setFilter] = useState<RoutineFilter>("all");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function loadItems() {
    const { data, error } = await fetchItemsWithTags();
    if (error) setError(error);
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
      fetchItemsWithTags(),
      supabase.from("recurrences").select("*"),
      supabase.from("projects").select("*").order("created_at", { ascending: true }),
      supabase.from("tags").select("*").order("created_at", { ascending: true }),
    ]).then(([itemsResult, recurrencesRes, projectsRes, tagsRes]) => {
      if (ignore) return;
      const firstError =
        itemsResult.error ?? recurrencesRes.error?.message ?? projectsRes.error?.message ?? tagsRes.error?.message;
      if (firstError) {
        setError(firstError);
      } else {
        setError(null);
        setItems(itemsResult.data ?? []);
        setRecurrences(new Map((recurrencesRes.data ?? []).map((r) => [r.id, r as Recurrence])));
        setProjects(projectsRes.data ?? []);
        setTags(tagsRes.data ?? []);
      }
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  // ---------- Tags ----------

  async function handleCreateTag(name: string): Promise<Tag | null> {
    const existing = findExistingTag(tags, name);
    if (existing) return existing;

    const { data, error } = await supabase.from("tags").insert({ name }).select().single();
    if (error) {
      // Someone else may have created the same tag name concurrently.
      const { data: existingRow } = await supabase.from("tags").select("*").ilike("name", name).maybeSingle();
      if (existingRow) {
        setTags((prev) => (prev.some((t) => t.id === existingRow.id) ? prev : [...prev, existingRow]));
        return existingRow;
      }
      setError(error.message);
      return null;
    }
    setTags((prev) => [...prev, data]);
    return data;
  }

  // ---------- Operational / recurring tasks ----------

  async function handleAddTask(task: NewTask) {
    if (task.recurrence) {
      const draft: RecurrenceDraft = task.recurrence;
      let firstDueDate: string;

      if (draft.frequency === "month_period") {
        const referenceDate = task.due_date ? new Date(`${task.due_date}T00:00:00`) : now;
        const first = firstMonthPeriodOccurrence(
          { by_monthday: draft.by_monthday, period_end_day: draft.period_end_day },
          referenceDate,
        );
        firstDueDate = toDateString(first);
      } else {
        firstDueDate = task.due_date ?? toDateString(now);
      }

      const { data: rule, error: recError } = await supabase
        .from("recurrences")
        .insert({
          title: task.title,
          priority: task.priority,
          frequency: draft.frequency,
          unit: draft.unit,
          interval: draft.interval,
          by_weekday: draft.unit === "week" ? draft.by_weekday : null,
          by_monthday:
            draft.unit === "month" || draft.unit === "year" || draft.unit === "month_period"
              ? draft.by_monthday
              : null,
          by_month: draft.unit === "year" ? draft.by_month : null,
          period_end_day: draft.unit === "month_period" ? draft.period_end_day : null,
          starts_on: firstDueDate,
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
          priority: task.priority,
          due_date: firstDueDate,
          recurrence_id: rule.id,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      await attachTagsToItem(data.id, task.tagIds);
      setRecurrences((prev) => new Map(prev).set(rule.id, rule as Recurrence));
      setItems((prev) => [...prev, { ...data, tag_ids: task.tagIds }]);
      return;
    }

    const { data, error } = await supabase
      .from("routine_items")
      .insert({
        title: task.title,
        priority: task.priority,
        due_date: task.due_date,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    await attachTagsToItem(data.id, task.tagIds);
    setItems((prev) => [...prev, { ...data, tag_ids: task.tagIds }]);
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
        priority: rule.priority,
        due_date: toDateString(nextDate),
        recurrence_id: rule.id,
      })
      .select()
      .single();

    if (!error && data) {
      await attachTagsToItem(data.id, completedItem.tag_ids);
      setItems((prev) => [...prev, { ...data, tag_ids: completedItem.tag_ids }]);
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
    const { tag_ids, ...fieldEdits } = edits;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...fieldEdits, tag_ids } : i)));

    const { error } = await supabase.from("routine_items").update(fieldEdits).eq("id", id);
    if (error) {
      setError(error.message);
      loadItems();
      return;
    }

    await replaceTagsForItem(id, tag_ids);

    if (scope === "series" && item?.recurrence_id) {
      const templateEdits = { title: edits.title, priority: edits.priority };
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
    setItems((prev) => [...prev, { ...data, tag_ids: [] }]);
  }

  // ---------- Derived view state ----------

  const todayStr = toDateString(now);
  // "Today's Tasks" only ever shows items due today or earlier (or undated) —
  // a one-off task scheduled for a future date, or a recurring occurrence not
  // yet due, stays hidden until its date arrives.
  const dueTodayOrEarlier = items.filter((i) => !i.project_id && (!i.due_date || i.due_date <= todayStr));
  const operationalItems = dueTodayOrEarlier.filter((i) => !i.recurrence_id);
  const recurringItems = dueTodayOrEarlier.filter((i) => i.recurrence_id);

  const tasksByProject = new Map<string, RoutineItem[]>();
  for (const item of items) {
    if (!item.project_id) continue;
    if (!tasksByProject.has(item.project_id)) tasksByProject.set(item.project_id, []);
    tasksByProject.get(item.project_id)!.push(item);
  }

  const dailyItemsForStats = items.filter((i) => !i.project_id);
  const stats = computeStats(dailyItemsForStats, now);
  const visibility = sectionVisibility(filter);
  const visibleOperational = filterByTag(filterRoutineItems(operationalItems, filter, now), activeTagId);
  const visibleRecurring = filterByTag(filterRoutineItems(recurringItems, filter, now), activeTagId);
  const visibleProjects = activeTagId ? [] : filterProjects(projects, filter, now);
  const showProjectsSection = visibility.projects && !activeTagId;

  return (
    <AppShell>
      <PageHeader stats={stats} />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        {stats.total > 0 && <StatsRow stats={stats} />}

        <TaskForm
          allTags={tags}
          onCreateTag={handleCreateTag}
          onAddTask={handleAddTask}
          onAddProject={handleAddProject}
        />

        <FilterBar
          value={filter}
          onChange={setFilter}
          tags={tags}
          activeTagId={activeTagId}
          onTagChange={setActiveTagId}
        />

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
                  allTags={tags}
                  onCreateTag={handleCreateTag}
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
                  allTags={tags}
                  onCreateTag={handleCreateTag}
                  onToggle={handleToggle}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </section>
            )}

            {showProjectsSection && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">Projetos ativos</h2>
                <ProjectsSection
                  projects={visibleProjects}
                  tasksByProject={tasksByProject}
                  now={now}
                  allTags={tags}
                  onCreateTag={handleCreateTag}
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
