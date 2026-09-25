const PALETTES = ['violet', 'ocean', 'ember', 'mint', 'rose', 'amber'] as const;

export function initialsOf(firstName: string, lastName = ''): string {
  const first = Array.from(firstName.trim())[0] ?? '';
  const last = Array.from(lastName.trim())[0] ?? '';
  return `${first}${last}`.toLocaleUpperCase() || '?';
}

/** Stable colour per person so the same initials always look the same. */
export function paletteFor(seed: string): (typeof PALETTES)[number] {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  return PALETTES[hash % PALETTES.length]!;
}
