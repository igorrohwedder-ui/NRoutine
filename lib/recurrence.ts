import type { Recurrence, RecurrenceFrequency, RecurrenceUnit } from "./types";

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
  custom: "Personalizada",
};

export const UNIT_BY_FREQUENCY: Record<Exclude<RecurrenceFrequency, "custom">, RecurrenceUnit> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

export const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const WEEKDAY_LABELS_FULL = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];
const MONTH_LABELS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** The in-progress configuration built by the recurrence picker, before it's persisted. */
export type RecurrenceDraft = {
  frequency: RecurrenceFrequency;
  unit: RecurrenceUnit;
  interval: number;
  by_weekday: number[];
  by_monthday: number | null;
  by_month: number | null;
  end_type: "never" | "on_date" | "after_count";
  ends_on: string | null;
  max_occurrences: number | null;
};

/** Formats a Date as "YYYY-MM-DD" using local calendar fields (no UTC shift). */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function atMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date) {
  const copy = atMidnight(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

type RuleShape = Pick<Recurrence, "unit" | "interval" | "by_weekday" | "by_monthday" | "by_month">;

/**
 * Computes the next occurrence date after `fromDate` (the date of the
 * occurrence that was just completed). `fromDate` is always assumed to be a
 * valid point on the cadence, so schedules stay correct even if the user
 * completes a task late — see lib/recurrence.ts callers.
 */
export function computeNextOccurrenceDate(rule: RuleShape, fromDate: Date): Date {
  const from = atMidnight(fromDate);
  const interval = Math.max(1, rule.interval);

  if (rule.unit === "day") {
    const next = new Date(from);
    next.setDate(next.getDate() + interval);
    return next;
  }

  if (rule.unit === "week") {
    const weekdays = (rule.by_weekday?.length ? rule.by_weekday : [from.getDay()])
      .slice()
      .sort((a, b) => a - b);
    const fromWeekStart = startOfWeek(from);
    const maxOffset = interval * 7 * 12;

    for (let offset = 1; offset <= maxOffset; offset++) {
      const candidate = new Date(from);
      candidate.setDate(candidate.getDate() + offset);
      if (!weekdays.includes(candidate.getDay())) continue;

      const candidateWeekStart = startOfWeek(candidate);
      const weeksDiff = Math.round(
        (candidateWeekStart.getTime() - fromWeekStart.getTime()) / (7 * 86_400_000),
      );
      if (weeksDiff % interval === 0) return candidate;
    }

    // Should never be reached given the generous cap above.
    const fallback = new Date(from);
    fallback.setDate(fallback.getDate() + interval * 7);
    return fallback;
  }

  if (rule.unit === "month") {
    const day = rule.by_monthday ?? from.getDate();
    const cursorYear = from.getFullYear();
    let cursorMonth = from.getMonth() + interval;
    let candidate = new Date(cursorYear, cursorMonth, Math.min(day, daysInMonth(cursorYear, cursorMonth)));

    while (candidate <= from) {
      cursorMonth += interval;
      candidate = new Date(cursorYear, cursorMonth, Math.min(day, daysInMonth(cursorYear, cursorMonth)));
    }
    return candidate;
  }

  // yearly
  const month = (rule.by_month ?? from.getMonth() + 1) - 1;
  const day = rule.by_monthday ?? from.getDate();
  let year = from.getFullYear() + interval;
  let candidate = new Date(year, month, Math.min(day, daysInMonth(year, month)));
  while (candidate <= from) {
    year += interval;
    candidate = new Date(year, month, Math.min(day, daysInMonth(year, month)));
  }
  return candidate;
}

export function seriesHasEnded(
  rule: Pick<Recurrence, "active" | "ends_on" | "max_occurrences">,
  nextDate: Date,
  occurrencesSoFar: number,
): boolean {
  if (!rule.active) return true;
  if (rule.ends_on) {
    const end = atMidnight(new Date(`${rule.ends_on}T00:00:00`));
    if (atMidnight(nextDate) > end) return true;
  }
  if (rule.max_occurrences !== null && rule.max_occurrences !== undefined) {
    if (occurrencesSoFar >= rule.max_occurrences) return true;
  }
  return false;
}

/** Human-readable summary, e.g. "Toda semana, seg, qua" or "A cada 2 meses, dia 5". */
export function describeRecurrence(rule: RuleShape): string {
  const interval = Math.max(1, rule.interval);

  if (rule.unit === "day") {
    return interval === 1 ? "Todos os dias" : `A cada ${interval} dias`;
  }

  if (rule.unit === "week") {
    const days = (rule.by_weekday?.length ? rule.by_weekday : [0])
      .slice()
      .sort((a, b) => a - b)
      .map((d) => WEEKDAY_LABELS[d])
      .join(", ");
    return interval === 1 ? `Toda semana, ${days}` : `A cada ${interval} semanas, ${days}`;
  }

  if (rule.unit === "month") {
    const day = rule.by_monthday ?? 1;
    return interval === 1 ? `Todo mês, dia ${day}` : `A cada ${interval} meses, dia ${day}`;
  }

  const month = MONTH_LABELS[(rule.by_month ?? 1) - 1];
  const day = rule.by_monthday ?? 1;
  return interval === 1 ? `Todo ano, ${day} de ${month}` : `A cada ${interval} anos, ${day} de ${month}`;
}

export function defaultDraftForFrequency(frequency: RecurrenceFrequency, referenceDate: Date): RecurrenceDraft {
  const unit = frequency === "custom" ? "week" : UNIT_BY_FREQUENCY[frequency];
  return {
    frequency,
    unit,
    interval: 1,
    by_weekday: [referenceDate.getDay()],
    by_monthday: referenceDate.getDate(),
    by_month: referenceDate.getMonth() + 1,
    end_type: "never",
    ends_on: null,
    max_occurrences: null,
  };
}
