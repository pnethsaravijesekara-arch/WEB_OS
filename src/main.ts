import './styles/tokens.css';
import './styles/desktop.css';
import './styles/apps.css';
import './styles/windows.css';
import './styles/personalization.css';
import './styles/navigation.css';
import { Navigation } from './navigation';
import { initializeSettings, getPreferences, updatePreferences, subscribePreferences, reducedMotion } from './settings';
import {mountNotes,mountMedia,mountCalculator,isText,isImage,isAudio,isVideo} from './productivity';
import {mountTerminal} from './terminal';
import {mountRecorder,mountClock} from './utilities';
import {mountCalendar} from './calendar';
import {mountPaint} from './paint';
import { mountFiles } from './files';
import * as fs from './vfs';
import { WindowManager } from './window-manager';
import { icon, mark } from './icons';
import { apps, type AppId, type GuideTab } from './apps';
import { startClock } from './clock';

const appTile = (id: AppId): string => `<span class="app-icon ${id}-icon">${id === 'welcome' ? mark : icon(apps.find(app=>app.id===id)!.icon)}</span>`;
const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
<main class="desktop" id="desktop" aria-label="Velora desktop" tabindex="0" inert>
  <div class="wallpaper" aria-hidden="true"></div><div class="display-dimmer" aria-hidden="true"></div>
  <header class="system-bar"><div class="system-left"><button class="system-brand" data-panel="system-menu" aria-label="Velora menu" aria-expanded="false">${mark}</button><strong id="active-label">Desktop</strong><button class="bar-button" data-panel="launcher" aria-expanded="false">Apps</button><button class="bar-button" data-app="welcome">Help</button></div><div class="system-right"><button class="status-button" data-action="overview" aria-label="Workspace overview" title="Workspace overview">${icon('grid')}</button><button class="status-button" data-action="lock" aria-label="Lock workspace">${icon('lock')}</button><button class="status-button" data-panel="controls" aria-label="Desktop controls" aria-expanded="false">${icon('sliders')}</button><button class="clock-button" data-panel="calendar" aria-label="Open calendar" aria-expanded="false"><span data-short-date></span><span data-clock></span></button></div></header>
  <div class="desktop-shortcuts">${apps.filter(a=>['files','settings','about'].includes(a.id)).map(app=>`<button class="desktop-shortcut" data-app="${app.id}">${appTile(app.id)}<span>${app.name}</span></button>`).join('')}</div>
  <div id="windows" aria-label="Application windows"></div>
  <section class="shell-panel launcher" id="launcher" aria-labelledby="launcher-title" hidden><div class="panel-header"><h2 id="launcher-title">Applications</h2><button class="subtle-button" data-action="close-panel" aria-label="Close launcher">${icon('close')}</button></div><div class="launcher-grid">${apps.map(app=>`<button class="launcher-app" data-app="${app.id}">${appTile(app.id)}<strong>${app.name}</strong></button>`).join('')}</div><div class="running-windows" id="running-windows"></div><footer class="launcher-footer"><span class="user-avatar">P</span><span>Personal workspace</span><button class="subtle-button" data-action="lock" aria-label="Lock workspace">${icon('lock')}</button></footer></section>
  <section class="shell-panel control-center" id="controls" aria-label="Desktop controls" hidden><div class="panel-header"><h2>Desktop controls</h2><button class="subtle-button" data-action="close-panel" aria-label="Close controls">${icon('close')}</button></div><div class="control-grid"><button class="control-tile" data-action="fullscreen" aria-pressed="false">${icon('expand')}<strong>Full screen</strong><small id="fullscreen-label">Enter full screen</small></button><button class="control-tile" data-action="motion" aria-pressed="false">${icon('spark')}<strong>Reduce motion</strong><small>Workspace animations</small></button></div><label class="slider-label" for="brightness">${icon('sun')}<span>Workspace brightness</span><output id="brightness-value">100%</output></label><input id="brightness" type="range" min="45" max="100" value="100" aria-label="Workspace brightness"/><button class="control-row" data-action="transparency" aria-pressed="false"><span>Reduce transparency</span><span class="switch" aria-hidden="true"></span></button><div class="control-footer"><button class="subtle-button" data-action="shutdown" aria-label="Shut down workspace">${icon('power')}</button><button class="settings-link" data-app="settings">Open Settings</button><button class="subtle-button" data-action="lock" aria-label="Lock workspace">${icon('lock')}</button></div></section>
  <section class="shell-panel calendar-panel" id="calendar" aria-label="Calendar" hidden></section>
  <section class="shell-panel system-menu" id="system-menu" aria-label="Velora menu" hidden><button data-app="about">${icon('info')}About Velora</button><button data-app="welcome">${icon('welcome')}Welcome</button><button data-app="settings">${icon('sliders')}Settings</button><hr/><button data-action="controls">${icon('sliders')}Desktop controls</button><button data-action="fullscreen">${icon('expand')}Toggle full screen</button><hr/><button data-action="lock">${icon('lock')}Lock workspace</button><button data-action="restart">${icon('replay')}Restart…</button><button data-action="shutdown">${icon('power')}Shut down…</button></section>
  <div class="dock-edge" aria-hidden="true"></div><nav class="dock" aria-label="Desktop dock"><button class="dock-button launcher-trigger" data-panel="launcher" aria-label="Open app launcher" aria-expanded="false"><span class="dock-tile launcher-icon">${icon('grid')}</span><span class="tooltip">Applications</span></button><span class="dock-divider"></span>${apps.map(app=>`<button class="dock-button ${['welcome','files','notes','music','settings'].includes(app.id)?'pinned':''}" data-app="${app.id}" aria-label="Open ${app.name}">${appTile(app.id)}<span class="tooltip">${app.name}</span><span class="running-dot" aria-hidden="true"></span></button>`).join('')}<span class="dock-divider"></span><button class="dock-button" data-panel="controls" aria-label="Open desktop controls" aria-expanded="false"><span class="dock-tile controls-icon">${icon('sliders')}</span><span class="tooltip">Controls</span></button></nav>
  <div class="sr-only" id="announcer" role="status" aria-live="polite"></div>
