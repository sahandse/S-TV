import { useState, useCallback } from 'react';

const KEY = 's-tv:favorites';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(load);

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  return { favorites, toggle, isFav: (id: string) => favorites.has(id) };
}
