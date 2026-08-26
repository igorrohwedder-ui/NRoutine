export type Priority = "low" | "medium" | "high";

export type RoutineItem = {
  id: string;
  title: string;
  time: string | null;
  category: string | null;
  done: boolean;
  created_at: string;
  priority: Priority | null;
  due_date: string | null;
};
