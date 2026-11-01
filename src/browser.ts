import {errorText} from './ui';

export function mountBrowser(root:HTMLElement):void{
  const home='velora://home',guide='velora://guide';
  const history=[home];let cursor=0;
  const key='velora-bookmarks';
  root.innerHTML=`<section class="web-app"><form class="tool-toolbar"><button type="button" data-back aria-label="Back">‹</button><button type="button" data-forward aria-label="Forward">›</button><button type="button" data-home aria-label="Home">⌂</button><input aria-label="Web address or search" placeholder="Search or enter address"><button>Go</button><button type="button" data-bookmark aria-label="Bookmark this page">☆</button></form><div class="web-page"></div><footer class="web-status" role="status"></footer></section>`;
  const field=root.querySelector('input')!,page=root.querySelector<HTMLElement>('.web-page')!,status=root.querySelector<HTMLElement>('footer')!;
  const back=root.querySelector<HTMLButtonElement>('[data-back]')!,forward=root.querySelector<HTMLButtonElement>('[data-forward]')!;
  function address(raw:string):string{
    raw=raw.trim();if(!raw)throw Error('Enter an address or a search term.');
    if(raw===home||raw===guide)return raw;
    const explicit=/^[a-z][a-z0-9+.-]*:/i.test(raw);
    if(explicit&&!/^https?:\/\//i.test(raw))throw Error('Use an HTTP or HTTPS web address.');
    if(!explicit&&(!raw.includes('.')||/\s/.test(raw)))return 'https://www.bing.com/search?q='+encodeURIComponent(raw);
    const u=new URL(explicit?raw:'https://'+raw);
    if(u.username||u.password)throw Error('Use a web address without embedded credentials.');
    return u.href;
  }
  function bookmarks():string[]{try{const data:unknown=JSON.parse(localStorage.getItem(key)??'[]');return Array.isArray(data)?data.filter((s):s is string=>typeof s==='string'&&/^https?:\/\//.test(s)).slice(0,40):[];}catch{return [];}}
  function go(raw:string){try{const url=address(raw);if(url!==history[cursor]){history.splice(cursor+1);history.push(url);cursor++;}render();}catch(err){status.textContent=errorText(err);}}
  function link(name:string,url:string){const button=document.createElement('button');button.textContent=name;button.onclick=()=>go(url);page.querySelector('.web-links')!.append(button);}
  function render(){
    const url=history[cursor];field.value=url;back.disabled=cursor===0;forward.disabled=cursor===history.length-1;
    page.replaceChildren();status.replaceChildren();
    if(url===home||url===guide){
      page.innerHTML=url===home?'<div class="web-start"><small>VELORA BROWSER</small><h1>New tab</h1><p>Type a web address above, or open a bookmark.</p><div class="web-links"></div></div>':'<div class="web-start"><small>ON THIS DEVICE</small><h1>Desktop field guide</h1><p>Ctrl + Alt + Space opens your apps. Ctrl + Alt + K searches commands. Use Files to import documents and media.</p><div class="web-links"></div></div>';
      if(url===home){link('Desktop field guide',guide);for(const saved of bookmarks())link(saved,saved);}
      else link('Return home',home);
      status.textContent='Local page · available offline';return;
    }
    const frame=document.createElement('iframe');frame.title='Web page';frame.sandbox.add('allow-scripts','allow-forms');frame.referrerPolicy='no-referrer';frame.src=url;page.append(frame);
    const outside=document.createElement('a');outside.textContent='Open in browser tab ↗';outside.href=url;outside.target='_blank';outside.rel='noopener noreferrer';
    status.append('Some sites require a separate tab. ',outside);
  }
  root.querySelector('form')!.onsubmit=e=>{e.preventDefault();go(field.value);};
  back.onclick=()=>{if(cursor>0){cursor--;render();}};forward.onclick=()=>{if(cursor<history.length-1){cursor++;render();}};
  root.querySelector<HTMLButtonElement>('[data-home]')!.onclick=()=>go(home);
  root.querySelector<HTMLButtonElement>('[data-bookmark]')!.onclick=()=>{
    const url=history[cursor];if(!/^https?:/.test(url)){status.textContent='Open a website to bookmark it.';return;}
    try{localStorage.setItem(key,JSON.stringify([url,...bookmarks().filter(s=>s!==url)].slice(0,40)));status.prepend('Bookmark saved. ');}catch{status.prepend('Bookmark storage unavailable. ');}
  };
  render();
}
