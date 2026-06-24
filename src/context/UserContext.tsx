import { createContext, useContext, type ReactNode } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentlyWatched } from '../hooks/useRecentlyWatched';

interface UserCtx {
  favorites: Set<string>;
  toggleFav: (id: string) => void;
  isFav: (id: string) => boolean;
  recent: string[];
  addRecent: (id: string) => void;
  clearRecent: () => void;
}

const Ctx = createContext<UserCtx | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { favorites, toggle, isFav } = useFavorites();
  const { recent, addRecent, clearRecent } = useRecentlyWatched();

  return (
    <Ctx.Provider value={{ favorites, toggleFav: toggle, isFav, recent, addRecent, clearRecent }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUser() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
