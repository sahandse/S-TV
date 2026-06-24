import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useIPTV } from '../context/IPTVContext';
import { useUser } from '../context/UserContext';
import CountryCard from '../components/CountryCard';
import CategoryCard from '../components/CategoryCard';
import ChannelCard from '../components/ChannelCard';
import PlayerModal from '../components/PlayerModal';
import type { Channel, Stream } from '../types';

interface Playing { channel: Channel; stream: Stream }

function SectionTitle({ icon, title, to }: { icon: string; title: string; to: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <Link
        to={to}
        className="text-xs text-violet-400 hover:text-violet-300 font-medium bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1 rounded-full transition-all"
      >
        مشاهده همه ←
      </Link>
    </div>
  );
}

function getFlagEmoji(code: string) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export default function Home() {
  const { channels, streamMap, logoMap, countries, categories, countByCountry, countByCategory } = useIPTV();
  const { recent } = useUser();
  const [playing, setPlaying] = useState<Playing | null>(null);
  const countryMap = new Map(countries.map(c => [c.code, c]));

  const recentChannels = recent
    .map(id => channels.find(ch => ch.id === id))
    .filter((ch): ch is Channel => !!ch && streamMap.has(ch.id));

  const topCountries = countries
    .filter(c => countByCountry.has(c.code))
    .sort((a, b) => (countByCountry.get(b.code) ?? 0) - (countByCountry.get(a.code) ?? 0))
    .slice(0, 24);

  const topCategories = categories
    .filter(c => (countByCategory.get(c.id) ?? 0) > 0)
    .sort((a, b) => (countByCategory.get(b.id) ?? 0) - (countByCategory.get(a.id) ?? 0))
    .slice(0, 14);

  const featured = channels.slice(0, 24);

  return (
    <div className="min-h-screen bg-[#08080e]">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(109,40,217,0.15),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass text-violet-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {channels.length > 0 ? `${channels.length.toLocaleString('fa-IR')} کانال زنده در دسترس` : 'در حال بارگذاری…'}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            دنیا را{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-violet-400 via-purple-400 to-fuchsia-400">
                زنده ببین
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-l from-transparent via-violet-500 to-transparent" />
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-8">
            هزاران کانال ماهواره‌ای از سراسر جهان،
            <br className="hidden sm:block" />
            مستقیم در مرورگر، کاملاً رایگان
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/countries"
              className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-900/40 flex items-center gap-2"
            >
              <span>🌍</span> مرور بر اساس کشور
            </Link>
            <Link
              to="/genres"
              className="glass hover:bg-white/10 active:scale-95 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <span>🎬</span> مرور بر اساس ژانر
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {[
              { label: 'کشور', value: countries.filter(c => countByCountry.has(c.code)).length },
              { label: 'ژانر', value: categories.filter(c => (countByCategory.get(c.id) ?? 0) > 0).length },
              { label: 'کانال زنده', value: channels.length },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">{stat.value.toLocaleString('fa-IR')}+</div>
                <div className="text-xs text-zinc-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* ═══ RECENTLY WATCHED ═══ */}
        {recentChannels.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🕐</span>
              <h2 className="text-base font-bold text-white">آخرین تماشاها</h2>
            </div>
            <div className="scroll-row">
              {recentChannels.map(ch => {
                const stream = streamMap.get(ch.id)!;
                const country = countryMap.get(ch.country);
                return (
                  <div key={ch.id} className="shrink-0 w-36">
                    <ChannelCard
                      channel={ch}
                      stream={stream}
                      logoUrl={logoMap.get(ch.id)}
                      countryFlag={country?.flag || getFlagEmoji(ch.country)}
                      onClick={() => setPlaying({ channel: ch, stream })}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ COUNTRIES ═══ */}
        <section>
          <SectionTitle icon="🌍" title="مرور بر اساس کشور" to="/countries" />
          <div className="scroll-row">
            {topCountries.map(country => (
              <CountryCard
                key={country.code}
                country={country}
                channelCount={countByCountry.get(country.code) ?? 0}
              />
            ))}
          </div>
        </section>

        {/* ═══ GENRES ═══ */}
        <section>
          <SectionTitle icon="🎬" title="مرور بر اساس ژانر" to="/genres" />
          <div className="scroll-row">
            {topCategories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                channelCount={countByCategory.get(cat.id) ?? 0}
              />
            ))}
          </div>
        </section>

        {/* ═══ FEATURED ═══ */}
        <section>
          <SectionTitle icon="📡" title="کانال‌های ویژه" to="/countries" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {featured.map(ch => {
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
        </section>
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
