export type Priority = "low" | "medium" | "high";

export type Tag = {
  id: string;
  name: string;
  created_at: string;
};

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly" | "custom" | "month_period";
export type RecurrenceUnit = "day" | "week" | "month" | "year" | "month_period";

/** The repetition rule + "template" used to generate new occurrences. */
export type Recurrence = {
  id: string;
  title: string;
  priority: Priority | null;
  frequency: RecurrenceFrequency;
  unit: RecurrenceUnit;
  interval: number;
  by_weekday: number[] | null;
  /** Day-of-month for monthly/yearly; "start day" for month_period. */
  by_monthday: number | null;
  by_month: number | null;
  /** "End day" for month_period only. */
  period_end_day: number | null;
  starts_on: string;
  ends_on: string | null;
  max_occurrences: number | null;
  active: boolean;
  created_at: string;
};

/** A single occurrence of a (possibly recurring) operational task. */
export type RoutineItem = {
  id: string;
  title: string;
  done: boolean;
  created_at: string;
  priority: Priority | null;
  due_date: string | null;
  recurrence_id: string | null;
  project_id: string | null;
  /** Populated client-side from routine_item_tags; not a real DB column. */
  tag_ids: string[];
};

export type ProjectStatus = "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  target_date: string | null;
  priority: Priority | null;
  status: ProjectStatus;
  /** Manual override (0-100). When null, progress is computed from related tasks. */
  progress_override: number | null;
  created_at: string;
};
