import { icon, mark } from './icons';
import { settingsContent } from './settings';
export type AppId = 'welcome' | 'about' | 'settings' | 'files' | 'notes' | 'music' | 'gallery' | 'calculator' | 'paint' | 'calendar' | 'video' | 'clock' | 'recorder';
export type GuideTab = 'start' | 'controls' | 'about';
export const apps: { id: AppId; name: string; description: string; icon: string }[] = [
  { id: 'welcome', name: 'Welcome', description: 'Get started with Velora', icon: 'welcome' },
  { id: 'settings', name: 'Settings', description: 'Personalize theme, accent, wallpaper and dock', icon: 'settings' },
  { id:'files',name:'Files',description:'Explore and import local files',icon:'folder' },
  { id:'notes',name:'Notepad',description:'Notes · Write and autosave text documents',icon:'notes' },
  { id:'music',name:'Music',description:'Play local songs and audio',icon:'music' },
  { id:'gallery',name:'Gallery',description:'Browse local images and photos',icon:'image' },
  { id:'calculator',name:'Calculator',description:'Calculate arithmetic expressions',icon:'calculator' },
  { id:'calendar',name:'Calendar',description:'Month planner and local events',icon:'calendar' },
  { id:'paint',name:'Paint',description:'Sketch and save PNG drawings',icon:'brush' },
  { id:'video',name:'Video Player',description:'Play local movies and clips',icon:'video' },
  { id:'clock',name:'Clock',description:'Stopwatch and countdown timer',icon:'clock' },
  { id:'recorder',name:'Sound Recorder',description:'Record voice memos using your microphone',icon:'microphone' },
  { id: 'about', name: 'About Velora', description: 'System information', icon: 'info' },
];
export function appContent(id: AppId, tab: GuideTab = 'start'): string {
  if (!['welcome','settings','about'].includes(id)) return '';
  if (id === 'settings') return settingsContent();
  const selected = id === 'about' ? 'about' : tab;
  const content = selected === 'about' ? `
    <div class="system-logo">${mark}</div><h1>Velora</h1><p class="version-label">Version 0.3.0 · First Light</p>
    <dl class="system-details"><div><dt>Environment</dt><dd>Browser workspace</dd></div><div><dt>Release</dt><dd>Checkpoint 03</dd></div><div><dt>Creator</dt><dd>Pasindu Wijesekara</dd></div></dl>
    <p class="boundary">Velora runs inside your browser. System controls affect this workspace only. The lock screen is a visual cover, not password protection.</p><p class="boundary">Files, music and offline installation will arrive in later checkpoints.</p>` : selected === 'controls' ? `
    <h1>Desktop controls</h1><p class="page-description">A few familiar ways to get around.</p>
    <div class="instruction-list"><div>${icon('grid')}<span><strong>Open an app</strong><small>Use the dock, Apps menu or a desktop shortcut.</small></span></div><div>${icon('close')}<span><strong>Return to the desktop</strong><small>Close with ×; minimize with −; maximize with □.</small></span></div><div>${icon('sliders')}<span><strong>Adjust your workspace</strong><small>Open the controls at the top right for full screen and display options.</small></span></div><div>${icon('keyboard')}<span><strong>Use your keyboard</strong><small>Tab moves focus; arrows on a title bar move its window. Use the bottom-right resize handle with arrows to resize.</small></span></div></div><div class="inline-note">Ctrl + Alt + K opens commands. Ctrl + Alt + Space searches apps. Ctrl + Alt + Tab opens the window switcher. Ctrl + Alt + arrows snaps or restores. Shift-click a dock icon for another window.</div>` : `
    <div class="welcome-symbol">${mark}</div><h1>Welcome to Velora</h1><p class="page-description">Your desktop is ready.</p>
    <div class="action-list"><button data-guide="controls">${icon('grid')}<span><strong>Learn the basics</strong><small>Apps, dock and keyboard controls</small></span>${icon('chevron')}</button><button data-action="controls">${icon('sliders')}<span><strong>Desktop controls</strong><small>Full screen and display options</small></span>${icon('chevron')}</button><button data-app="about">${icon('info')}<span><strong>About this system</strong><small>Velora · First Light</small></span>${icon('chevron')}</button></div>
    <button class="primary" data-action="close-window">Start using Velora ${icon('arrow')}</button>`;
  return `<div class="utility-layout"><aside class="utility-sidebar"><div class="sidebar-caption">VELORA</div><nav aria-label="Welcome sections">${[['start','welcome','Get started'],['controls','keyboard','Desktop controls'],['about','info','About Velora']].map(([value,glyph,label])=>`<button data-guide="${value}" ${selected===value?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></button>`).join('')}</nav><div class="sidebar-bottom">${mark}<span>First Light<small>System preview</small></span></div></aside><section class="utility-content ${selected==='about'?'about-content':''}">${content}</section></div>`;
}
