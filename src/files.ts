import * as fs from './vfs';
import {ask,errorText,escapeHTML as h} from './ui';
import {icon} from './icons';
export function mountFiles(root:HTMLElement,openFile:(n:fs.Entry)=>void):()=>void{
  const lifetime=new AbortController();let folder=fs.ROOT,selected='',rows:fs.Entry[]=[],generation=0;
  root.innerHTML='<div class="tool-shell"><div class="tool-toolbar"><button data-f="up" aria-label="Parent folder">↑</button><strong class="file-path">/</strong><button data-f="folder">New folder</button><button data-f="file">New text</button><label class="import-button">Import<input type="file" multiple aria-label="Import local files"></label></div><div class="file-list"></div><div class="file-actions"><button data-f="open">Open</button><button data-f="rename">Rename</button><button data-f="move">Move</button><button data-f="delete">Delete</button></div><p class="tool-status" role="status"></p></div>';
  const list=root.querySelector<HTMLElement>('.file-list')!,status=root.querySelector<HTMLElement>('.tool-status')!;
  function paint(){const items=rows.filter(n=>n.parent===folder).sort((a,b)=>Number(b.folder)-Number(a.folder)||a.name.localeCompare(b.name));
    root.querySelector('.file-path')!.textContent=fs.pathOf(rows,folder);
    list.innerHTML=items.length?items.map(n=>'<button class="file-row" data-entry="'+h(n.id)+'" aria-pressed="'+(selected===n.id)+'">'+icon(n.folder?'folder':'file')+'<strong>'+h(n.name)+'</strong><small>'+(n.folder?'Folder':Math.max(1,Math.ceil(n.size/1024))+' KB')+'</small></button>').join(''):'<p class="tool-empty">This folder is empty.</p>';
    root.querySelectorAll<HTMLButtonElement>('.file-actions button').forEach(b=>b.disabled=!items.some(n=>n.id===selected));
    root.querySelector<HTMLButtonElement>('[data-f=up]')!.disabled=folder===fs.ROOT;
  }
  async function refresh(){const version=++generation;try{const latest=await fs.all();if(version!==generation||lifetime.signal.aborted)return;rows=latest;if(folder!==fs.ROOT&&!rows.some(n=>n.id===folder))folder=fs.ROOT;paint();}catch(e){status.textContent=errorText(e);}}
  function open(node:fs.Entry){if(node.folder){folder=node.id;selected='';paint();}else openFile(node);}
  async function action(name:string){const node=rows.find(n=>n.id===selected);status.textContent='';
    if(name==='up'){folder=rows.find(n=>n.id===folder)?.parent??fs.ROOT;selected='';paint();return;}
    if(name==='folder'||name==='file'){const value=await ask(name==='folder'?'New folder':'New text file','Choose a name in this folder.',{value:name==='folder'?'Untitled folder':'Untitled.txt',action:'Create'});if(value===null)return;selected=(await fs.create(folder,value,name==='file'?new Blob([''],{type:'text/plain'}):undefined)).id;await refresh();return;}
    if(!node)return;if(name==='open'){open(node);return;}
    if(name==='rename'){const value=await ask('Rename item',node.name,{value:node.name,action:'Rename'});if(value!==null)await fs.relocate(node.id,node.parent,value);}
    if(name==='move'){const choices:[string,string][]=[[fs.ROOT,'/'],...rows.filter(n=>n.folder&&n.id!==node.id).map(n=>[n.id,fs.pathOf(rows,n.id)] as [string,string])];const dest=await ask('Move to folder',node.name,{choices,action:'Move'});if(dest!==null)await fs.relocate(node.id,dest,node.name);}
    if(name==='delete'&&await ask('Delete '+node.name+'?',node.folder?'All items in this folder will be permanently removed.':'This file will be permanently removed.',{danger:true,action:'Delete'}))await fs.remove(node.id);
  }
  root.addEventListener('click',e=>{const target=e.target as Element;const row=target.closest<HTMLElement>('[data-entry]');if(row){selected=row.dataset.entry!;list.querySelectorAll<HTMLElement>('[data-entry]').forEach(b=>b.setAttribute('aria-pressed',String(b===row)));root.querySelectorAll<HTMLButtonElement>('.file-actions button').forEach(b=>b.disabled=false);return;}const task=target.closest<HTMLElement>('[data-f]')?.dataset.f;if(task)void action(task).catch(e=>status.textContent=errorText(e));});
  list.addEventListener('dblclick',e=>{const n=rows.find(n=>n.id===(e.target as Element).closest<HTMLElement>('[data-entry]')?.dataset.entry);if(n)open(n);});
  root.querySelector<HTMLInputElement>('input')!.onchange=async e=>{const input=e.target as HTMLInputElement;try{for(const file of Array.from(input.files??[]))await fs.create(folder,file.name,file);status.textContent='Import complete.';}catch(e){status.textContent=errorText(e);}input.value='';};
  fs.onFilesChanged(()=>void refresh(),lifetime.signal);void refresh();return()=>lifetime.abort();
}
