/** Only same-app relative paths are honoured, so `?next=` cannot become an open redirect. */
export function safeNextPath(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  if (/^\/(login|signup|forgot-password)\b/.test(next)) return fallback;
  return next;
}
