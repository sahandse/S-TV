import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getChannels, getStreams, getLogos, getCountries, getCategories, getLanguages, getGuides, getFeeds } from '../api/iptv';
import type { Channel, Stream, Country, Category, Language } from '../types';

export interface IPTVState {
  channels: Channel[];
  streamMap: Map<string, Stream>;
  logoMap: Map<string, string>;
  countries: Country[];
  categories: Category[];
  languages: Language[];
  countByCountry: Map<string, number>;
  countByCategory: Map<string, number>;
  guideMap: Map<string, string>;        // channel_id → site_url
  channelLanguages: Map<string, string[]>; // channel_id → language codes
  loading: boolean;
  error: string | null;
}

const IPTVContext = createContext<IPTVState | null>(null);

export function IPTVProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IPTVState>({
    channels: [],
    streamMap: new Map(),
    logoMap: new Map(),
    countries: [],
    categories: [],
    languages: [],
    countByCountry: new Map(),
    countByCategory: new Map(),
    guideMap: new Map(),
    channelLanguages: new Map(),
    loading: true,
    error: null,
  });

  useEffect(() => {
    Promise.all([getChannels(), getStreams(), getCountries(), getCategories(), getLanguages()])
      .then(([channels, streams, countries, categories, languages]) => {
        const streamMap = new Map<string, Stream>();
        for (const s of streams) {
          if (s.channel && s.url && !streamMap.has(s.channel)) {
            streamMap.set(s.channel, s);
          }
        }

        const liveChannels = channels.filter(
          ch => !ch.closed && !ch.is_nsfw && streamMap.has(ch.id),
        );

        const countByCountry = new Map<string, number>();
        for (const ch of liveChannels) {
          if (ch.country) countByCountry.set(ch.country, (countByCountry.get(ch.country) ?? 0) + 1);
        }

        const countByCategory = new Map<string, number>();
        for (const ch of liveChannels) {
          for (const cat of ch.categories) {
            countByCategory.set(cat, (countByCategory.get(cat) ?? 0) + 1);
          }
        }

        // Build country → languages map for filtering
        const countryLangs = new Map<string, string[]>();
        for (const c of countries) countryLangs.set(c.code, c.languages ?? []);

        // Build channel → languages (via country)
        const channelLanguages = new Map<string, string[]>();
        for (const ch of liveChannels) {
          const langs = countryLangs.get(ch.country);
          if (langs?.length) channelLanguages.set(ch.id, langs);
        }

        setState(prev => ({
          ...prev,
          channels: liveChannels,
          streamMap,
          countries,
          categories,
          languages,
          countByCountry,
          countByCategory,
          channelLanguages,
          loading: false,
          error: null,
        }));

        // Load logos in background
        getLogos().then(logos => {
          const logoMap = new Map<string, string>();
          for (const logo of logos) {
            if (logo.in_use && logo.url && !logoMap.has(logo.channel)) {
              logoMap.set(logo.channel, logo.url);
            }
          }
          setState(prev => ({ ...prev, logoMap }));
        }).catch(() => {});

        // Load guides in background
        getGuides().then(guides => {
          const guideMap = new Map<string, string>();
          for (const g of guides) {
            if (g.channel && g.site_url && !guideMap.has(g.channel)) {
              guideMap.set(g.channel, g.site_url);
            }
          }
          setState(prev => ({ ...prev, guideMap }));
        }).catch(() => {});

        // Load feeds for more accurate language data
        getFeeds().then(feeds => {
          const feedLangs = new Map<string, string[]>();
          for (const f of feeds) {
            if (f.channel && f.languages?.length) {
              const existing = feedLangs.get(f.channel) ?? [];
              feedLangs.set(f.channel, [...new Set([...existing, ...f.languages])]);
            }
          }
          setState(prev => {
            const channelLanguages = new Map(prev.channelLanguages);
            for (const [id, langs] of feedLangs) {
              if (langs.length) channelLanguages.set(id, langs);
            }
            return { ...prev, channelLanguages };
          });
        }).catch(() => {});
      })
      .catch((err: Error) => {
        setState(prev => ({ ...prev, loading: false, error: err.message }));
      });
  }, []);

  return <IPTVContext.Provider value={state}>{children}</IPTVContext.Provider>;
}

export function useIPTV() {
  const ctx = useContext(IPTVContext);
  if (!ctx) throw new Error('useIPTV must be inside IPTVProvider');
  return ctx;
}
