import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

document.documentElement.classList.toggle('compact-mode', localStorage.getItem('stv:compact') === 'true');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded) {
        reloaded = true;
        window.location.reload();
      }
    });
    navigator.serviceWorker.register('/S-TV/sw.js', { updateViaCache: 'none' })
      .then(registration => registration.update())
      .catch(() => {});
  });
}
