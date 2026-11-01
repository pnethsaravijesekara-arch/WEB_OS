import * as fs from './vfs';
import { ask, errorText } from './ui';

export function mountCalendar(root: HTMLElement): () => void {
  const today = new Date();
  let selected = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let entries: fs.Entry[] = [];
  const life = new AbortController();
  const dayKey = (d: Date) => [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  root.innerHTML = `<section class="tool-shell agenda"><header class="tool-toolbar"><button data-prev aria-label="Previous calendar month">‹</button><h2></h2><button data-next aria-label="Next calendar month">›</button><button data-today>Today</button></header><div class="month-grid"></div><section class="agenda-list"><h3></h3><div class="events"></div><button data-add>Add event</button></section><p class="tool-status" role="status"></p></section>`;
  const grid = root.querySelector<HTMLElement>('.month-grid')!;
  const status = root.querySelector<HTMLElement>('.tool-status')!;
  function render() {
    const year = selected.getFullYear(), month = selected.getMonth();
    root.querySelector('h2')!.textContent = selected.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    root.querySelector('h3')!.textContent = selected.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    grid.innerHTML = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>'<small>'+x+'</small>').join('') + '<span></span>'.repeat((new Date(year,month,1).getDay()+6)%7);
    for (let d=1; d<=new Date(year,month+1,0).getDate(); d++) {
      const date = new Date(year,month,d), key=dayKey(date), button=document.createElement('button');
      button.textContent=String(d);
      button.setAttribute('aria-label',key);
      button.setAttribute('aria-pressed',String(d===selected.getDate()));
      if(entries.some(e=>e.name.startsWith(key+' '))) button.className='has-event';
      button.onclick=()=>{ selected=date;render();grid.querySelector<HTMLButtonElement>('[aria-pressed=true]')?.focus(); };
      grid.append(button);
    }
    const events=root.querySelector<HTMLElement>('.events')!;
    events.replaceChildren();
    const matching=entries.filter(e=>e.name.startsWith(dayKey(selected)+' '));
    if(!matching.length) events.textContent='No events for this day.';
    for(const e of matching) {
      const row=document.createElement('p'), name=e.name.slice(11,-4);
      const remove=document.createElement('button'); remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+name);
      remove.onclick=async()=>{if(await ask('Remove event?',name,{action:'Remove',danger:true}))try{await fs.remove(e.id);}catch(err){status.textContent=errorText(err);}};
      row.append(name,remove);events.append(row);
    }
  }
  root.querySelector<HTMLButtonElement>('[data-prev]')!.onclick=()=>{selected=new Date(selected.getFullYear(),selected.getMonth()-1,1);render();};
  root.querySelector<HTMLButtonElement>('[data-next]')!.onclick=()=>{selected=new Date(selected.getFullYear(),selected.getMonth()+1,1);render();};
  root.querySelector<HTMLButtonElement>('[data-today]')!.onclick=()=>{selected=new Date();render();};
  root.querySelector<HTMLButtonElement>('[data-add]')!.onclick=async()=>{
    const day=dayKey(selected);
    const title=(await ask('New event',day,{value:'',action:'Add event'}))?.trim();
    if(!title)return;
    try {
      const stamp=day.replaceAll('-',''), now=new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
      const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Velora//Calendar//EN','BEGIN:VEVENT','UID:'+Math.random().toString(36).slice(2)+'@velora','DTSTAMP:'+now,'DTSTART;VALUE=DATE:'+stamp,'SUMMARY:'+title.replace(/([,;])/g,'\\$1'),'END:VEVENT','END:VCALENDAR',''].join('\r\n');
      const rows=await fs.all();
      await fs.create(rows.some(e=>e.id==='Documents')?'Documents':fs.ROOT, day+' '+title+'.ics',new Blob([content],{type:'text/calendar'}));status.textContent='Event saved on this device';
    } catch(err){status.textContent=errorText(err);}
  };
  async function refresh(){try{entries=(await fs.all()).filter(e=>e.type==='text/calendar'&&/^\d{4}-\d{2}-\d{2} .+\.ics$/.test(e.name));render();}catch(err){status.textContent=errorText(err);}}
  fs.onFilesChanged(()=>void refresh(),life.signal);render();void refresh();
  return ()=>life.abort();
}
