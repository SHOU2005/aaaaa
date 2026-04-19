/**
 * useT — Translation hook for Switch app
 *
 * Usage:
 *   const t = useT();
 *   t('nav.home')              → "Home" / "होम" / "Home"
 *   t('apply.q1', { role: 'Driver' }) → interpolates {role}
 */
import { useMemo } from 'react';
import { getWorker } from '../data/store';
import T, { type TKey, type Lang } from './translations';

/** Resolve a translation key for a given language, with optional interpolation. */
export function translate(key: TKey, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = T[key];
  if (!entry) return key;
  let str: string = entry[lang] ?? entry['en'] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

/** React hook: reads worker.language and returns a translate function. */
export function useT() {
  const lang = (getWorker()?.language ?? 'en') as Lang;
  const t = useMemo(
    () => (key: TKey, vars?: Record<string, string | number>) => translate(key, lang, vars),
    [lang],
  );
  return t;
}

export { type TKey, type Lang };
