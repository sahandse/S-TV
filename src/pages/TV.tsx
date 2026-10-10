import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIPTV } from '../context/IPTVContext';
import { useUser } from '../context/UserContext';
import VideoPlayer from '../components/VideoPlayer';
import EPGGuide from '../components/EPGGuide';
import ChannelLogo from '../components/ChannelLogo';
import { FA_CATEGORIES } from '../components/ChannelCard';
import type { Channel } from '../types';

export default function TV() {
  const navigate = useNavigate();
  const { channels, streamMap, logoMap, guideMap } = useIPTV();
  const { favorites, addRecent, toggleFav } = useUser();
  const [filter, setFilter] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [count, setCount] = useState(60);
  const [controllerReady, setControllerReady] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const available = useMemo(() => channels.filter(ch => streamMap.has(ch.id)), [channels, streamMap]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    available.forEach(ch => ch.categories.forEach(cat => counts.set(cat, (counts.get(cat) ?? 0) + 1)));
    return [...counts.entries()].sort((a,b) => b[1] - a[1]);
  }, [available]);
  const visible = useMemo(() => available.filter(ch =>
    (!onlyFav || favorites.has(ch.id)) &&
    (category === 'all' || ch.categories.includes(category)) &&
    (!filter.trim() || ch.name.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()))
  ), [available, favorites, onlyFav, category, filter]);
  const selected: Channel | undefined = available.find(ch => ch.id === selectedId);
  const activeSource = selected ? streamMap.get(selected.id) : undefined;
  const choose = (ch: Channel) => {
    setSelectedId(ch.id);
    setGuideOpen(true);
    addRecent(ch.id);
  };
  const currentIndex = visible.findIndex(ch => ch.id === selectedId);
  // Move focus by actual screen position, not DOM order (important for TV remotes).
  const moveFocus = (direction: 'up' | 'down' | 'left' | 'right') => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.tv-shell .tv-focus'))
      .filter(node => !node.hasAttribute('disabled') && node.getClientRects().length > 0);
    if (!nodes.length) return;
    const active = document.activeElement as HTMLElement;
    const origin = nodes.includes(active) ? active : null;
    if (!origin) { nodes[0].focus(); return; }
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const candidates = nodes.filter(node => node !== origin).map(node => {
      const box = node.getBoundingClientRect();
      const dx = box.left + box.width / 2 - x;
      const dy = box.top + box.height / 2 - y;
      const forward = direction === 'right' ? dx : direction === 'left' ? -dx : direction === 'down' ? dy : -dy;
      const cross = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      return { node, forward, score: forward + cross * 2.5 };
    }).filter(item => item.forward > 8).sort((a, b) => a.score - b.score);
    const target = candidates[0]?.node;
    target?.focus();
    target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  useEffect(() => {
    const isTyping = (target: EventTarget | null) => target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        moveFocus(event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right');
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        if (event.key === 'Backspace') event.preventDefault();
        navigate('/');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);
  useEffect(() => {
    let frame = 0;
    let lastDirection = 0;
    let lastTime = 0;
    let lastConfirm = false;
    const poll = (time: number) => {
      const pad = navigator.getGamepads?.().find(Boolean);
      if (pad) {
        setControllerReady(true);
        const up = Boolean(pad.buttons[12]?.pressed) || (pad.axes[1] ?? 0) < -0.65;
        const down = Boolean(pad.buttons[13]?.pressed) || (pad.axes[1] ?? 0) > 0.65;
        const left = Boolean(pad.buttons[14]?.pressed) || (pad.axes[0] ?? 0) < -0.65;
        const right = Boolean(pad.buttons[15]?.pressed) || (pad.axes[0] ?? 0) > 0.65;
        const direction = up ? 1 : down ? 2 : left ? 3 : right ? 4 : 0;
        if (direction && (direction !== lastDirection || time - lastTime > 280)) {
          moveFocus(direction === 1 ? 'up' : direction === 2 ? 'down' : direction === 3 ? 'left' : 'right');
          lastTime = time;
        }
        lastDirection = direction;
        const confirm = Boolean(pad.buttons[0]?.pressed);
        if (confirm && !lastConfirm && document.activeElement instanceof HTMLElement) document.activeElement.click();
        lastConfirm = confirm;
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, []);

  const changeChannel = (delta: number) => {
    if (!visible.length) return;
    const next = (currentIndex < 0 ? (delta > 0 ? 0 : visible.length - 1) : (currentIndex + delta + visible.length) % visible.length);
    if (next >= count) setCount(Math.ceil((next + 1) / 60) * 60);
    choose(visible[next]);
  };
  return (
    <div className="tv-shell min-h-screen bg-[#07090f] text-white" onKeyDown={e => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'PageUp') { e.preventDefault(); changeChannel(-1); }
      if (e.key === 'PageDown') { e.preventDefault(); changeChannel(1); }
    }}>
      <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-10 sm:py-9">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-black tracking-tight sm:text-4xl">📺 تلویزیون زنده</h1><p className="mt-1 text-xs text-zinc-400">جهت‌ها: حرکت · Enter / X: انتخاب · PageUp / PageDown: تعویض کانال</p>{controllerReady && <p className="mt-1 text-xs text-emerald-400">دسته توسط مرورگر شناسایی شد</p>}</div>
          <Link to="/" className="tv-focus rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-zinc-200 hover:bg-white/10">← خانه</Link>
        </header>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="دسته‌های سریع">
          {([["all","همه"],["sports","ورزشی"],["news","خبری"],["movies","فیلم"],["music","موسیقی"],["documentary","مستند"],["kids","کودکان"]] as const).filter(([id]) => id === "all" || categoryCounts.some(([cat]) => cat === id)).map(([id,label]) => (
            <button key={id} type="button" aria-pressed={category===id} onClick={() => {setCategory(id);setCount(60);}} className={`tv-focus shrink-0 rounded-2xl border px-5 py-3 text-sm font-bold transition-colors ${category === id ? "border-violet-400 bg-violet-600 text-white shadow-lg shadow-violet-900/20" : "border-white/10 bg-[#161b29] text-zinc-300 hover:bg-[#252b3b]"}`}>{label}</button>
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(320px,370px)_minmax(0,1fr)]">
          <aside className="order-2 min-w-0 rounded-[1.75rem] border border-white/10 bg-[#121726] p-4 shadow-2xl shadow-black/20 xl:order-1">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-bold">کانال‌ها <span className="text-xs text-zinc-400">({visible.length.toLocaleString('fa-IR')})</span></h2>
              <button type="button" onClick={() => { setOnlyFav(v => !v); setCount(60); }} aria-pressed={onlyFav} className={`tv-focus rounded-lg px-3 py-2 text-xs ${onlyFav ? 'bg-violet-600' : 'bg-white/10'}`}>♥ علاقه‌مندی‌ها</button>
            </div>
            <button type="button" className="tv-focus mb-3 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold" aria-expanded={showCategories} onClick={() => setShowCategories(v => !v)}>🗂️ دسته‌بندی: {category === "all" ? "همه کانال‌ها" : (FA_CATEGORIES[category] ?? category)} <span>{showCategories ? "−" : "+"}</span></button>
            {showCategories && <div className="mb-3 flex gap-2 overflow-x-auto pb-2" aria-label="دسته‌بندی کانال‌ها">
              <button type="button" className={`tv-focus shrink-0 rounded-xl px-4 py-3 text-sm font-bold ${category === 'all' ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-300'}`} aria-pressed={category === 'all'} onClick={() => {setCategory('all');setCount(60);}}>همه</button>
              {categoryCounts.map(([id, total]) => <button key={id} type="button" aria-pressed={category === id} className={`tv-focus shrink-0 rounded-xl px-4 py-3 text-sm font-bold ${category === id ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-300'}`} onClick={() => {setCategory(id);setCount(60);}}>{FA_CATEGORIES[id] ?? id} <span className="text-xs opacity-70">{total.toLocaleString('fa-IR')}</span></button>)}
            </div>}
            <input type="search" value={filter} onChange={e => { setFilter(e.target.value); setCount(60); }} placeholder="جستجوی کانال واقعی…" aria-label="جستجوی کانال" className="tv-focus mb-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm" />
            <div className="tv-list max-h-[42vh] space-y-1.5 overflow-y-auto xl:max-h-[67vh]">
              {visible.slice(0, count).map(ch => <div key={ch.id} className="flex items-center gap-1">
                <button type="button" onClick={() => choose(ch)} className={`tv-focus flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-3.5 text-right transition-all ${ch.id === selectedId ? 'bg-violet-600/25 ring-2 ring-violet-400/80 shadow-lg' : 'bg-white/[0.025] hover:bg-white/10'}`}>
                  <ChannelLogo name={ch.name} url={logoMap.get(ch.id)} className="h-12 w-12 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{ch.name}</span>
                </button>
                <button type="button" onClick={() => toggleFav(ch.id)} aria-label={favorites.has(ch.id) ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'} className="tv-focus rounded-lg p-3 text-lg" >{favorites.has(ch.id) ? '♥' : '♡'}</button>
              </div>)}
              {visible.length > count && <button type="button" onClick={() => setCount(n => n + 60)} className="tv-focus w-full rounded-xl bg-violet-600/20 p-3 text-sm">نمایش کانال‌های بیشتر</button>}
              {visible.length === 0 && <p className="p-5 text-center text-sm text-zinc-400">کانالی با این مشخصات پیدا نشد. دسته یا جستجو را تغییر بده.</p>}
            </div>
          </aside>
          <main className="order-1 min-w-0 space-y-4 xl:order-2">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-2xl shadow-black/50">
              {selected && activeSource ? <VideoPlayer key={selected.id} url={activeSource.url} title={selected.name} /> : <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,rgba(104,65,195,.20),transparent_70%)] text-center text-zinc-300"><span className="text-5xl">📡</span><p className="px-5">از لیست کناری یک کانال انتخاب کن و تماشا رو شروع کن</p></div>}
            </div>
            {selected && <section className="rounded-[1.75rem] border border-white/10 bg-[#121726] p-5 shadow-xl shadow-black/20 sm:p-7" aria-label="جزئیات کانال">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <ChannelLogo name={selected.name} url={logoMap.get(selected.id)} className="h-12 w-12" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-black text-white sm:text-2xl">{selected.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                    {selected.country && <span className="rounded-lg bg-white/5 px-2 py-1">{selected.country}</span>}
                    {selected.categories.slice(0, 2).map(cat => <span key={cat} className="rounded-lg bg-violet-500/10 px-2 py-1 text-violet-200">{FA_CATEGORIES[cat] ?? cat}</span>)}
                  </div>
                </div>
                <button type="button" onClick={() => toggleFav(selected.id)} aria-pressed={favorites.has(selected.id)} className="tv-focus rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-100" aria-label={favorites.has(selected.id) ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}>
                  {favorites.has(selected.id) ? '♥ ذخیره شده' : '♡ علاقه‌مندی'}
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => changeChannel(-1)} className="tv-focus rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10">→ کانال قبلی</button>
                <button type="button" onClick={() => changeChannel(1)} className="tv-focus rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10">کانال بعدی ←</button>
              </div>
              <div className="mt-5 border-t border-white/10 pt-5">
                <button type="button" onClick={() => setGuideOpen(v => !v)} aria-expanded={guideOpen} className="tv-focus flex w-full items-center justify-between rounded-xl py-2 text-right text-sm font-bold text-white">
                  <span>📅 الان چی پخش می‌شه؟</span>
                  <span className="text-xs text-violet-300">{guideOpen ? 'بستن −' : 'نمایش +'}</span>
                </button>
                {guideOpen && <div className="mt-3"><EPGGuide channelId={selected.id} fallbackUrl={guideMap.get(selected.id)} /></div>}
              </div>
            </section>}
          </main>
        </div>
      </div>
    </div>
  );
}
