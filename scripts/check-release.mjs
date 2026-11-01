// Exercise the exact generated worker with a CacheStorage double and disabled network.
// Also verify the Windows launcher target, portable dependencies, and the hosted manifest.
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const base='https://qa.invalid/velora/', handlers={}, stores=new Map();
let online=true,claimed=false,served=0;
const self={registration:{scope:base},clients:{claim(){claimed=true;}},addEventListener:(name,handler)=>handlers[name]=handler};
const caches={
  async open(key){
    if(!stores.has(key))stores.set(key,new Map());
    const files=stores.get(key);
    return {
      async addAll(urls){for(const url of urls){assert(online);files.set(url,await readFile('dist/'+url.slice(base.length)));}},
      async match(url){return files.get(url);}
    };
  },
  async keys(){return [...stores.keys()];},
  async delete(key){return stores.delete(key);}
};
vm.runInNewContext(await readFile('dist/sw.js','utf8'),{self,caches,URL,fetch(){throw Error('Network disabled');}});
async function run(name){let result;handlers[name]({waitUntil(p){result=p;}});await result;}
await run('install');online=false;await run('activate');assert(claimed);
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
const index=await readFile('dist/index.html','utf8');
const targets=['',...Array.from(index.matchAll(/(?:href|src)="\.\/([^"]+)"/g),m=>m[1]),...manifest.icons.map(i=>i.src),'aurora.webp'];
for(const path of targets){
  let promise;handlers.fetch({request:{url:base+path,method:'GET',mode:path?'cors':'navigate'},respondWith(p){promise=p;}});
  const result=await promise;assert(result?.length,'Offline cache miss: '+path);served++;
}
const portable=await readFile('Velora.html','utf8'),bat=await readFile('Start Velora.bat','utf8');
assert.match(bat,/start "" "%~dp0Velora.html"/);assert.match(portable,/data-portable/);
assert.doesNotMatch(portable,/<script[^>]+src=|<link[^>]*rel="manifest"|url\([^)]*aurora\.webp/i);
assert.match(portable,/data:image\/webp;base64/);
console.log('PASS: '+served+' production requests served with network disabled in the worker harness. Portable export and Windows launcher target verified.');
