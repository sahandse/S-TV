import { useEffect, useState } from 'react';

const PALETTE = [
  'from-violet-700 to-purple-900',
  'from-blue-700 to-indigo-900',
  'from-emerald-700 to-teal-900',
  'from-rose-700 to-red-900',
  'from-amber-600 to-orange-900',
  'from-cyan-700 to-sky-900',
  'from-fuchsia-700 to-pink-900',
];

interface Props {
  url?: string;
  name: string;
  className?: string;
}

export default function ChannelLogo({ url, name, className = 'w-12 h-12' }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [url]);

  const gradient = PALETTE[name.charCodeAt(0) % PALETTE.length];
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (!url || failed) {
    return (
      <div
        className={`${className} bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center font-bold text-white text-lg select-none`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className={`${className} object-contain rounded-lg bg-zinc-900`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
