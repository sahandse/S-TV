import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIPTV } from '../context/IPTVContext';
import { useUser } from '../context/UserContext';
import VideoPlayer from '../components/VideoPlayer';
import EPGGuide from '../components/EPGGuide';
import ChannelLogo from '../components/ChannelLogo';
import type { Channel } from '../types';

export default function TV() {
  const navigate = useNavigate();
  const { channels, streamMap, streamsByChannel, logoMap, guideMap } = useIPTV();
  const { favorites, addRecent, toggleFav } = useUser();
  const [filter, setFilter] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [count, setCount] = useState(60);
  const [controllerReady, setControllerReady] = useState(false);
  const available = useMemo(() => channels.filter(ch => streamMap.has(ch.id)), [channels, streamMap]);
  const visible = useMemo(() => available.filter(ch =>
    (!onlyFav || favorites.has(ch.id)) &&
    (!filter.trim() || ch.name.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()))
  ), [available, favorites, onlyFav, filter]);
  const selected: Channel | undefined = available.find(ch => ch.id === selectedId);
  const sourceList = selected ? streamsByChannel.get(selected.id) ?? [] : [];
  const activeSource = sourceList.find(s => s.url === selectedSource) ?? (selected ? streamMap.get(selected.id) : undefined);
  const choose = (ch: Channel) => {
    setSelectedId(ch.id);
    setSelectedSource(streamMap.get(ch.id)?.url ?? '');
    setGuideOpen(false);
    addRecent(ch.id);
  };
  const currentIndex = visible.findIndex(ch => ch.id === selectedId);
  useEffect(() => {
    const isTyping = (target: EventTarget | null) => target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      const focusables = Array.from(document.querySelectorAll<HTMLElement>('.tv-shell .tv-focus:not([disabled])'));
      const current = focusables.indexOf(document.activeElement as HTMLElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const next = focusables[(current + (event.key === 'ArrowDown' || event.key === 'ArrowLeft' ? 1 : -1) + focusables.length) % focusables.length];
        next?.focus();
        next?.scrollIntoView({block: 'nearest'});
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
        const direction = down ? 1 : up ? -1 : 0;
        if (direction && (direction !== lastDirection || time - lastTime > 280)) {
          const options = Array.from(document.querySelectorAll<HTMLElement>('.tv-shell .tv-focus'));
          const active = options.indexOf(document.activeElement as HTMLElement);
          options[(active + direction + options.length) % options.length]?.focus();
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
    const next = (currentIndex + delta + visible.length) % visible.length;
    choose(visible[next]);
  };
  return (
    <div className="tv-shell min-h-screen bg-[#080a13] text-white" onKeyDown={e => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'PageUp') { e.preventDefault(); changeChannel(-1); }
      if (e.key === 'PageDown') { e.preventDefault(); changeChannel(1); }
    }}>
      <div className="mx-auto max-w-[1800px] px-3 py-4 sm:px-7 sm:py-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-black sm:text-4xl">📺 تلویزیون زنده</h1><p className="mt-1 text-xs text-zinc-400">جهت‌ها: حرکت · Enter / X: انتخاب · PageUp / PageDown: تعویض کانال</p>{controllerReady && <p className="mt-1 text-xs text-emerald-400">دسته توسط مرورگر شناسایی شد</p>}</div>
          <Link to="/" className="tv-focus rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-zinc-200">بازگشت به خانه</Link>
        </header>
        <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
          <aside className="order-2 min-w-0 rounded-2xl border border-white/10 bg-[#111522] p-3 lg:order-1">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-bold">کانال‌ها <span className="text-xs text-zinc-400">({visible.length.toLocaleString('fa-IR')})</span></h2>
              <button type="button" onClick={() => { setOnlyFav(v => !v); setCount(60); }} aria-pressed={onlyFav} className={`tv-focus rounded-lg px-3 py-2 text-xs ${onlyFav ? 'bg-violet-600' : 'bg-white/10'}`}>♥ علاقه‌مندی‌ها</button>
            </div>
            <input type="search" value={filter} onChange={e => { setFilter(e.target.value); setCount(60); }} placeholder="جستجوی کانال واقعی…" aria-label="جستجوی کانال" className="tv-focus mb-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm" />
            <div className="tv-list max-h-[52vh] space-y-1 overflow-y-auto lg:max-h-[65vh]">
              {visible.slice(0, count).map(ch => <div key={ch.id} className="flex items-center gap-1">
                <button type="button" onClick={() => choose(ch)} className={`tv-focus flex min-w-0 flex-1 items-center gap-3 rounded-xl p-3 text-right transition-colors ${ch.id === selectedId ? 'bg-violet-600/35 ring-1 ring-violet-400' : 'hover:bg-white/10'}`}>
                  <ChannelLogo name={ch.name} url={logoMap.get(ch.id)} className="h-10 w-10 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{ch.name}</span>
                </button>
                <button type="button" onClick={() => toggleFav(ch.id)} aria-label={favorites.has(ch.id) ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'} className="tv-focus rounded-lg p-3 text-lg" >{favorites.has(ch.id) ? '♥' : '♡'}</button>
              </div>)}
              {visible.length > count && <button type="button" onClick={() => setCount(n => n + 60)} className="tv-focus w-full rounded-xl bg-violet-600/20 p-3 text-sm">نمایش کانال‌های بیشتر</button>}
              {visible.length === 0 && <p className="p-5 text-center text-sm text-zinc-400">کانالی با این مشخصات پیدا نشد.</p>}
            </div>
          </aside>
          <main className="order-1 min-w-0 space-y-4 lg:order-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
              {selected && activeSource ? <VideoPlayer key={selected.id} url={activeSource.url} title={selected.name} /> : <div className="flex aspect-video flex-col items-center justify-center gap-3 text-center text-zinc-300"><span className="text-5xl">📡</span><p className="px-5">یک کانال از فهرست انتخاب کنید</p></div>}
            </div>
            {selected && <div className="rounded-2xl border border-white/10 bg-[#111522] p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0"><h2 className="truncate text-xl font-bold">{selected.name}</h2><p className="mt-1 text-xs text-zinc-400">منابع موجود: {sourceList.length.toLocaleString('fa-IR')} — وجود لینک به معنی پخش قطعی نیست</p></div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => changeChannel(-1)} className="tv-focus rounded-xl border border-white/10 px-4 py-3">قبلی</button>
                  <button type="button" onClick={() => changeChannel(1)} className="tv-focus rounded-xl border border-white/10 px-4 py-3">بعدی</button>
                </div>
              </div>
              {sourceList.length > 1 && <label className="mt-4 block text-xs text-zinc-300">انتخاب منبع واقعی<select value={activeSource?.url ?? ''} onChange={e => setSelectedSource(e.target.value)} className="tv-focus mt-2 block w-full rounded-xl border border-white/10 bg-[#1d2334] p-3 text-sm">{sourceList.map((source, index) => <option value={source.url} key={source.url}>{'منبع ' + (index + 1) + (source.quality ? ' • ' + source.quality : '')}</option>)}</select></label>}
              <button type="button" onClick={() => setGuideOpen(v => !v)} aria-expanded={guideOpen} className="tv-focus mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-right text-sm font-bold">📅 راهنمای برنامه‌ها {guideOpen ? '−' : '+'}</button>
              {guideOpen && <div className="mt-3"><EPGGuide channelId={selected.id} fallbackUrl={guideMap.get(selected.id)} /></div>}
            </div>}
          </main>
        </div>
      </div>
    </div>
  );
}
