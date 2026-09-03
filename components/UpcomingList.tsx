import { CalendarClock } from "lucide-react";
import type { Priority, RoutineItemUpdate, Recurrence, RoutineItem, Tag } from "@/lib/types";
import { groupUpcoming } from "@/lib/taskStatus";
import SectionHeader from "./SectionHeader";
import TaskList from "./TaskList";
import type { EditScope } from "./TaskItem";

type Edits = {
  title: string;
  description: string | null;
  tag_ids: string[];
  priority: Priority | null;
  due_date: string | null;
};

type Props = {
  items: RoutineItem[];
  now: Date;
  recurrences: Map<string, Recurrence>;
  allTags: Tag[];
  onCreateTag: (name: string) => Promise<Tag | null>;
  updatesByItem: Map<string, RoutineItemUpdate[]>;
  onAddUpdate: (taskId: string, text: string) => Promise<void>;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, edits: Edits, scope: EditScope) => void;
  onDelete: (id: string, scope: EditScope) => void;
};

/**
 * Future-dated tasks, grouped by proximity. Renders through TaskList so the
 * card, sorting (due date ascending) and interactions are exactly the same as
 * every other list in the app.
 */
export default function UpcomingList({ items, now, ...taskProps }: Props) {
  const groups = groupUpcoming(items, now);

  const sections = [
    { key: "week", title: "Esta semana", items: groups.week },
    { key: "month", title: "Este mês", items: groups.month },
    { key: "later", title: "Mais adiante", items: groups.later },
  ].filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
        <CalendarClock className="h-6 w-6 text-foreground-muted" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Nada agendado para os próximos dias</p>
        <p className="text-xs text-foreground-muted">
          Tarefas com data futura ficam aqui até o dia delas chegar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.key} className="flex flex-col gap-2">
          <SectionHeader title={section.title} count={section.items.length} as="h3" />
          <TaskList items={section.items} now={now} {...taskProps} />
        </div>
      ))}
    </div>
  );
}
