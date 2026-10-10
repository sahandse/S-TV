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
    navigator.serviceWorker.register('/S-TV/sw.js').catch(() => {});
  });
}
