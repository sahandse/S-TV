import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const [compact, setCompact] = useState(() => localStorage.getItem('stv:compact') === 'true');
  const [cleared, setCleared] = useState(false);
  const [xmltv, setXmltv] = useState(() => localStorage.getItem('stv:xmltv-url') ?? '');
  const [saved, setSaved] = useState(false);

  const updateCompact = (checked: boolean) => {
    setCompact(checked);
    localStorage.setItem('stv:compact', String(checked));
    document.documentElement.classList.toggle('compact-mode', checked);
  };

  const clearCache = () => {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('s-tv:')) sessionStorage.removeItem(key);
    }
    setCleared(true);
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 pb-28 sm:px-6">
      <div className="mb-8">
        <Link to="/" className="text-sm text-violet-400 hover:text-violet-300">→ بازگشت به خانه</Link>
        <h1 className="mt-4 text-3xl font-black text-white">تنظیمات</h1>
        <p className="mt-2 text-sm text-zinc-400">ظاهر و اطلاعات ذخیره‌شده در همین دستگاه</p>
      </div>
      <section className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <h2 className="font-bold text-white">منبع برنامه‌های تلویزیونی (XMLTV)</h2>
          <p className="mt-1 text-xs leading-6 text-zinc-400">نشانی فایل XMLTV معتبر را وارد کنید. فقط برنامه‌های موجود در منبع و با شناسه دقیق کانال نمایش داده می‌شوند. سرور باید دسترسی CORS را مجاز کرده باشد.</p>
          <input dir="ltr" type="url" value={xmltv} onChange={e => {setXmltv(e.target.value);setSaved(false);}} placeholder="https://example.org/guide.xml" className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white" />
          <button type="button" onClick={() => { const v = xmltv.trim(); if (v && !/^https:\/\//i.test(v)) { setSaved(false); return; } if(v) localStorage.setItem('stv:xmltv-url',v); else localStorage.removeItem('stv:xmltv-url'); setSaved(true); }} className="mt-3 rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white">ذخیره منبع</button>
          {saved && <p className="mt-2 text-xs text-emerald-300">تنظیمات ذخیره شد؛ راهنمای کانال را دوباره باز کنید.</p>}
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <div>
            <h2 className="font-bold text-white">حالت فشرده کارت‌ها</h2>
            <p className="mt-1 text-xs text-zinc-400">کاهش ارتفاع تصویر کارت‌ها برای مشاهده کانال‌های بیشتر</p>
          </div>
          <input type="checkbox" aria-label="حالت فشرده کارت‌ها" checked={compact} onChange={e => updateCompact(e.target.checked)} className="h-5 w-5 accent-violet-500" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <h2 className="font-bold text-white">به‌روزرسانی اطلاعات کانال‌ها</h2>
          <p className="mt-1 text-xs leading-6 text-zinc-400">پاک‌سازی کش فقط روی فهرست کانال‌ها اثر می‌گذارد؛ علاقه‌مندی‌ها حذف نمی‌شوند. برای دریافت اطلاعات جدید، صفحه را مجدداً بارگذاری کنید.</p>
          <button onClick={() => { clearCache(); window.location.reload(); }} className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500">دریافت دوباره اطلاعات</button>
          {cleared && <p className="mt-2 text-xs text-emerald-400">کش پاک شد</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <h2 className="font-bold text-white">مصرف اینترنت</h2>
          <p className="mt-1 text-xs leading-6 text-zinc-400">پخش زنده از سرویس‌های اصلی انجام می‌شود. مصرف اینترنت به کیفیت و منبع انتخابی وابسته است؛ در صورت موجود بودن چند منبع می‌توانید از پنجره پخش آن‌ها را تغییر دهید.</p>
        </div>
      </section>
    </div>
  );
}
