import type { Tag } from "./types";

export function findExistingTag(tags: Tag[], name: string): Tag | undefined {
  const normalized = name.trim().toLowerCase();
  return tags.find((t) => t.name.trim().toLowerCase() === normalized);
}

/**
 * Per-tag color. Derived from the name so a tag always renders in the same
 * tone, without needing a color column in the database. Tones are
 * desaturated on purpose — the tag name is always visible, so color is
 * decoration, never the only signal.
 */
const TAG_TONES = [
  "border-sky-500/20 bg-sky-500/10 text-sky-300",
  "border-violet-500/20 bg-violet-500/10 text-violet-300",
  "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  "border-amber-500/20 bg-amber-500/10 text-amber-300",
  "border-rose-500/20 bg-rose-500/10 text-rose-300",
  "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
];

const TAG_DOTS = [
  "bg-sky-400",
  "bg-violet-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-cyan-400",
  "bg-indigo-400",
];

function toneIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % TAG_TONES.length;
}

/** Badge classes (border + background + text) for a tag chip. */
export function tagTone(name: string): string {
  return TAG_TONES[toneIndex(name)];
}

/** Solid dot color, for compact listings like the sidebar. */
export function tagDot(name: string): string {
  return TAG_DOTS[toneIndex(name)];
}
