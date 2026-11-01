export type Theme = 'light' | 'dark' | 'system';
export interface Preferences {
  theme: Theme; accent: string; wallpaper: 'aurora' | 'dusk' | 'sand' | 'custom';
  dockPosition: 'bottom' | 'left' | 'right'; dockSize: number; dockHide: boolean;
  motion: boolean; transparency: boolean; recent: string[];
}
export const accents = ['#3579ed', '#8061d9', '#187d69', '#b75274', '#a96524'];
export const defaults: Preferences = { theme:'light', accent:accents[0], wallpaper:'aurora', dockPosition:'bottom', dockSize:52, dockHide:false, motion:false, transparency:false, recent:[] };
export function sanitizePreferences(value: unknown): Preferences {
  const v = value && typeof value === 'object' ? value as Record<string,unknown> : {};
  return {
    theme: ['light','dark','system'].includes(String(v.theme)) ? v.theme as Theme : defaults.theme,
    accent: accents.includes(String(v.accent)) ? String(v.accent) : defaults.accent,
    wallpaper: ['aurora','dusk','sand','custom'].includes(String(v.wallpaper)) ? v.wallpaper as Preferences['wallpaper'] : 'aurora',
    dockPosition: ['bottom','left','right'].includes(String(v.dockPosition)) ? v.dockPosition as Preferences['dockPosition'] : 'bottom',
    dockSize: typeof v.dockSize === 'number' && Number.isFinite(v.dockSize) ? Math.min(64,Math.max(36,Math.round(v.dockSize))) : 52,
    dockHide: v.dockHide === true, motion: v.motion === true, transparency:v.transparency === true,
    recent: Array.isArray(v.recent) ? [...new Set(v.recent.filter(x=>['welcome','about','settings'].includes(x)))].slice(0,3) : [],
  };
}
export function addRecent(recent: string[], app: string): string[] { return [app,...recent.filter(id=>id!==app)].slice(0,3); }
