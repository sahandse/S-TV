import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface Props {
  url: string;
  title: string;
}

export default function VideoPlayer({ url, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [requiresTap, setRequiresTap] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setStatus('loading');
    setErrorMsg('');
    setRequiresTap(false);
    hlsRef.current?.destroy();
    hlsRef.current = null;
    video.pause();
    video.removeAttribute('src');
    video.load();

    const startPlayback = () => video.play().catch(() => { setStatus('playing'); setRequiresTap(true); });
    const onError = (msg: string) => {
      setStatus('error');
      setErrorMsg(msg);
    };

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true, debug: false });
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        startPlayback();
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) onError('خطا در بارگذاری پخش. این کانال ممکن است آفلاین یا محدود باشد.');
      });

      hls.attachMedia(video);
      hls.loadSource(url);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      const onLoaded = () => { setStatus('playing'); startPlayback(); };
      const onErr = () => onError('خطا در بارگذاری پخش.');
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('error', onErr, { once: true });
      return () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onErr);
      };
    } else {
      onError('مرورگر شما از پخش HLS پشتیبانی نمی‌کند.');
    }

    return () => { video.pause(); hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [url, retryKey]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-3">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">در حال اتصال به پخش…</p>
        </div>
      )}

      {requiresTap && status === 'playing' && (
        <button type="button" onClick={() => { videoRef.current?.play().then(() => setRequiresTap(false)).catch(() => {}); }} className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-base font-bold text-white">▶ برای شروع پخش لمس کنید</button>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6">
          <div className="text-5xl">📡</div>
          <p className="text-zinc-300 text-sm text-center max-w-xs leading-relaxed">{errorMsg}</p>
          <button onClick={() => setRetryKey(v => v + 1)} className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500">تلاش دوباره برای پخش</button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 text-xs underline underline-offset-2"
          >
            باز کردن مستقیم پخش ↗
          </a>
        </div>
      )}

      <video ref={videoRef} controls className="w-full h-full" playsInline aria-label={title} onPlaying={() => setStatus('playing')} />
    </div>
  );
}
