import {importNotice} from './privacy';
import * as fs from './vfs';
import {ask,errorText,escapeHTML as h} from './ui';
import {calculate} from './calculation';
import {icon} from './icons';
export const isText=(e:fs.Entry)=>!e.folder&&(e.type.startsWith('text/')||/\.(txt|md)$/i.test(e.name));
export const isAudio=(e:fs.Entry)=>!e.folder&&(e.type.startsWith('audio/')||/\.(wav|mp3|ogg|m4a|flac)$/i.test(e.name));
export const isVideo=(e:fs.Entry)=>!e.folder&&!e.type.startsWith('audio/')&&(e.type.startsWith('video/')||/\.(mp4|webm|mov|m4v)$/i.test(e.name));
export const isImage=(e:fs.Entry)=>!e.folder&&(e.type.startsWith('image/')||/\.(png|jpe?g|webp|avif|gif)$/i.test(e.name));
export function mountNotes(root:HTMLElement,initial?:string):()=>void{
  root.innerHTML='<div class="tool-shell notes-app"><div class="tool-toolbar"><select aria-label="Choose note"></select><button data-new>New note</button><button data-copy>Save copy</button></div><textarea aria-label="Note text" spellcheck="true" placeholder="Write something…" disabled></textarea><p class="tool-status" role="status"></p></div>';
  const text=root.querySelector('textarea')!,status=root.querySelector<HTMLElement>('.tool-status')!,select=root.querySelector('select')!;
  let id='',revision=0,last='',queue=Promise.resolve(),disposed=false,token=0;
  function save():Promise<void>{
    if(!id||text.value===last)return queue;
    const target=id,value=text.value;last=value;status.textContent='Saving…';
    queue=queue.then(async()=>{try{revision=await fs.write(target,new Blob([value],{type:'text/plain'}),revision);if(text.value===value)status.textContent='Saved on this device';}
      catch(e){status.textContent=errorText(e);if(text.value===value)last='\u0000';}});
    return queue;
  }
  async function loadFile(target?:string){
    const request=++token;await save();if(disposed||request!==token)return;
    text.disabled=true;const rows=(await fs.all()).filter(isText).sort((a,b)=>b.modified-a.modified);
    target??=rows[0]?.id;const node=rows.find(n=>n.id===target);
    if(disposed||request!==token)return;select.replaceChildren(...rows.map(n=>new Option(n.name,n.id)));
    if(!node){text.value='';id='';status.textContent='Choose New note to start.';return;}
    if(node.size>1024*1024){id='';text.value='';status.textContent='This file is too large to edit. Open its preview in Files.';return;}
    const contents=await (await fs.body(node.id)).text();if(disposed||request!==token)return;
    id=node.id;revision=node.modified;last=contents;text.value=contents;select.value=id;text.disabled=false;status.textContent='Saved on this device';
  }
  const fail=(e:unknown)=>{status.textContent=errorText(e);};
  async function newNote(copy=false){const value=await ask(copy?'Save a copy':'New note','Save a text file in Documents.',{value:copy?'Note copy.txt':'Untitled.txt',action:'Save'});if(!value)return;await save();const rows=await fs.all();const node=await fs.create(rows.some(n=>n.id==='Documents')?'Documents':fs.ROOT,value,new Blob([copy?text.value:''],{type:'text/plain'}));await loadFile(node.id);text.focus();}
  root.querySelector<HTMLButtonElement>('[data-new]')!.onclick=()=>void newNote().catch(fail);root.querySelector<HTMLButtonElement>('[data-copy]')!.onclick=()=>void newNote(true).catch(fail);
  select.onchange=()=>void loadFile(select.value).catch(fail);text.oninput=()=>void save();void loadFile(initial).catch(fail);
  return()=>{void save();disposed=true;};
}
export function mountMedia(root:HTMLElement,kind:'music'|'gallery'|'video',initial?:string):()=>void{
  const music=kind==='music',video=kind==='video',matches=video?isVideo:music?isAudio:isImage;
  const medium=video?'video':music?'audio':'image';
  root.innerHTML='<div class="tool-shell media-app '+kind+'"><div class="tool-toolbar"><strong>'+ (video?'Video library':music?'Music library':'Image gallery')+'</strong><label class="import-button">Import '+medium+'<input aria-label="Import '+medium+'" type="file" multiple accept="'+(medium+'/*')+'"></label></div><div class="media-stage">'+(video?'<video controls playsinline preload="metadata" aria-label="Video playback"></video>':music?'<div class="record-art">'+icon('music')+'</div>':'<img alt="Selected picture" hidden>')+'</div><div class="media-caption"><strong></strong><div><button data-prev aria-label="Previous item">‹</button><button data-next aria-label="Next item">›</button></div></div>'+(music?'<audio controls preload="metadata" aria-label="Music playback"></audio>':'')+'<div class="media-list"></div><p class="tool-status" role="status"></p></div>';
  root.querySelector('.tool-toolbar')!.insertAdjacentHTML('afterend',importNotice);
  let items:fs.Entry[]=[],active='',url='',generation=0,scan=0,closed=false;
  const audio=root.querySelector<HTMLMediaElement>('audio,video'),img=root.querySelector('img'),status=root.querySelector<HTMLElement>('.tool-status')!,list=root.querySelector<HTMLElement>('.media-list')!;
  const fail=(err:unknown)=>{status.textContent=errorText(err);};
  function clear(){audio?.pause();audio?.removeAttribute('src');audio?.load();if(img){img.hidden=true;img.removeAttribute('src');}if(url)URL.revokeObjectURL(url);url='';}
  function paint(){list.innerHTML=items.map(n=>'<button data-track="'+h(n.id)+'" aria-pressed="'+(active===n.id)+'">'+icon(video?'video':music?'music':'image')+h(n.name)+'</button>').join('');}
  async function choose(id:string,play=false){
    const version=++generation;const item=items.find(n=>n.id===id);clear();active=id;paint();
    root.querySelector('.media-caption strong')!.textContent=item?.name??'Empty library';
    if(!item){status.textContent='Import a local '+(video?'video':music?'song':'picture')+' to begin.';return;}
    const blob=await fs.body(id);if(closed||version!==generation)return;
    url=URL.createObjectURL(blob);status.textContent=(video?'Video':music?'Audio':'Image')+' · '+Math.max(1,Math.round(item.size/1024))+' KB';
    if(audio){audio.src=url;if(play)await audio.play();}if(img){img.src=url;img.alt=item.name;img.hidden=false;}
  }
  async function refresh(){const seq=++scan,rows=await fs.all();if(closed||seq!==scan)return;items=rows.filter(matches).sort((a,b)=>a.name.localeCompare(b.name));
    if(!items.some(n=>n.id===active)){await choose(initial&&items.some(n=>n.id===initial)?initial:items[0]?.id??'');initial=undefined;}else paint();}
  function step(direction:number){if(items.length){const i=items.findIndex(n=>n.id===active);void choose(items[(i+direction+items.length)%items.length].id,!!audio&&!audio.paused).catch(fail);}}
  root.querySelector<HTMLButtonElement>('[data-prev]')!.onclick=()=>step(-1);root.querySelector<HTMLButtonElement>('[data-next]')!.onclick=()=>step(1);
  list.onclick=e=>{const id=(e.target as Element).closest<HTMLElement>('[data-track]')?.dataset.track;if(id)void choose(id,music||video).catch(fail);};
  root.querySelector<HTMLInputElement>('input')!.onchange=async e=>{const input=e.target as HTMLInputElement;try{for(const f of Array.from(input.files??[])){if(!matches({folder:false,type:f.type,name:f.name} as fs.Entry))throw Error('Unsupported file format.');const dest=video?'Documents':music?'Music':'Pictures';const entry=await fs.create((await fs.all()).some(n=>n.id===dest)?dest:fs.ROOT,f.name,f);await refresh();await choose(entry.id);}}catch(e){fail(e);}input.value='';};
  if(audio)audio.onerror=()=>status.textContent='This media format cannot be played by this browser.';
  if(img)img.onerror=()=>status.textContent='This picture could not be decoded.';
  const life=new AbortController();fs.onFilesChanged(()=>void refresh().catch(fail),life.signal);void refresh().catch(fail);return()=>{closed=true;life.abort();clear();};
}
export function mountCalculator(root:HTMLElement):void{
  root.innerHTML='<div class="tool-shell calculator"><p>Standard</p><input aria-label="Calculation" placeholder="0" inputmode="decimal"><output aria-live="polite">0</output><div class="keypad">'+['C','(',')','÷','7','8','9','×','4','5','6','−','1','2','3','+','⌫','0','.','='].map(k=>'<button>'+k+'</button>').join('')+'</div></div>';
  const field=root.querySelector('input')!,result=root.querySelector('output')!;let finished=false;
  function run(){try{result.textContent=String(calculate(field.value));finished=true;}catch(e){result.textContent=errorText(e);finished=false;}}
  root.querySelector<HTMLElement>('.keypad')!.onclick=e=>{const k=(e.target as Element).closest('button')?.textContent;if(!k)return;
    if(k==='='){run();return;}if(k==='C'){field.value='';result.textContent='0';}else if(k==='⌫')field.value=field.value.slice(0,-1);else{if(finished)field.value=/^[+×÷−]$/.test(k)?result.textContent??'':'';field.value+=k;}finished=false;};
  field.oninput=()=>{finished=false;};field.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();run();}};
}
