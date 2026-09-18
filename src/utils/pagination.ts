/**
 * Page numbers to render around the current page, with gaps marked by null.
 *
 * Without this a 40-page table draws 40 buttons, which wraps into a block of
 * numbers taller than the table itself on a phone.
 */
export function pageWindow(current: number, total: number, span = 1): (number | null)[] {
  if (total <= 1) return total === 1 ? [1] : [];

  const pages = new Set<number>([1, total]);
  for (let p = current - span; p <= current + span; p++) {
    if (p > 1 && p < total) pages.add(p);
  }

  const out: (number | null)[] = [];
  let prev = 0;
  for (const p of [...pages].sort((a, b) => a - b)) {
    if (prev && p - prev > 1) out.push(null); // gap
    out.push(p);
    prev = p;
  }
  return out;
}
