import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useIPTV } from '../context/IPTVContext';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { channels } = useIPTV();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const nav = [
    { to: '/', label: 'خانه' },
    { to: '/countries', label: 'کشورها' },
    { to: '/genres', label: 'ژانرها' },
    { to: '/favorites', label: 'علاقه‌مندی‌ها' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#08080e]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 select-none">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/50">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
            </svg>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-white font-black text-base tracking-tight">S‑TV</span>
            <span className="text-violet-400 text-[9px] font-medium">ماهواره زنده</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 mr-1">
          {nav.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                pathname === link.to
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm mr-auto">
          <div className={`relative transition-all duration-200 ${focused ? 'scale-[1.02]' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none">
              <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="جستجوی کانال…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full bg-zinc-900/80 border border-white/8 rounded-xl pr-9 pl-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/60 focus:bg-zinc-900 transition-all"
            />
          </div>
        </form>

        {/* Live badge */}
        {channels.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {channels.length.toLocaleString('fa-IR')}
          </div>
        )}
      </div>
    </header>
  );
}
