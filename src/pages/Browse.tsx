import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIPTV } from '../context/IPTVContext';
import ChannelCard, { FA_CATEGORIES } from '../components/ChannelCard';
import PlayerModal from '../components/PlayerModal';
import type { Channel, Stream } from '../types';

interface Playing { channel: Channel; stream: Stream }

function getFlagEmoji(code: string) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const FA_GENRE_ICONS: Record<string, string> = {
  animation: '🎨', auto: '🚗', business: '💼', classic: '📺', comedy: '😄',
  cooking: '👨‍🍳', culture: '🎭', documentary: '🎥', education: '📚',
  entertainment: '🎪', family: '👨‍👩‍👧', general: '📡', horror: '👻',
  kids: '🧸', legislative: '🏛️', lifestyle: '✨', movies: '🎬', music: '🎵',
  news: '📰', outdoor: '🏕️', religious: '⛪', science: '🔬', shop: '🛍️',
  sports: '⚽', travel: '✈️', weather: '⛅',
};

const GENRE_GRADIENTS: Record<string, string> = {
  news: 'from-sky-600 to-indigo-900', sports: 'from-emerald-600 to-teal-900',
  movies: 'from-rose-600 to-red-900', music: 'from-violet-600 to-purple-900',
  kids: 'from-yellow-500 to-orange-800', documentary: 'from-teal-600 to-cyan-900',
  entertainment: 'from-fuchsia-600 to-pink-900', business: 'from-indigo-600 to-slate-900',
  cooking: 'from-orange-500 to-yellow-900', travel: 'from-cyan-500 to-blue-900',
  education: 'from-green-600 to-teal-900', science: 'from-blue-600 to-violet-900',
  religious: 'from-amber-600 to-orange-900', family: 'from-pink-500 to-red-900',
};

