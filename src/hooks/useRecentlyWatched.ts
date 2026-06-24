import { useState, useCallback } from 'react';

const KEY = 's-tv:recent';
const MAX = 12;

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

export function useRecentlyWatched() {
  const [recent, setRecent] = useState<string[]>(load);

  const addRecent = useCallback((id: string) => {
    setRecent(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try { localStorage.removeItem(KEY); } catch {}
  }, []);

  return { recent, addRecent, clearRecent };
}
