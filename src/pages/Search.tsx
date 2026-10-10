import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIPTV } from '../context/IPTVContext';
import ChannelCard from '../components/ChannelCard';
import PlayerModal from '../components/PlayerModal';
import type { Channel, Stream } from '../types';

interface Playing { channel: Channel; stream: Stream }

function getFlagEmoji(code: string) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [limit, setLimit] = useState(30);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const { channels, streamMap, logoMap, countries } = useIPTV();
  const countryMap = new Map(countries.map(c => [c.code, c]));

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return channels.filter(ch =>
      ch.name.toLowerCase().includes(query) ||
      ch.alt_names.some(n => n.toLowerCase().includes(query))
    );
  }, [q, channels]);

  return (
    <div className="min-h-screen bg-[#07090f] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-6"><h1 className="text-2xl sm:text-3xl font-black text-white">چی دوست داری تماشا کنی؟</h1><p className="mt-2 text-sm text-zinc-400">اسم کانال رو بنویس تا بین کانال‌های موجود پیداش کنیم.</p></div>
        {/* Search input */}
        <div className="relative mb-8">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none">
            <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="نام کانال را وارد کنید…"
            value={q}
            onChange={e => { setLimit(30); setParams({ q: e.target.value }, { replace: true }); }}
            className="w-full bg-[#151a27] border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>

        {q.trim() === '' ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <span className="text-6xl">🔍</span>
            <p className="text-zinc-400 text-base">نام کانال مورد نظر خود را جستجو کنید</p>
            <p className="text-zinc-600 text-sm">از هزاران کانال ماهواره‌ای سراسر جهان</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <span className="text-6xl">📭</span>
            <p className="text-zinc-400 text-base">نتیجه‌ای برای «{q}» یافت نشد</p>
            <p className="text-zinc-600 text-sm">عبارت دیگری امتحان کنید</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 mb-4">
              {results.length.toLocaleString('fa-IR')} نتیجه برای «{q}»
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.slice(0, limit).filter(ch => streamMap.has(ch.id)).map(ch => {
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
            {results.length > limit && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setLimit(v => v + 30)} className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-sm font-bold text-violet-200 hover:bg-violet-500/20">نمایش ۳۰ کانال دیگر</button>
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
