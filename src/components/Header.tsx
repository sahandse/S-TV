import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useIPTV } from '../context/IPTVContext';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { channels } = useIPTV();
  const [search, setSearch] = useState('');

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
    { to: '/tv', label: 'تلویزیون' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a12]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 select-none">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-800 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-900/50">
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
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
        <form onSubmit={handleSearch} className="flex-1 max-w-xs mr-auto">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none">
              <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="جستجوی کانال…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pr-9 pl-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/60 focus:bg-zinc-900 transition-all"
            />
          </div>
        </form>

        {/* Available channel count */}
        {channels.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-200 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            {channels.length.toLocaleString('fa-IR')}
          </div>
        )}
      </div>
    </header>
  );
}
