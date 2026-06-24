import type { Channel, Stream } from '../types';
import ChannelLogo from './ChannelLogo';
import { useUser } from '../context/UserContext';
import { useIPTV } from '../context/IPTVContext';

interface Props {
  channel: Channel;
  stream: Stream;
  logoUrl?: string;
  countryFlag?: string;
  onClick: () => void;
}

const QUALITY_MAP: Record<string, { label: string; cls: string }> = {
  '4k':   { label: '4K',   cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  '1080p':{ label: '1080', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  '720p': { label: '720',  cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  'hd':   { label: 'HD',   cls: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  'sd':   { label: 'SD',   cls: 'bg-zinc-600/30 text-zinc-300 border-zinc-600/30' },
};

function qualityInfo(q: string | null) {
  if (!q) return null;
  return QUALITY_MAP[q.toLowerCase()] ?? null;
}

const BG_GRADIENTS = [
  'from-violet-900/70 to-purple-950',
  'from-blue-900/70 to-indigo-950',
  'from-emerald-900/70 to-teal-950',
  'from-rose-900/70 to-red-950',
  'from-amber-900/70 to-orange-950',
  'from-cyan-900/70 to-sky-950',
  'from-fuchsia-900/70 to-pink-950',
  'from-slate-800/70 to-slate-950',
];

export default function ChannelCard({ channel, stream, logoUrl, countryFlag, onClick }: Props) {
  const gradIdx = channel.name.charCodeAt(0) % BG_GRADIENTS.length;
  const grad = BG_GRADIENTS[gradIdx];
  const qInfo = qualityInfo(stream.quality);
  const { isFav, toggleFav } = useUser();
  const { guideMap } = useIPTV();
  const fav = isFav(channel.id);
  const hasGuide = guideMap.has(channel.id);

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-right rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-violet-500/40 transition-all duration-250 hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-900/20 card-press"
    >
      {/* Top visual section */}
      <div className={`relative h-28 bg-gradient-to-br ${grad} flex items-center justify-center`}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
        />

        <ChannelLogo url={logoUrl} name={channel.name} className="w-16 h-16 relative z-10" />

        {/* Live badge top-right */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
            زنده
          </span>
          {hasGuide && (
            <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              EPG
            </span>
          )}
        </div>

        {qInfo && (
          <div className="absolute top-2 left-2">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${qInfo.cls}`}>
              {qInfo.label}
            </span>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={e => { e.stopPropagation(); toggleFav(channel.id); }}
          className={`absolute bottom-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-20 ${
            fav
              ? 'bg-red-500/80 text-white'
              : 'bg-black/40 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-400'
          }`}
          aria-label={fav ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        >
          <svg viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center shadow-2xl shadow-violet-900">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white mr-[-2px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="p-2.5">
        <p className="text-[13px] font-semibold text-white leading-tight line-clamp-1 group-hover:text-violet-200 transition-colors">
          {channel.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {countryFlag && <span className="text-xs">{countryFlag}</span>}
          {channel.categories[0] && (
            <span className="text-[10px] text-zinc-500 truncate">
              {FA_CATEGORIES[channel.categories[0]] ?? channel.categories[0]}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export const FA_CATEGORIES: Record<string, string> = {
  animation: 'انیمیشن',
  auto: 'خودرو',
  business: 'بازرگانی',
  classic: 'کلاسیک',
  comedy: 'کمدی',
  cooking: 'آشپزی',
  culture: 'فرهنگی',
  documentary: 'مستند',
  education: 'آموزشی',
  entertainment: 'سرگرمی',
  family: 'خانوادگی',
  general: 'عمومی',
  horror: 'ترسناک',
  kids: 'کودکان',
  legislative: 'قانونگذاری',
  lifestyle: 'سبک زندگی',
  movies: 'فیلم',
  music: 'موسیقی',
  news: 'خبری',
  outdoor: 'طبیعت',
  religious: 'مذهبی',
  science: 'علمی',
  shop: 'خرید',
  sports: 'ورزشی',
  travel: 'گردشگری',
  weather: 'آب‌وهوا',
};
