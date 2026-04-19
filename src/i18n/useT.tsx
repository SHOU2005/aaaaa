/**
 * LangContext — Reactive language state for the Switch app
 *
 * - Wraps the app in <LangProvider>
 * - Any component calls useLang() to get { lang, setLang }
 * - useT() now reads from this context, so changing lang re-renders all consumers
 */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { getWorker, saveWorker } from '../data/store';
import T, { type TKey, type Lang } from './translations';

// ── Types & Context ────────────────────────────────────────────────────────────
interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

// ── Provider ───────────────────────────────────────────────────────────────────
export function LangProvider({ children }: { children: React.ReactNode }) {
  const initial = (getWorker()?.language ?? 'en') as Lang;
  const [lang, setLangState] = useState<Lang>(initial);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    // Persist to worker profile
    const w = getWorker();
    if (w) saveWorker({ ...w, language: l });
  }, []);

  const t = useCallback((key: TKey, vars?: Record<string, string | number>): string => {
    const entry = T[key];
    if (!entry) return key;
    let str: string = entry[lang] ?? entry['en'] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────
/** Get the full lang context: { lang, setLang, t } */
export function useLang() {
  return useContext(LangContext);
}

/** Shorthand: just get the t() function */
export function useT() {
  return useContext(LangContext).t;
}
