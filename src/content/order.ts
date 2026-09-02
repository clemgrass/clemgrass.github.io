export interface Orderable {
  id: string;
  order: number;
}

/** Throws at build time if two games claim the same position on the page. */
export function assertUniqueOrder(entries: Orderable[]): void {
  const seen = new Map<number, string>();

  for (const entry of entries) {
    const previous = seen.get(entry.order);
    if (previous !== undefined) {
      throw new Error(
        `Duplicate order ${entry.order}: "${previous}" and "${entry.id}" both claim it.`
      );
    }
    seen.set(entry.order, entry.id);
  }
}
