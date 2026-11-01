/** One minute-aligned timer; suspend it when the document is hidden. */
export function startClock(): { pause: () => void; resume: () => void } {
  let running = true;
  let timer: ReturnType<typeof setTimeout>;
  const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  function tick(): void {
    clearTimeout(timer);
    if (!running) return;
    const now = new Date();
    document.querySelectorAll<HTMLElement>('[data-clock]').forEach(el => { el.textContent = time.format(now); });
    document.querySelectorAll<HTMLElement>('[data-date]').forEach(el => { el.textContent = date.format(now); });
    document.querySelectorAll<HTMLElement>('[data-short-date]').forEach(el => { el.textContent = shortDate.format(now); });
    document.dispatchEvent(new Event('velora:tick'));
    if (!document.hidden) timer = setTimeout(tick, 60000 - Date.now() % 60000 + 50);
  }
  document.addEventListener('visibilitychange', tick);
  tick();
  return { pause: () => { running = false; clearTimeout(timer); }, resume: () => { running = true; tick(); } };
}
