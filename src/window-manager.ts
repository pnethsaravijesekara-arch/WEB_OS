import { apps, appContent, type AppId, type GuideTab } from './apps';
import { syncSettings } from './settings';
import { icon } from './icons';
import { clampRect, placementRect, resized, type Rect, type Placement } from './geometry';

export interface ManagedWindow {
  id: number; app: AppId; title: string; element: HTMLElement; rect: Rect;
  normal: Rect; mode: Placement; minimized: boolean; animation?: Animation;
}
interface Options { host: HTMLElement; reduced: () => boolean; changed: () => void; beforeFocus: () => void; announce: (text: string) => void }
export class WindowManager {
  windows: ManagedWindow[] = [];
  active: number | null = null;
  private serial = 0;
  private options: Options;
  private snapPreview: HTMLElement;
  private cancelGesture: (() => void) | null = null;
  constructor(options: Options) {
    this.options = options;
    this.snapPreview = document.createElement('div');
    this.snapPreview.className = 'snap-preview'; this.snapPreview.hidden = true;
    this.snapPreview.setAttribute('aria-hidden', 'true'); options.host.append(this.snapPreview);
    const reflow = () => {
      this.cancelGesture?.();
      for (const w of this.windows) { w.normal = clampRect(w.normal, this.area()); w.rect = w.mode === 'normal' ? clampRect(w.rect, this.area()) : placementRect(w.mode, this.area()); this.paint(w); }
    };
    window.addEventListener('resize', reflow);
    document.addEventListener('velora:layout', reflow);
  }
  private area(): Rect {
    const dock=document.querySelector<HTMLElement>('.dock');
    const position=innerWidth<=600?'bottom':document.documentElement.dataset.dock??'bottom';
    const side=position==='bottom'?0:(dock?.offsetWidth??80)+24;
    return {x:position==='left'?side:8,y:42,width:Math.max(1,innerWidth-16-side),height:Math.max(1,innerHeight-42-(position==='bottom'?(dock?.offsetHeight??80)+30:8))};
  }
  private paint(w: ManagedWindow): void {
    Object.assign(w.element.style, { left: `${w.rect.x}px`, top: `${w.rect.y}px`, width: `${w.rect.width}px`, height: `${w.rect.height}px` });
    w.element.dataset.placement = w.mode;
    w.element.querySelector('[data-window-action="maximize"]')!.setAttribute('aria-label', w.mode === 'maximized' ? 'Restore window' : 'Maximize window');
  }
  private animate(w: ManagedWindow, exiting = false, done?: () => void): void {
    w.animation?.cancel();
    if (this.options.reduced()) { done?.(); return; }
    const tile = document.querySelector<HTMLElement>(`.dock-button[data-app="${w.app}"]`)?.getBoundingClientRect();
    w.element.style.transformOrigin = tile ? `${tile.x + tile.width / 2 - w.rect.x}px ${tile.y - w.rect.y}px` : '50% 100%';
    // Keep opening hit targets stationary so immediate clicks remain reliable.
    const frames = [{ opacity: 0, transform: exiting ? 'scale(.88)' : 'scale(1)' }, { opacity: 1, transform: 'scale(1)' }];
    const animation = w.element.animate(exiting ? frames.reverse() : frames, { duration: exiting ? 130 : 240, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    w.animation = animation;
    animation.onfinish = () => { done?.(); animation.cancel(); if (w.animation === animation) w.animation = undefined; };
  }
  get(id: number | null): ManagedWindow | undefined { return this.windows.find(w => w.id === id); }
  open(app: AppId): void {
    const definition = apps.find(item => item.id === app); if (!definition) return;
    const id = ++this.serial, offset = (this.windows.length % 6) * 30;
    const area = this.area();
    const width=app==='settings'?820:700,height=app==='settings'?580:500;
    const rect = clampRect({ x: Math.max(20, (area.width - 700) / 2 - 70) + offset, y: 72 + offset, width, height }, area);
    const element = document.createElement('section');
    element.className = 'app-window'; element.dataset.window = String(id);
    element.setAttribute('aria-labelledby', `title-${id}`);
    element.innerHTML = `<header class="window-titlebar" tabindex="0" aria-label="Move ${definition.name} window ${id}; use arrow keys"><span class="window-identity">${icon(definition.icon)}<strong id="title-${id}">${definition.name} <span class="instance-number">${id}</span></strong></span><div class="window-actions"><button data-window-action="new" aria-label="New window" title="New window">${icon('plus')}</button><button data-window-action="minimize" aria-label="Minimize window" title="Minimize">${icon('minus')}</button><button data-window-action="maximize" aria-label="Maximize window" title="Maximize or restore">${icon('square')}</button><button class="close-button" data-window-action="close" aria-label="Close application" title="Close">${icon('close')}</button></div></header><div class="window-content">${appContent(app)}</div>${['n','e','s','w','ne','se','sw','nw'].map(edge => `<div class="resize-handle resize-${edge}" data-edge="${edge}" ${edge === 'se' ? 'tabindex="0" role="button" aria-label="Resize window; use arrow keys"' : 'aria-hidden="true"'}></div>`).join('')}`;
    const w: ManagedWindow = { id, app, title: `${definition.name} ${id}`, element, rect, normal: { ...rect }, mode: 'normal', minimized: false };
    this.windows.push(w); this.options.host.append(element); this.paint(w);
    element.addEventListener('pointerdown', event => {
      if (this.active !== id) this.focus(id, false);
      const target = event.target as Element;
      if (target.closest('button,input')) return;
      const edge = target.closest<HTMLElement>('[data-edge]')?.dataset.edge;
      if (edge || target.closest('.window-titlebar')) this.gesture(w, event, edge);
    });
    element.addEventListener('focusin', () => { if (this.active !== id) this.focus(id, false); });
    element.addEventListener('dblclick', event => { if ((event.target as Element).closest('.window-titlebar') && !(event.target as Element).closest('button')) this.maximize(id); });
    element.addEventListener('keydown', event => {
      const target = event.target as HTMLElement;
      if (target !== element.querySelector('.window-titlebar') && !target.dataset.edge) return;
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key) || event.ctrlKey || event.altKey) return;
      event.preventDefault(); event.stopPropagation();
      this.cancelGesture?.();
      if (w.mode !== 'normal') this.restoreGeometry(w);
      const step = event.shiftKey ? 1 : 16;
      const dx = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
      const dy = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
      w.rect = target.dataset.edge ? resized(w.rect, target.dataset.edge, dx, dy, this.area()) : clampRect({ ...w.rect, x: w.rect.x + dx, y: w.rect.y + dy }, this.area());
      w.normal = { ...w.rect }; this.paint(w);
    });
    syncSettings();document.dispatchEvent(new CustomEvent('velora:open',{detail:app}));
    this.focus(id); this.animate(w); this.options.announce(`${w.title} opened`);
  }
  focus(id: number, keyboard = true): void {
    const w = this.get(id); if (!w) return;
    this.options.beforeFocus();
    w.animation?.cancel();
    const restore = w.minimized; w.minimized = false; w.element.hidden = false;
    this.windows = this.windows.filter(item => item !== w); this.windows.push(w); this.active = id;
    this.windows.forEach((item,index) => { item.element.style.zIndex = String(index + 1); item.element.classList.toggle('is-active', item === w); });
    if (keyboard) w.element.querySelector<HTMLElement>('.window-titlebar')?.focus({ preventScroll: true });
    if (restore) this.animate(w);
    this.options.changed();
  }
  activateApp(app: AppId, newInstance = false): void {
    const existing = [...this.windows].reverse().find(w => w.app === app);
    if (existing && !newInstance) this.focus(existing.id); else this.open(app);
  }
  private focusNext(): void {
    const next = [...this.windows].reverse().find(w => !w.minimized);
    this.active = null;
    this.windows.forEach(w => w.element.classList.remove('is-active'));
    if (next) this.focus(next.id); else { this.options.changed(); document.querySelector<HTMLElement>('.launcher-trigger')?.focus(); }
  }
  minimize(id: number): void {
    const w = this.get(id); if (!w || w.minimized) return;
    this.cancelGesture?.();
    w.minimized = true;
    this.animate(w, true, () => { w.element.hidden = true; });
    if (this.active === id) this.focusNext(); else this.options.changed();
    this.options.announce(`${w.title} minimized`);
  }
  close(id: number): void {
    const w = this.get(id); if (!w) return;
    this.cancelGesture?.();
    // Remove focus targets immediately; the short visual exit is decorative.
    w.element.inert = true;
    this.windows = this.windows.filter(item => item !== w);
    this.animate(w, true, () => { w.element.remove(); });
    if (this.active === id) this.focusNext(); else this.options.changed();
    this.options.announce(`${w.title} closed`);
  }
  closeAll(): void {
    this.cancelGesture?.();
    for (const w of this.windows) { w.animation?.cancel(); w.element.remove(); }
    this.options.host.querySelectorAll('.app-window').forEach(el => el.remove());
    this.windows = []; this.active = null; this.options.changed();
  }
  private restoreGeometry(w: ManagedWindow): void { w.mode = 'normal'; w.rect = clampRect(w.normal, this.area()); this.paint(w); }
  maximize(id: number): void {
    const w = this.get(id); if (!w) return;
    if (w.mode === 'maximized') { this.restoreGeometry(w); this.focus(id); } else this.snap(id, 'maximized');
  }
  snap(id: number, mode: Placement): void {
    const w = this.get(id); if (!w) return;
    this.cancelGesture?.();
    if (mode === 'normal') this.restoreGeometry(w);
    else { if (w.mode === 'normal') w.normal = { ...w.rect }; w.mode = mode; w.rect = placementRect(mode, this.area()); this.paint(w); }
    this.focus(id); this.options.announce(`${w.title}: ${mode}`);
  }
  cycle(backwards = false): void {
    const ids = this.windows.map(w => w.id).sort((a,b) => a-b); if (!ids.length) return;
    const index = ids.indexOf(this.active ?? -1);
    this.focus(ids[(index + (backwards ? -1 : 1) + ids.length) % ids.length]);
  }
  guide(id: number, tab: GuideTab): void {
    const w = this.get(id); if (!w) return;
    w.element.querySelector('.window-content')!.innerHTML = appContent('welcome',tab);
    w.element.querySelector<HTMLElement>(`[data-guide="${tab}"]`)?.focus();
  }
  private gesture(w: ManagedWindow, event: PointerEvent, edge?: string): void {
    if (event.button !== 0) return;
    event.preventDefault(); this.cancelGesture?.(); w.animation?.cancel();
    const handle = event.target as HTMLElement;
    const before = { rect: { ...w.rect }, normal: { ...w.normal }, mode: w.mode };
    if (w.mode !== 'normal') {
      const ratio = Math.min(1,Math.max(0,(event.clientX-w.rect.x)/w.rect.width));
      this.restoreGeometry(w);
      w.rect = clampRect({ ...w.rect, x: event.clientX - w.rect.width * ratio, y: event.clientY - 20 }, this.area());
    }
    const start = { ...w.rect }; let dx=0,dy=0,frame=0; let candidate: Placement | null = null;
    handle.setPointerCapture(event.pointerId); w.element.classList.add('is-interacting');
    const draw = () => {
      frame=0;
      w.rect = edge ? resized(start,edge,dx,dy,this.area()) : clampRect({ ...start,x:start.x+dx,y:start.y+dy },this.area());
      this.paint(w);
      if(candidate){ Object.assign(this.snapPreview.style, Object.fromEntries(Object.entries(placementRect(candidate,this.area())).map(([k,v])=>[k==='x'?'left':k==='y'?'top':k,`${v}px`]))); }
      this.snapPreview.hidden = !candidate;
    };
    const move = (e: PointerEvent) => {
      dx=e.clientX-event.clientX;dy=e.clientY-event.clientY;
      candidate = edge ? null : e.clientY <= 45 ? 'maximized' : e.clientX <= 20 ? 'left' : e.clientX >= window.innerWidth-20 ? 'right' : null;
      if(!frame)frame=requestAnimationFrame(draw);
    };
    const cleanup = () => {
      cancelAnimationFrame(frame);frame=0;this.snapPreview.hidden=true;w.element.classList.remove('is-interacting');
      handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',cancel);handle.removeEventListener('lostpointercapture',cancel);
      document.removeEventListener('keydown',escape); if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);this.cancelGesture=null;
    };
    const finish = () => { draw();const mode=candidate;cleanup();w.normal={...w.rect};if(mode)this.snap(w.id,mode); };
    const cancel = () => { cleanup();w.rect=before.rect;w.normal=before.normal;w.mode=before.mode;this.paint(w); };
    const escape = (e: KeyboardEvent) => {if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();cancel();}};
    this.cancelGesture=cancel;
    handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',cancel);document.addEventListener('keydown',escape);
  }
}
