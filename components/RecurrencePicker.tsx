"use client";

import { useState } from "react";
import { Repeat, ChevronDown } from "lucide-react";
import type { RecurrenceFrequency, RecurrenceUnit } from "@/lib/types";
import {
  type RecurrenceDraft,
  FREQUENCY_LABELS,
  UNIT_BY_FREQUENCY,
  WEEKDAY_LABELS,
  describeRecurrence,
  defaultDraftForFrequency,
} from "@/lib/recurrence";
import { focusRing } from "./Sidebar";

type Props = {
  value: RecurrenceDraft | null;
  onChange: (draft: RecurrenceDraft | null) => void;
  referenceDate: Date;
};

const FREQUENCIES: RecurrenceFrequency[] = ["daily", "weekly", "monthly", "yearly", "custom"];
const UNITS: RecurrenceUnit[] = ["day", "week", "month", "year"];
const UNIT_LABELS: Record<RecurrenceUnit, string> = { day: "dias", week: "semanas", month: "meses", year: "anos" };

const chip = (selected: boolean) =>
  `rounded-md px-2.5 py-1 text-xs font-medium transition ${
    selected ? "bg-brand text-white" : "bg-surface-2 text-foreground-secondary hover:bg-surface"
  }`;

const inputBase =
  "rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function RecurrencePicker({ value, onChange, referenceDate }: Props) {
  const [open, setOpen] = useState(false);

  function setFrequency(frequency: RecurrenceFrequency) {
    const next = defaultDraftForFrequency(frequency, referenceDate);
    if (frequency !== "custom") next.unit = UNIT_BY_FREQUENCY[frequency];
    onChange(next);
  }

  function patch(edits: Partial<RecurrenceDraft>) {
    if (!value) return;
    onChange({ ...value, ...edits });
  }

  function toggleWeekday(day: number) {
    if (!value) return;
    const has = value.by_weekday.includes(day);
    const next = has ? value.by_weekday.filter((d) => d !== day) : [...value.by_weekday, day];
    patch({ by_weekday: next.length ? next : [day] });
  }

  const summary = value ? `${FREQUENCY_LABELS[value.frequency]} · ${describeRecurrence(value)}` : "Não repete";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-foreground-secondary transition hover:text-foreground ${focusRing}`}
      >
        <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
        {summary}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-surface p-3 shadow-lg">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onChange(null)}
              className={chip(value === null)}
            >
              Não repete
            </button>
            {FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={chip(value?.frequency === freq)}
              >
                {FREQUENCY_LABELS[freq]}
              </button>
            ))}
          </div>

          {value && (
            <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
              {value.frequency === "custom" && (
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <span>A cada</span>
                  <input
                    type="number"
                    min={1}
                    value={value.interval}
                    onChange={(e) => patch({ interval: Math.max(1, Number(e.target.value) || 1) })}
                    className={`w-14 ${inputBase}`}
                    aria-label="Intervalo de repetição"
                  />
                  <div className="flex overflow-hidden rounded-md border border-border">
                    {UNITS.map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => patch({ unit })}
                        className={`px-2 py-1 text-xs font-medium transition ${
                          value.unit === unit
                            ? "bg-brand text-white"
                            : "bg-surface-2 text-foreground-secondary hover:bg-surface"
                        }`}
                      >
                        {UNIT_LABELS[unit]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {value.unit === "week" && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-foreground-muted">Repetir em</p>
                  <div className="flex flex-wrap gap-1">
                    {WEEKDAY_LABELS.map((label, day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        aria-pressed={value.by_weekday.includes(day)}
                        className={`h-7 w-9 rounded-md text-xs font-medium capitalize transition ${
                          value.by_weekday.includes(day)
                            ? "bg-brand text-white"
                            : "bg-surface-2 text-foreground-secondary hover:bg-surface"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {value.unit === "month" && (
                <label className="flex items-center gap-2 text-xs text-foreground-secondary">
                  Dia do mês
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={value.by_monthday ?? 1}
                    onChange={(e) =>
                      patch({ by_monthday: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })
                    }
                    className={`w-16 ${inputBase}`}
                  />
                </label>
              )}

              {value.unit === "year" && (
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <span>Todo dia</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={value.by_monthday ?? 1}
                    onChange={(e) =>
                      patch({ by_monthday: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })
                    }
                    className={`w-14 ${inputBase}`}
                  />
                  <select
                    value={value.by_month ?? 1}
                    onChange={(e) => patch({ by_month: Number(e.target.value) })}
                    className={inputBase}
                  >
                    {[
                      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
                      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
                    ].map((label, index) => (
                      <option key={label} value={index + 1}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <p className="mb-1.5 text-xs font-medium text-foreground-muted">Termina</p>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <input
                      type="radio"
                      name="recurrence-end"
                      checked={value.end_type === "never"}
                      onChange={() => patch({ end_type: "never", ends_on: null, max_occurrences: null })}
                    />
                    Nunca
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <input
                      type="radio"
                      name="recurrence-end"
                      checked={value.end_type === "on_date"}
                      onChange={() =>
                        patch({ end_type: "on_date", max_occurrences: null, ends_on: value.ends_on ?? "" })
                      }
                    />
                    Em uma data
                    {value.end_type === "on_date" && (
                      <input
                        type="date"
                        value={value.ends_on ?? ""}
                        onChange={(e) => patch({ ends_on: e.target.value })}
                        className={inputBase}
                      />
                    )}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <input
                      type="radio"
                      name="recurrence-end"
                      checked={value.end_type === "after_count"}
                      onChange={() =>
                        patch({
                          end_type: "after_count",
                          ends_on: null,
                          max_occurrences: value.max_occurrences ?? 10,
                        })
                      }
                    />
                    Após
                    {value.end_type === "after_count" && (
                      <>
                        <input
                          type="number"
                          min={1}
                          value={value.max_occurrences ?? 10}
                          onChange={(e) => patch({ max_occurrences: Math.max(1, Number(e.target.value) || 1) })}
                          className={`w-14 ${inputBase}`}
                        />
                        ocorrências
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`self-end rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand/90 ${focusRing}`}
              >
                Pronto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