</main>
<section class="lock-screen" id="lock-screen" aria-label="Workspace locked" hidden><div class="lock-date"><p data-date></p><div data-clock></div></div><div class="lock-account"><span class="account-avatar">P</span><h1>Personal workspace</h1><button class="unlock-button" data-action="unlock">Click to enter ${icon('arrow')}</button><small>Visual lock · no password protection</small><button class="lock-power" data-action="shutdown">${icon('power')} Shut down</button></div><button class="lock-replay" data-action="restart" aria-label="Restart workspace">${icon('replay')}</button></section>
<section class="boot" id="boot" aria-label="Velora startup" hidden><div class="boot-center"><div class="boot-mark">${mark}</div><div class="boot-track"><span></span></div></div><button class="skip-boot" data-action="skip">Skip startup ${icon('arrow')}</button></section>
<section id="power-off" class="power-off" aria-label="Workspace powered off"><div class="power-hardware">${mark}<h1>VELORA</h1><p><i></i> Workspace powered off</p><button disabled data-action="power-on">${icon('power')} Start PC</button></div></section>
<dialog id="power-dialog" class="power-dialog" aria-labelledby="power-title"><div class="power-symbol">${icon('power')}</div><h2 id="power-title">Shut down Velora?</h2><p id="power-description"></p><div><button data-action="cancel-power" autofocus>Cancel</button><button class="primary" data-action="confirm-power">Shut down</button></div></dialog>`;

const desktop = document.querySelector<HTMLElement>('#desktop')!;
const boot = document.querySelector<HTMLElement>('#boot')!;
const lockScreen = document.querySelector<HTMLElement>('#lock-screen')!;
const powerOff = document.querySelector<HTMLElement>('#power-off')!;
const powerDialog = document.querySelector<HTMLDialogElement>('#power-dialog')!;
let powerIntent: 'shutdown' | 'restart' = 'shutdown';
let powerOpener: HTMLElement | null = null;
const announcer = document.querySelector<HTMLElement>('#announcer')!;
let bootTimer: ReturnType<typeof setTimeout>;
let revealTimer:ReturnType<typeof setTimeout>;
let panelOpener: HTMLElement | null = null;
let activePanel: HTMLElement | null = null;
let navigation: Navigation | undefined;
let reduceMotion = reducedMotion();
let calendarOffset = 0;
const motionDuration = (normal: number): number => reduceMotion ? 0 : normal;

function closePanels(restoreFocus = false): void {
  navigation?.dismiss(false);
  if (activePanel) activePanel.hidden = true;
  activePanel = null;
  document.querySelectorAll('[data-panel]').forEach(el=>el.setAttribute('aria-expanded','false'));
  if (restoreFocus) {
    if(panelOpener?.isConnected && !panelOpener.closest('[hidden]')) panelOpener.focus({preventScroll:true});
    else document.querySelector<HTMLButtonElement>('.launcher-trigger')?.focus();
  }
}
function renderCalendar(): void {
  const now = new Date();
  const month = new Date(now.getFullYear(),now.getMonth()+calendarOffset,1);
  const heading = new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric'}).format(month);
  const firstDay = (month.getDay()+6)%7;
  const total = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  document.querySelector('#calendar')!.innerHTML = `<div class="calendar-today"><span data-date>${new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(now)}</span><button class="subtle-button" data-action="close-panel" aria-label="Close calendar">${icon('close')}</button></div><div class="calendar-heading"><h2>${heading}</h2><button class="subtle-button previous" data-action="previous-month" aria-label="Previous month">${icon('chevron')}</button><button class="subtle-button" data-action="next-month" aria-label="Next month">${icon('chevron')}</button></div><div class="calendar-grid">${['M','T','W','T','F','S','S'].map(d=>`<span class="weekday">${d}</span>`).join('')}${'<span></span>'.repeat(firstDay)}${Array.from({length:total},(_,i)=>`<span class="${calendarOffset===0&&i+1===now.getDate()?'today':''}" ${calendarOffset===0&&i+1===now.getDate()?'aria-current="date"':''}>${i+1}</span>`).join('')}</div><button class="today-button" data-action="today">Today</button><button class="today-button" data-app="calendar">Open planner</button>`;
}
function togglePanel(id: string, opener: HTMLElement): void {
  const panel = document.getElementById(id);
  if (!panel) return;
  const wasOpen = activePanel === panel;
  closePanels();
  if (wasOpen) { opener.focus(); return; }
  if (id==='calendar') { calendarOffset=0; renderCalendar(); }
  panelOpener=opener;
  activePanel=panel;
  panel.hidden=false;
  document.querySelectorAll(`[data-panel="${id}"]`).forEach(el=>el.setAttribute('aria-expanded','true'));
  panel.animate([{opacity:0,transform:`translateY(${id==='launcher'?'12':'-6'}px) scale(.97)`},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:motionDuration(220),easing:'cubic-bezier(.2,.8,.2,1)'});
  if(id==='launcher')navigation?.prepareLauncher();else panel.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
}
const wm = new WindowManager({
  mount:(w,file)=>{const view=w.element.querySelector<HTMLElement>('.window-content')!;
    if(w.app==='files')return mountFiles(view,n=>{if(isVideo(n))wm.open('video',n.id);else if(isText(n)&&n.size<=1048576)wm.open('notes',n.id);else if(isImage(n))wm.open('gallery',n.id);else if(isAudio(n))wm.open('music',n.id);else void previewFile(n);});
    if(w.app==='notes')return mountNotes(view,file);
    if(w.app==='terminal')return mountTerminal(view,id=>wm.open(id));
    if(w.app==='clock')return mountClock(view);
    if(w.app==='recorder')return mountRecorder(view);
    if(w.app==='calendar')return mountCalendar(view);
    if(w.app==='paint')return mountPaint(view);
    if(w.app==='video'||w.app==='music'||w.app==='gallery')return mountMedia(view,w.app,file);
    if(w.app==='calculator')mountCalculator(view);
  },
  host: document.querySelector<HTMLElement>('#windows')!, reduced: () => reduceMotion,
  beforeFocus: () => closePanels(), announce: text => { announcer.textContent = text; },
  changed: () => {
    document.querySelector('#active-label')!.textContent = wm.get(wm.active)?.title ?? 'Desktop';
    document.querySelectorAll<HTMLElement>('.dock-button[data-app]').forEach(el => {
      const running = wm.windows.filter(w => w.app === el.dataset.app);
      el.classList.toggle('is-running', !!running.length);
      el.dataset.count = running.length ? String(running.length) : '';
      if(running.some(w => w.id === wm.active)) el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');
    });
    document.querySelector('#running-windows')!.innerHTML = wm.windows.length ? `<h3>Open windows</h3>${wm.windows.map(w => `<button data-window-id="${w.id}">${icon(apps.find(app=>app.id===w.app)!.icon)}<span>${w.title}</span><small>${w.minimized ? 'Minimized' : w.id === wm.active ? 'Active' : 'Open'}</small></button>`).join('')}` : '';
  }
});
function askPower(intent: 'shutdown' | 'restart', opener: HTMLElement): void {
  powerIntent=intent;powerOpener=opener;closePanels();
  document.querySelector('#power-title')!.textContent=intent==='shutdown'?'Shut down Velora?':'Restart Velora?';
  document.querySelector('#power-description')!.textContent=`This closes ${wm.windows.length} open window${wm.windows.length===1?'':'s'} and ends this workspace session. Your computer stays on.`;
  document.querySelector('[data-action="confirm-power"]')!.textContent=intent==='shutdown'?'Shut down':'Restart';
  powerDialog.showModal();powerDialog.querySelector<HTMLButtonElement>('[data-action="cancel-power"]')!.focus();
}
function resetDisplay(): void {
  desktop.style.setProperty('--dim','0');document.querySelector<HTMLInputElement>('#brightness')!.value='100';document.querySelector('#brightness-value')!.textContent='100%';
}
function shutDown(): void {
  clearTimeout(bootTimer);clearTimeout(revealTimer);closePanels();wm.closeAll();clock.pause();resetDisplay();
  boot.hidden=true;lockScreen.hidden=true;desktop.inert=true;powerOff.hidden=false;
  powerOff.querySelector<HTMLButtonElement>('button')!.focus();
  if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});
}
powerDialog.addEventListener('close',()=>{
  if(!powerOff.hidden)return;
  if(!boot.hidden)return;
  if(powerOpener?.isConnected && !powerOpener.closest('[hidden]'))powerOpener.focus();
  else if(!lockScreen.hidden)lockScreen.querySelector<HTMLButtonElement>('.unlock-button')?.focus();
  else document.querySelector<HTMLButtonElement>('.system-brand')?.focus();
});
function lock(): void {
  clearTimeout(revealTimer);
  closePanels();desktop.inert=true;lockScreen.hidden=false;
  lockScreen.animate([{opacity:0},{opacity:1}],{duration:motionDuration(220)});
  lockScreen.querySelector<HTMLButtonElement>('.unlock-button')?.focus();
}
function unlock(): void {
  lockScreen.hidden=true;desktop.inert=false;
  desktop.animate([{opacity:.6,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:motionDuration(320),easing:'cubic-bezier(.16,1,.3,1)'});
  document.querySelector<HTMLButtonElement>('.launcher-trigger')?.focus();
}
function finishBoot(): void {
  if(boot.hidden)return;
  clearTimeout(bootTimer);boot.hidden=true;desktop.inert=false;
  desktop.animate([{opacity:0,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],{duration:motionDuration(450),easing:'cubic-bezier(.16,1,.3,1)'});
  document.querySelector<HTMLButtonElement>('.launcher-trigger')?.focus();
  revealTimer=setTimeout(()=>{
    if(!desktop.inert&&!wm.windows.length&&!activePanel&&!document.querySelector('dialog[open]'))wm.open('about');
  },motionDuration(550));
}
function startBoot(): void {
  clearTimeout(bootTimer);clearTimeout(revealTimer);closePanels();wm.closeAll();clock.resume();resetDisplay();
  powerOff.hidden=true;lockScreen.hidden=true;desktop.inert=true;boot.hidden=false;
  boot.querySelector<HTMLButtonElement>('button')?.focus();
  bootTimer=setTimeout(finishBoot,reduceMotion?500:2100);
}
async function toggleFullscreen(): Promise<void> {
  try { if(document.fullscreenElement) await document.exitFullscreen();else await document.documentElement.requestFullscreen(); }
  catch { announcer.textContent='Full screen is unavailable in this browser view. Use your browser’s full-screen control.'; }
}
document.addEventListener('fullscreenchange',()=>{
  document.querySelector('[data-action="fullscreen"]')?.setAttribute('aria-pressed',String(!!document.fullscreenElement));
  document.querySelector('#fullscreen-label')!.textContent=document.fullscreenElement?'Exit full screen':'Enter full screen';
});
document.addEventListener('click',event=>{
  const target=event.target as Element;
  const button=target.closest<HTMLButtonElement>('button');
  const owner = target.closest<HTMLElement>('[data-window]');
  const windowId = owner ? Number(owner.dataset.window) : wm.active;
  if(button?.dataset.windowId){closePanels();wm.focus(Number(button.dataset.windowId));return;}
  if(button?.dataset.windowAction && windowId!==null){
    switch(button.dataset.windowAction){case 'close':wm.close(windowId);break;case 'minimize':wm.minimize(windowId);break;case 'maximize':wm.maximize(windowId);break;case 'new':wm.open(wm.get(windowId)!.app);break;}return;
  }
  if(button?.dataset.app){
    closePanels();
    if(button.classList.contains('dock-button'))wm.activateApp(button.dataset.app as AppId,event.shiftKey);
    else wm.open(button.dataset.app as AppId);return;
  }
  if(button?.dataset.panel){togglePanel(button.dataset.panel,button);return;}
  if(button?.dataset.guide && windowId!==null){wm.guide(windowId,button.dataset.guide as GuideTab);return;}
  switch(button?.dataset.action){
    case 'overview':showOverview();return;
    case 'skip':finishBoot();return;
    case 'restart':askPower('restart',button);return;
    case 'shutdown':askPower('shutdown',button);return;
    case 'power-on':startBoot();return;
    case 'cancel-power':powerDialog.close();return;
    case 'confirm-power':powerDialog.close();if(powerIntent==='shutdown')shutDown();else startBoot();return;
    case 'close-panel':closePanels(true);return;
    case 'close-window':closePanels();if(windowId!==null)wm.close(windowId);return;
    case 'controls':togglePanel('controls',button);return;
    case 'lock':lock();return;
    case 'unlock':unlock();return;
    case 'fullscreen':void toggleFullscreen();return;
    case 'motion':updatePreferences({motion:!getPreferences().motion});return;
    case 'transparency':updatePreferences({transparency:!getPreferences().transparency});return;
    case 'previous-month':calendarOffset--;renderCalendar();document.querySelector<HTMLButtonElement>('[data-action="previous-month"]')?.focus();return;
    case 'next-month':calendarOffset++;renderCalendar();document.querySelector<HTMLButtonElement>('[data-action="next-month"]')?.focus();return;
    case 'today':calendarOffset=0;renderCalendar();document.querySelector<HTMLButtonElement>('[data-action="today"]')?.focus();return;
  }
  if(activePanel&&!target.closest('.shell-panel'))closePanels(true);
});
document.querySelector<HTMLInputElement>('#brightness')!.addEventListener('input',event=>{
  const value=(event.target as HTMLInputElement).valueAsNumber;
  desktop.style.setProperty('--dim',String((100-value)/100));
  document.querySelector('#brightness-value')!.textContent=`${value}%`;
});
document.addEventListener('keydown',event=>{
  if(powerDialog.open || !powerOff.hidden || document.querySelector('.system-dialog[open]'))return;
  if(navigation?.handleKey(event))return;
  if(event.key==='Escape'){
    if(!boot.hidden){if(!skipButton.disabled)finishBoot();}else if(!lockScreen.hidden)unlock();else if(activePanel)closePanels(true);
    return;
  }
  if(desktop.inert)return;
  if(event.ctrlKey&&event.altKey&&event.code==='KeyO'){event.preventDefault();showOverview();return;}
  if(event.ctrlKey && event.altKey && event.code==='Space'){event.preventDefault();togglePanel('launcher',document.querySelector<HTMLElement>('.launcher-trigger')!);return;}
  if(event.ctrlKey && event.altKey){
    const id=wm.active;
    if(event.key==='Tab'){event.preventDefault();wm.cycle(event.shiftKey);}
    else if(event.key.toLowerCase()==='n'){event.preventDefault();wm.open(wm.get(id)?.app??'welcome');}
    else if(id!==null){
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
        event.preventDefault();wm.snap(id,event.key==='ArrowLeft'?'left':event.key==='ArrowRight'?'right':event.key==='ArrowUp'?'maximized':'normal');
      }else if(event.key.toLowerCase()==='m'){event.preventDefault();wm.minimize(id);}
      else if(event.key.toLowerCase()==='w'){event.preventDefault();wm.close(id);}
    }
  }
});
navigation=new Navigation({wm,closePanels,canUse:()=>!desktop.inert&&!powerDialog.open,runAction:id=>{
  if(id==='desktop'){closePanels();[...wm.windows].forEach(w=>wm.minimize(w.id));}
  else if(id==='overview')showOverview();
  else if(id==='focus')updatePreferences({focus:!getPreferences().focus});
  else if(id==='fullscreen')void toggleFullscreen();
  else if(id==='lock')lock();
  else if(id==='shutdown')askPower('shutdown',document.querySelector<HTMLElement>('.system-brand')!);
}});
subscribePreferences(()=>{
  reduceMotion=reducedMotion();
  document.querySelector('[data-action="motion"]')?.setAttribute('aria-pressed',String(reduceMotion));
  document.querySelector('[data-action="transparency"]')?.setAttribute('aria-pressed',String(getPreferences().transparency));
  document.dispatchEvent(new Event('velora:layout'));
});
const clock = startClock();
const skipButton=boot.querySelector<HTMLButtonElement>('button')!;
skipButton.disabled=true;
clock.pause();
const powerButton=powerOff.querySelector<HTMLButtonElement>('button')!;
void initializeSettings().finally(()=>{skipButton.disabled=false;powerButton.disabled=false;powerButton.focus();});
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('page-hidden',document.hidden));
desktop.addEventListener('pointerdown',()=>clearTimeout(revealTimer));
desktop.addEventListener('keydown',()=>clearTimeout(revealTimer));

function showOverview():void {
  closePanels();
  const dialog=document.createElement('dialog');dialog.className='system-dialog overview';dialog.setAttribute('aria-label','Workspace overview');
  dialog.innerHTML='<header><div><small>MISSION VIEW</small><h2>Workspace overview</h2></div><button aria-label="Close overview">×</button></header><div class="overview-grid"></div>';
  const grid=dialog.querySelector<HTMLElement>('.overview-grid')!;
  dialog.querySelector('button')!.onclick=()=>dialog.close();
  if(!wm.windows.length)grid.textContent='Your desktop is clear. Open an app from the dock.';
  for(const w of [...wm.windows].reverse()){
    const card=document.createElement('button');card.className='overview-card';
    const rect=w.rect;
    card.innerHTML='<span class="mini-space"><i style="left:'+rect.x/innerWidth*100+'%;top:'+rect.y/innerHeight*100+'%;width:'+rect.width/innerWidth*100+'%;height:'+rect.height/innerHeight*100+'%">'+appTile(w.app)+'</i></span><strong>'+w.title+'</strong><small>'+(w.minimized?'Minimized':wm.active===w.id?'Active':'Open')+'</small>';
    card.onclick=()=>{dialog.close();wm.focus(w.id);};grid.append(card);
  }
  document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.showModal();
}

async function previewFile(n:fs.Entry):Promise<void>{
  const dialog=document.createElement('dialog');dialog.className='system-dialog';
  const title=document.createElement('h2');title.textContent=n.name;dialog.append(title);
  const area=document.createElement('div');const close=document.createElement('button');close.textContent='Close preview';dialog.append(area,close);document.body.append(dialog);dialog.showModal();
  let url='';close.onclick=()=>dialog.close();dialog.onclose=()=>{if(url)URL.revokeObjectURL(url);dialog.remove();};
  try{const file=await fs.body(n.id);if(!dialog.open)return;
    if(n.type.startsWith('image/')){const image=document.createElement('img');image.alt=n.name;image.style.maxWidth='100%';url=URL.createObjectURL(file);image.src=url;area.append(image);}
    else if(n.type.startsWith('text/')||/\.(txt|md)$/i.test(n.name)){const pre=document.createElement('pre');pre.style.cssText='white-space:pre-wrap;overflow:auto;max-height:50vh';pre.textContent=await file.slice(0,262144).text();area.append(pre);}
    else area.textContent='No preview available · '+n.size+' bytes';
  }catch{area.textContent='Unable to open this file.';}
}
