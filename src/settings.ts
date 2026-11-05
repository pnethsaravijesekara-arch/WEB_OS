import { icon } from './icons';
import { defaults, accents, sanitizePreferences, type Preferences } from './preferences';

interface Profile { preferences: Preferences; wallpaper?: Blob }
let preferences = { ...defaults, recent: [] as string[] };
let custom: Blob | undefined;
let customURL = '';
let database: IDBDatabase | undefined;
let saveQueue = Promise.resolve();
let status = 'Loading preferences…';
let importBusy = false;
let wallpaperRevision = 0;
const listeners = new Set<() => void>();
export const getPreferences = (): Preferences => preferences;
export const subscribePreferences = (fn: () => void): void => { listeners.add(fn); };
export const reducedMotion = (): boolean => preferences.motion || matchMedia('(prefers-reduced-motion: reduce)').matches;
export function settingsContent(): string {
  return `<div class="settings-layout"><aside class="settings-sidebar"><div class="settings-identity"><span class="settings-app-symbol">${icon('settings')}</span><strong>Settings</strong><small>Make yourself at home.</small></div><nav aria-label="Settings sections">${[['appearance','sun','Appearance'],['wallpaper','welcome','Wallpaper'],['dock','grid','Dock'],['widgets','clock','Widgets']].map(([id,glyph,label])=>`<button data-settings-tab="${id}" aria-current="${id==='appearance'?'page':'false'}">${icon(glyph)}${label}</button>`).join('')}</nav><p class="save-status" role="status">${status}</p></aside><div class="settings-pages">
  <section data-settings-page="appearance"><h1>Appearance</h1><p class="settings-description">A familiar space. Your own character.</p><h2>Theme</h2><div class="theme-choices">${['light','dark','system'].map(t=>`<button data-pref="theme" data-value="${t}" aria-pressed="false"><span class="theme-preview theme-${t}"><i></i><b></b></span><span>${t[0].toUpperCase()+t.slice(1)}</span></button>`).join('')}</div><h2>Accent colour</h2><div class="accent-choices">${accents.map((a,i)=>`<button data-pref="accent" data-value="${a}" style="--swatch:${a}" aria-label="${['Blue','Violet','Jade','Rose','Amber'][i]} accent" aria-pressed="false"><span>✓</span></button>`).join('')}</div><div class="settings-group"><label><span><strong>Focus mode</strong><small>Keep only your active window in view.</small></span><input type="checkbox" data-pref="focus"/></label><label><span><strong>Reduce motion</strong><small>Keep transitions quiet. System preference is respected.</small></span><input type="checkbox" data-pref="motion" aria-label="Reduce motion"/></label><label><span><strong>Reduce transparency</strong><small>Solid surfaces for a clearer view.</small></span><input type="checkbox" data-pref="transparency" aria-label="Reduce transparency"/></label></div></section>
  <section data-settings-page="wallpaper" hidden><h1>Wallpaper</h1><p class="settings-description">Give your desktop a different atmosphere.</p><div class="wallpaper-preview" aria-label="Current wallpaper preview"><span>Velora</span></div><div class="wallpaper-choices">${[['aurora','Aurora'],['dusk','Dusk'],['sand','Sand']].map(([id,label])=>`<button data-pref="wallpaper" data-value="${id}" aria-pressed="false"><span class="wallpaper-swatch wallpaper-${id}"></span>${label}</button>`).join('')}<button data-pref="wallpaper" data-value="custom" class="custom-wallpaper-choice" aria-pressed="false" hidden><span class="wallpaper-swatch wallpaper-custom"></span>Your photo</button></div><div class="settings-group"><label><span><strong>Live wallpaper</strong><small>Slow movement while your workspace is visible.</small></span><input type="checkbox" data-pref="live"/></label></div><label class="wallpaper-import">${icon('plus')}<span>Choose a photo</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label="Choose custom wallpaper"/></label><p class="settings-hint">JPG, PNG, WebP or AVIF · up to 12 MB. Stored in this browser only. Large photos are resized for a lighter desktop.</p><p class="import-status" role="status"></p></section>
  <section data-settings-page="dock" hidden><h1>Dock</h1><p class="settings-description">Your everyday apps, right where you want them.</p><div class="dock-illustration"><span class="mini-window"></span><span class="mini-dock"><i></i><i></i><i></i><i></i></span></div><h2>Position</h2><div class="segmented">${['left','bottom','right'].map(p=>`<button data-pref="dockPosition" data-value="${p}" aria-pressed="false">${p[0].toUpperCase()+p.slice(1)}</button>`).join('')}</div><div class="settings-group"><label class="dock-size-label"><span><strong>Icon size</strong><small><output data-dock-size>52</output> px</small></span><input type="range" min="36" max="64" step="2" data-pref="dockSize" aria-label="Dock icon size"/></label><label><span><strong>Automatically hide dock</strong><small>Move to its screen edge or use Tab to reveal it.</small></span><input type="checkbox" data-pref="dockHide" aria-label="Automatically hide dock"/></label></div><p class="settings-hint">On narrow screens, the dock sits at the bottom and stays within reach.</p></section>
  <section data-settings-page="widgets" hidden><h1>Desktop widgets</h1><p class="settings-description">Choose what stays on your desktop.</p><div class="settings-group">${[['widgetClock','Clock'],['widgetCalendar','Calendar'],['widgetWeather','Weather']].map(([key,name])=>`<label><span><strong>${name}</strong></span><input type="checkbox" data-pref="${key}"></label>`).join('')}<label><span><strong>Weather city</strong><small>Refresh on the widget to look up this city using Open-Meteo.</small></span><input type="text" data-city-input maxlength="80" value="" placeholder="e.g. Colombo"></label><button class="city-apply">Apply city</button></div>
    <h2>Clock face</h2><div class="clock-faces">${[['air','Air','09:41'],['stack','Stack','09<br>41'],['dial','Dial','']].map(([face,name,sample])=>`<button data-pref="clockFace" data-value="${face}"><span class="face-sample sample-${face}" aria-hidden="true">${sample}</span><span>${name}</span></button>`).join('')}</div>
    ${[['clockInk','Clock and date ink',['auto','light','dark']],['widgetStyle','Weather surface',['glass','solid','outline']],['widgetColor','Color',['ocean','moss','plum','amber']],['widgetPosition','Position',['top','lower']]].map(([key,title,options])=>`<h2>${title}</h2><div class="segmented">${(options as string[]).map(v=>`<button data-pref="${key}" data-value="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div>`).join('')}</section>
  </div></div>`;
}
export function syncSettings(): void {
  document.querySelectorAll<HTMLElement>('[data-pref]').forEach(el=>{
    const key=el.dataset.pref as keyof Preferences;
    if(el instanceof HTMLInputElement){if(el.type==='checkbox')el.checked=Boolean(preferences[key]);else el.value=String(preferences[key]);}
    else el.setAttribute('aria-pressed',String(preferences[key]===el.dataset.value));
  });
  document.querySelectorAll<HTMLInputElement>('[data-city-input]').forEach(el=>{if(document.activeElement!==el&&!el.dataset.editing)el.value=preferences.widgetCity;});
  document.querySelectorAll('[data-dock-size]').forEach(el=>el.textContent=String(preferences.dockSize));
  document.querySelectorAll<HTMLElement>('.custom-wallpaper-choice').forEach(el=>el.hidden=!custom);
  document.querySelectorAll('.save-status').forEach(el=>el.textContent=status);
  document.querySelectorAll<HTMLInputElement>('.wallpaper-import input').forEach(el=>el.disabled=importBusy);
}
function apply(): void {
  const root=document.documentElement;
  root.dataset.theme=preferences.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):preferences.theme;
  root.dataset.wallpaper=preferences.wallpaper;
  root.classList.toggle('live-wall',preferences.live);
  root.classList.toggle('focus-mode',preferences.focus);
  root.dataset.dock=preferences.dockPosition;
  root.classList.toggle('dock-autohide',preferences.dockHide);
  root.classList.toggle('reduce-motion',reducedMotion());
  root.classList.toggle('reduce-transparency',preferences.transparency);
  root.style.setProperty('--accent',preferences.accent);
  root.style.setProperty('--dock-size',`${preferences.dockSize}px`);
  if(customURL)root.style.setProperty('--custom-wallpaper',`url("${customURL}")`);
  syncSettings();listeners.forEach(fn=>fn());
}
function persist(): void {
  if(!database){status='Not saved · browser storage unavailable';syncSettings();return;}
  status='Saving…';syncSettings();
  const profile:Profile={preferences:structuredClone(preferences),wallpaper:custom};
  saveQueue=saveQueue.then(()=>new Promise<void>((resolve,reject)=>{
    const tx=database!.transaction('profile','readwrite');tx.objectStore('profile').put(profile,'current');
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  })).then(()=>{status='Saved on this device';syncSettings();}).catch(()=>{status='Could not save · storage may be full';syncSettings();});
}
export function updatePreferences(patch: Partial<Preferences>): void {
  if(patch.wallpaper)wallpaperRevision++;
  preferences=sanitizePreferences({...preferences,...patch});
  if(preferences.wallpaper==='custom'&&!custom)preferences.wallpaper='aurora';
  apply();persist();
}
export async function initializeSettings(): Promise<void> {
  try {
    database=await new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open('velora-personalization',1);
      const timeout=setTimeout(()=>reject(new Error('Storage unavailable')),4000);
      request.onupgradeneeded=()=>request.result.createObjectStore('profile');
      request.onsuccess=()=>{clearTimeout(timeout);resolve(request.result);};
      request.onerror=()=>{clearTimeout(timeout);reject(request.error);};
      request.onblocked=()=>{clearTimeout(timeout);reject(new Error('Storage blocked'));};
    });
    const profile=await new Promise<Profile|undefined>((resolve,reject)=>{
      const request=database!.transaction('profile').objectStore('profile').get('current');
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    preferences=sanitizePreferences(profile?.preferences);
    if(profile?.wallpaper instanceof Blob){custom=profile.wallpaper;customURL=URL.createObjectURL(custom);}
    if(preferences.wallpaper==='custom'&&!custom)preferences.wallpaper='aurora';
    status='Saved on this device';
  } catch {status='Not saved · browser storage unavailable';}
  apply();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',apply);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',apply);
}
function importMessage(message:string):void{document.querySelectorAll('.import-status').forEach(el=>el.textContent=message);}
async function importWallpaper(file:File):Promise<void>{
  if(importBusy)return;
  if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)){importMessage('Choose a JPG, PNG, WebP or AVIF image.');return;}
  if(file.size>12*1024*1024){importMessage('This image is too large. Choose one under 12 MB.');return;}
  importBusy=true;syncSettings();importMessage('Preparing your wallpaper…');
  const revision=wallpaperRevision;
  let bitmap:ImageBitmap|undefined;
  try{
    bitmap=await createImageBitmap(file);
    const scale=Math.min(1,2560/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Invalid image')),'image/webp',.88));
    if(customURL)URL.revokeObjectURL(customURL);
    custom=blob;customURL=URL.createObjectURL(blob);
    updatePreferences(revision===wallpaperRevision?{wallpaper:'custom'}:{});
    importMessage('Photo ready. Your image stays in this browser.');
  }catch{importMessage('This image could not be opened. Try a different image.');}
  finally{bitmap?.close();importBusy=false;syncSettings();}
}
document.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('button');
  if(button?.classList.contains('city-apply')){
    const input=button.closest('.settings-group')!.querySelector<HTMLInputElement>('[data-city-input]')!;
    delete input.dataset.editing;updatePreferences({widgetCity:input.value});
  }
  if(button?.dataset.settingsTab){const view=button.closest('.settings-layout')!;view.querySelectorAll<HTMLElement>('[data-settings-page]').forEach(el=>el.hidden=el.dataset.settingsPage!==button.dataset.settingsTab);view.querySelectorAll<HTMLElement>('[data-settings-tab]').forEach(el=>el.setAttribute('aria-current',el===button?'page':'false'));}
  if(button?.dataset.pref)updatePreferences({[button.dataset.pref]:button.dataset.value});
});
document.addEventListener('change',event=>{
  const input=event.target;if(!(input instanceof HTMLInputElement))return;
  if(input.dataset.pref)updatePreferences({[input.dataset.pref]:input.type==='checkbox'?input.checked:input.type==='text'?input.value:input.valueAsNumber});
  if(input.matches('.wallpaper-import input')&&input.files?.[0]){void importWallpaper(input.files[0]);input.value='';}
});

document.addEventListener('input',e=>{if(e.target instanceof HTMLInputElement&&e.target.matches('[data-city-input]'))e.target.dataset.editing='true';});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target instanceof HTMLInputElement&&e.target.matches('[data-city-input]')){e.preventDefault();e.target.closest('.settings-group')?.querySelector<HTMLButtonElement>('.city-apply')?.click();}});
