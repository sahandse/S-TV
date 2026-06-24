import type { Channel, Stream, Logo, Country, Category, Language, Guide, Feed } from '../types';

const BASE = 'https://iptv-org.github.io/api';

async function get<T>(path: string): Promise<T> {
  const key = `s-tv:${path}`;

  try {
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {}

  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
  const data = (await res.json()) as T;

  try {
    sessionStorage.setItem(key, JSON.stringify(data));
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