export default function Browse({ mode }: {
  mode: 'country' | 'category' | 'all-countries' | 'all-genres'
}) {
  const { code, id } = useParams<{ code?: string; id?: string }>();
  const { channels, streamMap, logoMap, countries, categories, languages, countByCountry, countByCategory, channelLanguages } = useIPTV();

  const [search, setSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'hd' | 'sd'>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [playing, setPlaying] = useState<Playing | null>(null);

  const countryMap = new Map(countries.map(c => [c.code, c]));
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const heading = useMemo(() => {
    if (mode === 'country' && code) {
      const c = countryMap.get(code.toUpperCase());
      return { title: c?.name ?? code.toUpperCase(), flag: c?.flag || getFlagEmoji(code), count: countByCountry.get(code.toUpperCase()) ?? 0 };
    }
    if (mode === 'category' && id) {
      const c = categoryMap.get(id);
      return { title: FA_CATEGORIES[id] ?? c?.name ?? id, flag: FA_GENRE_ICONS[id] ?? '📺', count: countByCategory.get(id) ?? 0 };
    }
    if (mode === 'all-countries') return { title: 'همه کشورها', flag: '🌍', count: countries.filter(c => countByCountry.has(c.code)).length };
    if (mode === 'all-genres') return { title: 'همه ژانرها', flag: '🎬', count: categories.filter(c => (countByCategory.get(c.id) ?? 0) > 0).length };
    return { title: '', flag: null, count: 0 };
  }, [mode, code, id]);

  const isListMode = mode === 'all-countries' || mode === 'all-genres';

  const filtered = useMemo(() => {
    if (isListMode) return [];
    let list = channels;

    if (mode === 'country' && code) list = list.filter(ch => ch.country === code.toUpperCase());
    else if (mode === 'category' && id) list = list.filter(ch => ch.categories.includes(id));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(ch => ch.name.toLowerCase().includes(q) || ch.alt_names.some(n => n.toLowerCase().includes(q)));
    }

    if (qualityFilter !== 'all') {
      list = list.filter(ch => {
        const s = streamMap.get(ch.id);
        if (!s?.quality) return qualityFilter === 'sd';
        const q = s.quality.toLowerCase();
        const isHD = q.includes('hd') || q.includes('1080') || q.includes('720') || q.includes('4k');
        return qualityFilter === 'hd' ? isHD : !isHD;
      });
    }

    if (langFilter !== 'all') {
      list = list.filter(ch => channelLanguages.get(ch.id)?.includes(langFilter));
    }

    return list;
  }, [channels, mode, code, id, search, qualityFilter, langFilter, streamMap, channelLanguages, isListMode]);

  const allCountries = useMemo(() =>
    mode !== 'all-countries' ? [] :
    countries.filter(c => countByCountry.has(c.code)).sort((a, b) => (countByCountry.get(b.code) ?? 0) - (countByCountry.get(a.code) ?? 0)),
    [mode, countries, countByCountry]);

  const allGenres = useMemo(() =>
    mode !== 'all-genres' ? [] :
    categories.filter(c => (countByCategory.get(c.id) ?? 0) > 0).sort((a, b) => (countByCategory.get(b.id) ?? 0) - (countByCategory.get(a.id) ?? 0)),
    [mode, categories, countByCategory]);

  return (
    <div className="min-h-screen bg-[#08080e] pb-16">

      {/* Page header */}
      <div className="border-b border-white/5 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform">
              <path strokeLinecap="round" d="m9 18 6-6-6-6" />
            </svg>
            بازگشت
          </Link>

          <div className="flex items-center gap-3">
            {heading.flag && (
              <span className="text-4xl leading-none drop-shadow-lg">{heading.flag}</span>
            )}
            <div>
              <h1 className="text-2xl font-black text-white">{heading.title}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {isListMode
                  ? `${heading.count.toLocaleString('fa-IR')} مورد در دسترس`
                  : `${filtered.length.toLocaleString('fa-IR')} کانال`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        {/* All Countries grid */}
        {mode === 'all-countries' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {allCountries.map(country => (
              <Link
                key={country.code}
                to={`/country/${country.code}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:border-violet-500/40 transition-all hover:scale-105 card-press"
              >
                <span className="text-4xl">{country.flag || getFlagEmoji(country.code)}</span>
                <div className="text-center">
                  <p className="text-xs font-semibold text-zinc-200 truncate w-full max-w-[96px] group-hover:text-white">{country.name}</p>
                  <p className="text-[10px] text-violet-400 mt-0.5">{(countByCountry.get(country.code) ?? 0).toLocaleString('fa-IR')} کانال</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* All Genres grid */}
        {mode === 'all-genres' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {allGenres.map(cat => {
              const grad = GENRE_GRADIENTS[cat.id] ?? 'from-zinc-700 to-zinc-900';
              return (
                <Link
                  key={cat.id}
                  to={`/genre/${cat.id}`}
                  className={`group relative h-28 rounded-2xl overflow-hidden bg-gradient-to-br ${grad} border border-white/10 hover:border-white/25 hover:scale-105 transition-all card-press shadow-lg`}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-1.5 p-3">
                    <span className="text-3xl">{FA_GENRE_ICONS[cat.id] ?? '📺'}</span>
                    <p className="text-xs font-bold text-white text-center">{FA_CATEGORIES[cat.id] ?? cat.name}</p>
                    <p className="text-[10px] text-white/60">{(countByCategory.get(cat.id) ?? 0).toLocaleString('fa-IR')} کانال</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Channel list mode */}
        {!isListMode && (
          <>
            {/* Search + filters */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none">
                    <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="جستجو در کانال‌ها…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/8 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/60 transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  {([['all', 'همه'], ['hd', 'HD'], ['sd', 'SD']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setQualityFilter(val)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        qualityFilter === val
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30'
                          : 'bg-zinc-900 border-white/8 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Language filter */}
              {languages.length > 0 && (
                <select
                  value={langFilter}
                  onChange={e => setLangFilter(e.target.value)}
                  className="self-start bg-zinc-900 border border-white/8 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60 transition-colors cursor-pointer"
                >
                  <option value="all">همه زبان‌ها</option>
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4">
                <span className="text-6xl">📭</span>
                <p className="text-zinc-400">کانالی یافت نشد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filtered.map(ch => {
                  const stream = streamMap.get(ch.id)!;
                  const country = countryMap.get(ch.country);
                  return (
                    <ChannelCard
                      key={ch.id}
                      channel={ch}
                      stream={stream}
                      logoUrl={logoMap.get(ch.id)}
                      countryFlag={country?.flag || getFlagEmoji(ch.country)}
                      onClick={() => setPlaying({ channel: ch, stream })}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {playing && (
        <PlayerModal
          channel={playing.channel}
          stream={playing.stream}
          logoUrl={logoMap.get(playing.channel.id)}
          countryName={countryMap.get(playing.channel.country)?.name}
          countryFlag={countryMap.get(playing.channel.country)?.flag || getFlagEmoji(playing.channel.country)}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}
