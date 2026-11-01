import veloraSymbol from './assets/velora-symbol.svg?raw';
import settingsSymbol from './assets/settings-symbol.svg?raw';
const paths: Record<string, string> = {
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  microphone:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
  brush:'<path d="m10 15 8-11q3-3 3 1l-9 12m-2-2c-6-2-4 6-8 5 5 3 11 1 10-3z"/>',
  video:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" fill="currentColor" fill-opacity=".18"/><path d="M4 10h16"/>',
  file:'<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
  notes:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 8h8m-8 4h8m-8 4h5"/>',
  music:'<path d="M10 17V6l10-2v11M10 9l10-2"/><ellipse cx="7" cy="18" rx="3" ry="2.5" fill="currentColor"/><ellipse cx="17" cy="16" rx="3" ry="2.5" fill="currentColor"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="15.5" cy="9" r="1.5" fill="currentColor"/><path d="m4 17 5-6 4 4 3-3 4 5"/>',
  calculator:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 7h8M9 12h1m4 0h1m-6 4h1m4 0h1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  sliders: '<path d="M4 7h16M4 17h16"/><rect x="7" y="4" width="4" height="6" rx="2" fill="currentColor"/><rect x="14" y="14" width="4" height="6" rx="2" fill="currentColor"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  keyboard: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h.1M10 9h.1M14 9h.1M18 9h.1M6 12h.1M10 12h.1M14 12h.1M18 12h.1M7 15h10"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  expand: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-12 4h.1m5 0h.1"/>',
  power: '<path d="M12 2v10m-6-8a9 9 0 1 0 12 0"/>',
  grid: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="15" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/>',
  welcome: '<path d="m4 5 7 15h3L8 5H4Zm12 0h4l-6 15h-4l6-15Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  close: '<path d="m7 7 10 10M7 17 17 7"/>',
  replay: '<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',
  leaf: '<path d="M20 4c-1 11-4 15-9 15a6 6 0 0 1-6-6c0-5 4-8 15-9Z"/><path d="m4 21 10-11"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
export function icon(name: string, className = ''): string {
  if (name === 'settings') return settingsSymbol;
  if (name === 'welcome') return veloraSymbol.replace('brand-mark','icon');
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.info}</svg>`;
}
export const mark = veloraSymbol;
