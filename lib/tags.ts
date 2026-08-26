import type { Tag } from "./types";

export function findExistingTag(tags: Tag[], name: string): Tag | undefined {
  const normalized = name.trim().toLowerCase();
  return tags.find((t) => t.name.trim().toLowerCase() === normalized);
}
