import { useEffect, useState } from 'react';

type Programme = { title: string; start: number; stop: number };
const programmeCache = new Map<string, { time: number; items: Programme[] }>();
const CACHE_MS = 10 * 60 * 1000;

function parseTime(value: string | null): number {
  if (!value) return NaN;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{4})?/);
  if (!match) return NaN;
  const [, y, mo, d, h, mi, sec, zone] = match;
  const timestamp = Date.UTC(+y, +mo - 1, +d, +h, +mi, +(sec || 0));
  if (!zone) return timestamp;
  const sign = zone[0] === '+' ? 1 : -1;
  return timestamp - sign * (+zone.slice(1, 3) * 60 + +zone.slice(3, 5)) * 60000;
}

export default function EPGGuide({ channelId, fallbackUrl }: { channelId: string; fallbackUrl?: string }) {
  const [items, setItems] = useState<Programme[]>([]);
  const [status, setStatus] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const source = localStorage.getItem('stv:xmltv-url')?.trim() || fallbackUrl;
    if (!source) { setStatus('برنامه‌های این کانال هنوز در دسترس نیست.'); setItems([]); return; }
    const cacheKey = source + '::' + channelId;
    const cached = programmeCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_MS) {
      setItems(cached.items);
      setStatus(cached.items.length ? '' : 'جدول پخش این کانال هنوز منتشر نشده است.');
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setStatus('در حال دریافت زمان‌بندی واقعی…');
    fetch(source, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.text(); })
      .then(xml => {
        const doc = new DOMParser().parseFromString(xml, 'text/xml');
        if (doc.querySelector('parsererror')) throw new Error('XML نامعتبر');
        const programmes = Array.from(doc.getElementsByTagName('programme'))
          .filter(node => node.getAttribute('channel') === channelId)
          .map(node => ({
            title: node.getElementsByTagName('title')[0]?.textContent?.trim() || '',
            start: parseTime(node.getAttribute('start')),
            stop: parseTime(node.getAttribute('stop')),
          }))
          .filter(item => item.title && Number.isFinite(item.start) && Number.isFinite(item.stop))
          .sort((a, b) => a.start - b.start);
        if (cancelled) return;
        programmeCache.set(cacheKey, { time: Date.now(), items: programmes });
        setItems(programmes);
        setStatus(programmes.length ? '' : 'جدول پخش این کانال هنوز منتشر نشده است.');
      })
      .catch(() => { if (!cancelled) { setItems([]); setStatus('اطلاعات برنامه‌های این کانال فعلاً در دسترس نیست.'); } });
    return () => { cancelled = true; controller.abort(); };
  }, [channelId, fallbackUrl]);

  const current = items.find(item => item.start <= now && item.stop > now);
  const next = items.find(item => item.start > now);
  const format = (time: number) => new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(time);

  return (
    <div className="space-y-2 text-xs text-zinc-300">
      {status && <p className="leading-6 text-zinc-400">{status}</p>}
      {current && <div className="rounded-lg bg-emerald-500/10 p-3"><span className="font-bold text-emerald-300">اکنون</span><p className="mt-1">{current.title} · {format(current.start)} تا {format(current.stop)}</p></div>}
      {next && <div className="rounded-lg bg-white/5 p-3"><span className="font-bold text-violet-300">برنامه بعدی</span><p className="mt-1">{next.title} · {format(next.start)}</p></div>}
    </div>
  );
}
