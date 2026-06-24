import { Link, useLocation } from 'react-router-dom';

const ITEMS = [
  {
    to: '/',
    label: 'خانه',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    to: '/search',
    label: 'جستجو',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} className="w-6 h-6">
        <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    to: '/countries',
    label: 'کشورها',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    to: '/genres',
    label: 'ژانرها',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} className="w-6 h-6">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="17" />
        <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" />
      </svg>
    ),
  },
  {
    to: '/favorites',
    label: 'علاقه‌مندی‌ها',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Spacer so content doesn't hide behind nav */}
      <div className="h-20 md:hidden" />

      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-[#0d0d18]/90 backdrop-blur-xl border-t border-white/8" />

        <div className="relative flex items-center justify-around px-2 py-2 safe-bottom">
          {ITEMS.map(({ to, label, icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'text-violet-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {/* Active pill indicator */}
                <div className={`relative transition-all duration-200 ${active ? 'scale-110' : ''}`}>
                  {icon(active)}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-400 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold leading-none ${active ? 'text-violet-400' : 'text-zinc-500'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
