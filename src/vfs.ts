import {afterglow,firstLight} from './samples';
export type Entry = { id:string; parent:string; name:string; folder:boolean; type:string; size:number; modified:number };
export const ROOT = 'root';
const changes = new EventTarget();
export const onFilesChanged = (fn:EventListener, signal:AbortSignal) => changes.addEventListener('change',fn,{signal});
let connection:Promise<IDBDatabase>|undefined;
const cleanName=(name:string)=>{
  name=name.trim();
  if(!name||name==='.'||name==='..'||name.length>120||/[\\/\x00-\x1f]/.test(name)) throw Error('Use a name of 1–120 characters without slashes.');
  return name;
};
function database():Promise<IDBDatabase>{
  if(!connection) connection=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open('velora-drive',2);
    request.onupgradeneeded=()=>{
      const fresh=!request.result.objectStoreNames.contains('entries');
      const entries=fresh?request.result.createObjectStore('entries',{keyPath:'id'}):request.transaction!.objectStore('entries');
      const bodies=fresh?request.result.createObjectStore('bodies'):request.transaction!.objectStore('bodies');
      if(fresh){
      for(const name of ['Documents','Pictures','Music'])entries.put({id:name,parent:ROOT,name,folder:true,type:'',size:0,modified:Date.now()});
      const text=new Blob(['Welcome to Velora.\n\nThis drive lives in your browser. Create a file, import a song or open the terminal to explore.'],{type:'text/plain'});
      entries.put({id:'readme',parent:'Documents',name:'Welcome.txt',folder:false,type:text.type,size:text.size,modified:Date.now()});bodies.put(text,'readme');
      }
      for(const [id,parent,name,blob] of [['demo-pic','Pictures','Afterglow.svg',afterglow()],['demo-audio','Music','First Light.wav',firstLight()]] as const){
        const q=entries.get(parent);q.onsuccess=()=>{entries.put({id,parent:q.result?parent:ROOT,name,folder:false,type:blob.type,size:blob.size,modified:Date.now()});bodies.put(blob,id);};
      }
    };
    request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();connection=undefined;};resolve(request.result);};
    request.onerror=()=>reject(Error('Browser storage is unavailable.'));
    request.onblocked=()=>reject(Error('Close other Velora tabs and try again.'));
  }).catch((e:unknown)=>{connection=undefined;throw e;});
  return connection;
}
async function read<T>(store:string,key?:string):Promise<T>{
  const db=await database();
  return new Promise((resolve,reject)=>{const table=db.transaction(store).objectStore(store);const req=key===undefined?table.getAll():table.get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
}
export async function all():Promise<Entry[]>{return read<Entry[]>('entries');}
export async function body(id:string):Promise<Blob>{const b=await read<Blob|undefined>('bodies',id);if(!b)throw Error('File no longer exists.');return b;}
type Tables={entries:IDBObjectStore;bodies:IDBObjectStore};
// Validate against the current metadata inside one read/write transaction, including across tabs.
async function change<T>(fn:(rows:Entry[],tables:Tables)=>T):Promise<T>{
  const db=await database();return new Promise((resolve,reject)=>{
    const tx=db.transaction(['entries','bodies'],'readwrite');
    const tables={entries:tx.objectStore('entries'),bodies:tx.objectStore('bodies')};
    let result:T;let problem:unknown;const query=tables.entries.getAll();
    query.onsuccess=()=>{try{result=fn(query.result,tables);}catch(e){problem=e;tx.abort();}};
    tx.oncomplete=()=>{changes.dispatchEvent(new Event('change'));resolve(result);};
    tx.onabort=()=>reject(problem??tx.error??Error('Save failed. Check available storage.'));
  });
}
function validate(rows:Entry[],parent:string,name:string,except=''):void{
  if(parent!==ROOT&&!rows.some(e=>e.id===parent&&e.folder))throw Error('Destination folder no longer exists.');
  if(rows.some(e=>e.parent===parent&&e.id!==except&&e.name.toLowerCase()===name.toLowerCase()))throw Error('That name is already in use.');
}
export function create(parent:string,name:string,blob?:Blob):Promise<Entry>{
  return change((rows,t)=>{name=cleanName(name);validate(rows,parent,name);
    if(blob&&blob.size>64*1024*1024)throw Error('Choose a file no larger than 64 MB.');
    const entry={id:crypto.randomUUID?.()??Math.random().toString(36).slice(2),parent,name,folder:!blob,type:blob?.type??'',size:blob?.size??0,modified:Date.now()};
    t.entries.add(entry);if(blob)t.bodies.add(blob,entry.id);return entry;
  });
}
export function pathOf(rows:Entry[],id:string):string{
  const names:string[]=[];const seen=new Set<string>();
  while(id!==ROOT){const node=rows.find(n=>n.id===id);if(!node||seen.has(id))throw Error('Path does not exist.');seen.add(id);names.unshift(node.name);id=node.parent;}return '/'+names.join('/');
}
export function resolvePath(rows:Entry[],cwd:string,input:string):string{
  let id=input.startsWith('/')?ROOT:cwd;
  for(const part of input.split('/')){if(!part||part==='.')continue;if(part==='..'){id=rows.find(n=>n.id===id)?.parent??ROOT;continue;}
    const entry=rows.find(n=>n.parent===id&&n.name.toLowerCase()===part.toLowerCase());if(!entry)throw Error('Path not found: '+input);id=entry.id;}
  return id;
}
export function relocate(id:string,parent:string,name:string):Promise<void>{
  return change((rows,t)=>{const node=rows.find(n=>n.id===id);if(!node)throw Error('Item no longer exists.');
    name=cleanName(name);validate(rows,parent,name,id);let cursor=parent;
    while(cursor!==ROOT){if(cursor===id)throw Error('A folder cannot be moved into itself.');cursor=rows.find(n=>n.id===cursor)!.parent;}
    t.entries.put({...node,parent,name,modified:Date.now()});
  });
}
export function remove(id:string):Promise<void>{
  return change((rows,t)=>{if(!rows.some(n=>n.id===id))throw Error('Item no longer exists.');
    const queue=[id];for(let i=0;i<queue.length;i++){const key=queue[i];queue.push(...rows.filter(n=>n.parent===key).map(n=>n.id));t.entries.delete(key);t.bodies.delete(key);}
  });
}
export function write(id:string,blob:Blob,expected?:number):Promise<number>{
  return change((rows,t)=>{const node=rows.find(n=>n.id===id&&!n.folder);if(!node)throw Error('File no longer exists.');
    if(expected!==undefined&&node.modified!==expected)throw Error('Another window changed this note. Reopen it or save a copy.');
    const modified=Math.max(Date.now(),node.modified+1);t.entries.put({...node,type:blob.type,size:blob.size,modified});t.bodies.put(blob,id);return modified;
  });
}
