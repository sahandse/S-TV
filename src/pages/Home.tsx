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

  const persianChannels = channels.filter(ch => ch.country === 'IR' || ch.country === 'AF' || ch.country === 'TJ').slice(0, 18);
  const featured = channels.slice(0, 18);

  return (
    <div className="min-h-screen bg-[#08080e]">

      <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_0%,rgba(110,77,255,0.19),transparent_54%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111522] p-6 shadow-2xl shadow-black/30 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div className="relative z-10">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {channels.length.toLocaleString('fa-IR')} کانال در فهرست
            </span>
            <h1 className="max-w-xl text-4xl font-black leading-[1.35] tracking-tight text-white sm:text-5xl lg:text-6xl">
              هر کانالی، <span className="text-violet-300">یک انتخاب.</span><br /> یک دنیای تماشا.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-8 text-zinc-400 sm:text-base">
              تلویزیون زنده بدون شلوغی. کانال موردعلاقه‌ات رو پیدا کن و مستقیم تماشا کن.
              روی موبایل، لپ‌تاپ یا نمایشگر بزرگ.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tv" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 focus-visible:outline-4 focus-visible:outline-violet-300">
                <span aria-hidden="true">▶</span> شروع تماشا
              </Link>
              <Link to="/search" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-zinc-100 transition hover:bg-white/10">
                <span aria-hidden="true">⌕</span> پیدا کردن کانال
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-5 text-sm text-zinc-400">
              <span><strong className="ml-2 text-lg text-white">{countries.filter(c => countByCountry.has(c.code)).length.toLocaleString('fa-IR')}</strong>کشور</span>
              <span><strong className="ml-2 text-lg text-white">{categories.filter(c => (countByCategory.get(c.id) ?? 0) > 0).length.toLocaleString('fa-IR')}</strong>دسته‌بندی</span>
            </div>
          </div>
          <div className="relative hidden aspect-[5/4] min-w-0 items-center justify-center lg:flex">
            <div className="absolute inset-5 rounded-[3rem] bg-violet-600/15 blur-3xl" />
            <div className="relative w-full max-w-md rotate-[-3deg] rounded-[2rem] border border-white/15 bg-[#080a12] p-4 shadow-2xl shadow-black/60">
              <div className="mb-4 flex items-center justify-between px-2 text-xs text-zinc-400"><span>پیشنمایش رابط تلویزیون</span><span className="text-violet-300">S-TV</span></div>
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#343054] via-[#191a2b] to-[#0b0c14]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-violet-500/30 text-3xl text-white">▶</div>
              </div>
              <div className="mt-4 flex gap-2">{['ورزشی','فیلم','موسیقی'].map(item => <span key={item} className="rounded-full bg-white/10 px-3 py-2 text-xs text-zinc-300">{item}</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">

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

        {persianChannels.length > 0 && (
          <section>
            <SectionTitle icon="📺" title="کانال‌های ایران و منطقه" to="/country/IR" />
            <div className="scroll-row">
              {persianChannels.map(ch => {
                const stream = streamMap.get(ch.id)!;
                const country = countryMap.get(ch.country);
                return <div key={ch.id} className="w-36 shrink-0"><ChannelCard channel={ch} stream={stream} logoUrl={logoMap.get(ch.id)} countryFlag={country?.flag || getFlagEmoji(ch.country)} onClick={() => setPlaying({ channel: ch, stream })} /></div>;
              })}
            </div>
          </section>
        )}

        {/* ═══ FEATURED ═══ */}
        <section>
          <SectionTitle icon="📡" title="پیشنهادهای تماشا" to="/countries" />
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
