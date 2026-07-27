// Tiny dependency-free toast — usable from anywhere (hooks, plain functions),
// no React provider required. Renders a styled pill bottom-center that fades
// out on its own. Used to replace jarring browser alert()s (e.g. payment errors).

type ToastType = 'error' | 'success' | 'info';

const BG: Record<ToastType, string> = {
  error: '#b91c1c',
  success: '#15803d',
  info: '#211A0D',
};

export function showToast(message: string, opts: { type?: ToastType; duration?: number } = {}): void {
  if (typeof document === 'undefined') return;
  const { type = 'info', duration = 4200 } = opts;

  let host = document.getElementById('__app_toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = '__app_toasts';
    host.style.cssText =
      'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;' +
      'display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
    document.body.appendChild(host);
  }

  const el = document.createElement('div');
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.textContent = message;
  el.style.cssText =
    `pointer-events:auto;max-width:90vw;padding:12px 22px;border-radius:9999px;` +
    `font:600 14px/1.35 system-ui,-apple-system,sans-serif;color:#fff;background:${BG[type]};` +
    `box-shadow:0 10px 30px rgba(0,0,0,0.28);opacity:0;transform:translateY(10px);` +
    `transition:opacity .25s ease,transform .25s ease;`;
  host.appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
