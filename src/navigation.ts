import { apps, type AppId } from './apps';
import { icon } from './icons';
import type { WindowManager } from './window-manager';
import { searchItems, type Searchable } from './search';
import { getPreferences, subscribePreferences, updatePreferences } from './settings';
import { addRecent } from './preferences';
interface Command extends Searchable { description:string; glyph:string; run:()=>void }
interface Options { wm:WindowManager; closePanels:()=>void; canUse:()=>boolean; runAction:(id:string)=>void }
export class Navigation {
  private options:Options;
  private dialog:HTMLDialogElement;
  private opener:HTMLElement|null=null;
  private mode:'commands'|'windows'='commands';
  private commands:Command[];
  private results:Command[]=[];
  private selected=0;
  private launcher:HTMLElement;
  private search:HTMLInputElement;
  private context:HTMLElement;
  constructor(options:Options){
    this.options=options;
    this.commands=[...apps.map(app=>({id:app.id,label:app.name,keywords:app.description,description:app.description,glyph:app.icon,run:()=>options.wm.activateApp(app.id)})),
      ...[['desktop','Show desktop','Minimize all open windows','grid'],['fullscreen','Toggle full screen','Use the entire browser display','expand'],['lock','Lock workspace','Cover your desktop','lock'],['shutdown','Shut down Velora','Confirm before ending the workspace','power']].map(([id,label,description,glyph])=>({id,label,description,glyph,run:()=>options.runAction(id)}))];
    this.launcher=document.querySelector('#launcher')!;
    this.launcher.querySelector('.panel-header')!.insertAdjacentHTML('afterend','<label class="launcher-search"><span class="sr-only">Search applications</span><input type="search" placeholder="Search applications" aria-label="Search applications" autocomplete="off"/></label>');
    this.launcher.querySelector('.launcher-grid')!.insertAdjacentHTML('afterend','<p class="launcher-empty" role="status" hidden>No applications found.</p><div class="recent-apps"></div><button class="palette-link" data-navigation="commands">Command palette <kbd>Ctrl Alt K</kbd></button>');
    this.search=this.launcher.querySelector('input')!;
    this.search.addEventListener('input',()=>this.filterApps());
    this.launcher.addEventListener('keydown',e=>{
      if(e.ctrlKey||e.altKey)return;
      const matches=Array.from(this.launcher.querySelectorAll<HTMLButtonElement>('.launcher-app:not([hidden])'));
      if(e.target===this.search && e.key==='Enter'){e.preventDefault();matches[0]?.click();}
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        const index=matches.indexOf(document.activeElement as HTMLButtonElement);
        if(e.target===this.search||index>=0){e.preventDefault();matches[(index+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length]?.focus();}
      }
    });
    this.dialog=document.createElement('dialog');this.dialog.className='navigation-dialog';
    this.dialog.setAttribute('aria-labelledby','navigation-title');
    this.dialog.innerHTML=`<div class="navigation-top"><span id="navigation-title">Command palette</span><button aria-label="Close navigation">${icon('close')}</button></div><input class="command-search" aria-label="Search commands" placeholder="What would you like to do?" autocomplete="off"/><div class="command-results"></div><footer><span>↑ ↓ to choose · Enter to open</span><kbd>Esc</kbd></footer>`;
    document.querySelector('#app')!.append(this.dialog);
    this.dialog.querySelector('button')!.onclick=()=>this.dismiss(true);
    this.dialog.querySelector('input')!.addEventListener('input',()=>{this.selected=0;this.render();});
    this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.dismiss(true);});
    this.dialog.addEventListener('click',e=>{if(e.target===this.dialog)this.dismiss(true);const b=(e.target as Element).closest<HTMLElement>('[data-command]');if(b)this.run(Number(b.dataset.command));});
    this.dialog.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'||e.key==='ArrowUp'||(e.key==='Tab'&&e.ctrlKey&&e.altKey)){
        e.preventDefault();e.stopPropagation();const direction=e.key==='ArrowUp'||e.shiftKey?-1:1;
        this.selected=(this.selected+direction+this.results.length)%Math.max(1,this.results.length);this.paintSelection();
      }else if(e.key==='Enter' && (e.target===this.dialog.querySelector('input')||e.target===this.dialog)){
        e.preventDefault();e.stopPropagation();this.run(this.selected);
      }
    });
    this.context=document.createElement('div');this.context.className='desktop-context shell-panel';this.context.hidden=true;this.context.setAttribute('role','menu');this.context.setAttribute('aria-label','Desktop actions');
    this.context.innerHTML=`<button role="menuitem" data-context="settings">${icon('sliders')}Personalize desktop</button><button role="menuitem" data-context="commands">${icon('keyboard')}Command palette</button><button role="menuitem" data-context="desktop">${icon('grid')}Show desktop</button><hr/><button role="menuitem" data-context="fullscreen">${icon('expand')}Toggle full screen</button><button role="menuitem" data-context="lock">${icon('lock')}Lock workspace</button>`;
    document.querySelector('#desktop')!.append(this.context);
    this.context.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLElement>('[data-context]');if(!b)return;this.dismiss(false);if(b.dataset.context==='settings')options.wm.activateApp('settings');else if(b.dataset.context==='commands')this.open('commands');else options.runAction(b.dataset.context!);});
    this.context.addEventListener('keydown',e=>{
      const buttons=Array.from(this.context.querySelectorAll<HTMLButtonElement>('button'));const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
      if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.dismiss(true);}
    });
    document.addEventListener('contextmenu',e=>{
      if(!options.canUse()||!(e.target as Element).closest('#desktop')||(e.target as Element).closest('.app-window,.shell-panel,.dock,.system-bar'))return;
      e.preventDefault();options.closePanels();this.opener=document.activeElement as HTMLElement;this.context.hidden=false;
      const r=this.context.getBoundingClientRect();const x=e.clientX||24,y=e.clientY||60;
      this.context.style.left=`${Math.max(8,Math.min(x,innerWidth-r.width-8))}px`;this.context.style.top=`${Math.max(40,Math.min(y,innerHeight-r.height-8))}px`;
      this.context.querySelector<HTMLButtonElement>('button')!.focus();
    });
    document.addEventListener('pointerdown',e=>{if(!this.context.hidden&&!this.context.contains(e.target as Node))this.context.hidden=true;});
    window.addEventListener('resize',()=>{this.context.hidden=true;});
    document.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLElement>('[data-navigation]');if(b)this.open(b.dataset.navigation as 'commands'|'windows');});
    document.addEventListener('velora:open',e=>{const app=(e as CustomEvent<AppId>).detail;updatePreferences({recent:addRecent(getPreferences().recent,app)});});
    subscribePreferences(()=>this.renderRecent());this.renderRecent();
  }
  prepareLauncher():void {this.search.value='';this.filterApps();this.search.focus();}
  private filterApps():void{
    const results=searchItems(apps.map(a=>({id:a.id,label:a.name,keywords:a.description})),this.search.value);
    this.launcher.querySelectorAll<HTMLElement>('.launcher-app').forEach(el=>el.hidden=!results.some(r=>r.id===el.dataset.app));
    this.launcher.querySelector<HTMLElement>('.launcher-empty')!.hidden=results.length>0;
    this.launcher.querySelector<HTMLElement>('.recent-apps')!.hidden=!!this.search.value;
  }
  private renderRecent():void{
    const recent=getPreferences().recent.map(id=>apps.find(a=>a.id===id)).filter(a=>!!a);
    this.launcher.querySelector('.recent-apps')!.innerHTML=recent.length?`<h3>Recently opened</h3><div>${recent.map(a=>`<button data-app="${a.id}">${icon(a.icon)}${a.name}</button>`).join('')}</div>`:'';
  }
  open(mode:'commands'|'windows',backwards=false):void{
    if(!this.options.canUse())return;
    const opener=document.activeElement as HTMLElement;
    this.options.closePanels();this.opener=opener;this.mode=mode;
    this.dialog.querySelector('#navigation-title')!.textContent=mode==='commands'?'Command palette':'Switch windows';
    const input=this.dialog.querySelector('input')!;input.value='';input.hidden=mode==='windows';
    this.selected=0;this.render();
    if(mode==='windows'&&this.results.length>1)this.selected=backwards?this.results.length-1:1;
    this.paintSelection();this.dialog.showModal();
    if(mode==='commands')input.focus();else {this.dialog.tabIndex=-1;this.dialog.focus();}
  }
  private render():void{
    this.results=this.mode==='commands'?searchItems(this.commands,this.dialog.querySelector('input')!.value):[...this.options.wm.windows].reverse().map(w=>({id:String(w.id),label:w.title,description:w.minimized?'Minimized':w.id===this.options.wm.active?'Current window':'Open window',glyph:apps.find(a=>a.id===w.app)!.icon,run:()=>this.options.wm.focus(w.id)}));
    this.dialog.querySelector('.command-results')!.innerHTML=this.results.length?this.results.map((c,i)=>`<button data-command="${i}">${icon(c.glyph)}<span><strong>${c.label}</strong><small>${c.description}</small></span><span class="command-enter">↵</span></button>`).join(''):'<p class="no-results">'+(this.mode==='windows'?'No open windows. Open an app from the dock.':'No commands found. Try “Settings” or “desktop”.')+'</p>';
    this.paintSelection();
  }
  private paintSelection():void{
    this.dialog.querySelectorAll<HTMLElement>('[data-command]').forEach((el,i)=>{el.classList.toggle('selected',i===this.selected);el.setAttribute('aria-current',String(i===this.selected));if(i===this.selected)el.scrollIntoView({block:'nearest'});});
  }
  private run(index:number):void{const action=this.results[index];if(!action)return;this.dismiss(false);action.run();}
  dismiss(restore=false):void{
    const wasOpen=this.dialog.open||!this.context.hidden;
    this.dialog.close();this.context.hidden=true;
    if(restore&&wasOpen){const el=this.opener?.isConnected&&!this.opener.closest('[hidden],[inert]')?this.opener:document.querySelector<HTMLElement>('.launcher-trigger');el?.focus();}
  }
  handleKey(event:KeyboardEvent):boolean{
    if(this.dialog.open)return true;
    if(!this.options.canUse())return false;
    if(event.ctrlKey&&event.altKey&&event.key.toLowerCase()==='k'){event.preventDefault();this.open('commands');return true;}
    if(event.ctrlKey&&event.altKey&&event.key==='Tab'){event.preventDefault();this.open('windows',event.shiftKey);return true;}
    if(event.ctrlKey&&event.altKey&&event.key.toLowerCase()==='s'){event.preventDefault();this.options.wm.activateApp('settings');return true;}
    if(event.ctrlKey&&event.altKey&&event.key.toLowerCase()==='d'){event.preventDefault();this.options.runAction('desktop');return true;}
    return false;
  }
}
