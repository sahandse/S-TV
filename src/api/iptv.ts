import type { Channel, Stream, Logo, Country, Category, Language, Guide, Feed } from '../types';

const BASE = 'https://iptv-org.github.io/api';
const CACHE_TTL = 1000 * 60 * 60;

async function get<T>(path: string): Promise<T> {
  const key = `s-tv:${path}`;

  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const entry = JSON.parse(cached) as { savedAt: number; data: T };
      if (entry && typeof entry.savedAt === "number" && Date.now() - entry.savedAt < CACHE_TTL) return entry.data;
      sessionStorage.removeItem(key);
    }
  } catch {}

  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
  const data = (await res.json()) as T;

  try {
    sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {}

  return data;
}

export const getChannels = () => get<Channel[]>('channels.json');
export const getStreams = () => get<Stream[]>('streams.json');
export const getLogos = () => get<Logo[]>('logos.json');
export const getCountries = () => get<Country[]>('countries.json');
export const getCategories = () => get<Category[]>('categories.json');
export const getLanguages = () => get<Language[]>('languages.json');
export const getGuides = () => get<Guide[]>('guides.json');
export const getFeeds = () => get<Feed[]>('feeds.json');
