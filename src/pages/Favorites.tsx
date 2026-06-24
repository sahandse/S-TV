import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIPTV } from '../context/IPTVContext';
import { useUser } from '../context/UserContext';
import ChannelCard from '../components/ChannelCard';
import PlayerModal from '../components/PlayerModal';
import type { Channel, Stream } from '../types';

interface Playing { channel: Channel; stream: Stream }

function getFlagEmoji(code: string) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export default function Favorites() {
  const { channels, streamMap, logoMap, countries } = useIPTV();
  const { favorites } = useUser();
  const [playing, setPlaying] = useState<Playing | null>(null);
  const countryMap = new Map(countries.map(c => [c.code, c]));

  const favChannels = channels.filter(ch => favorites.has(ch.id) && streamMap.has(ch.id));

  return (
    <div className="min-h-screen bg-[#08080e] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div>
            <h1 className="text-2xl font-black text-white">علاقه‌مندی‌ها</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{favChannels.length.toLocaleString('fa-IR')} کانال</p>
          </div>
        </div>

        {favChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16 text-zinc-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-zinc-400 text-base">هنوز کانالی به علاقه‌مندی‌ها اضافه نکرده‌اید</p>
            <p className="text-zinc-600 text-sm">روی آیکون قلب روی هر کانال کلیک کنید</p>
            <Link
              to="/"
              className="mt-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all"
            >
              مرور کانال‌ها
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {favChannels.map(ch => {
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
