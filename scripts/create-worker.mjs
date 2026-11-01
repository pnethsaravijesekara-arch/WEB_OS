import {readFile, readdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const urls=(await readdir('dist',{recursive:true,withFileTypes:true}))
  .filter(f=>f.isFile()&&f.name!=='sw.js'&&f.name!=='Velora.html')
  .map(f=>(f.parentPath+'/'+f.name).replaceAll('\\','/').replace(/^.*?dist\//,'')).sort();
const digest=createHash('sha256');
for(const path of urls)digest.update(path).update(await readFile('dist/'+path));
const source=`
const base=self.registration.scope;
const prefix='velora-first-light:'+base+':';
const version=prefix+${JSON.stringify(digest.digest('hex').slice(0,16))};
const urls=${JSON.stringify(urls)}.map(p=>new URL(p,base).href);
const shell=new URL('index.html',base).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(version).then(cache=>cache.addAll(urls))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(prefix)&&key!==version)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);url.hash='';url.search='';
  const navigation=event.request.mode==='navigate'&&(url.href===base||url.href===shell);
  if(!navigation&&!urls.includes(url.href))return;
  event.respondWith(caches.open(version).then(cache=>cache.match(navigation?shell:url.href)).then(hit=>hit||fetch(event.request)));
});
`;
await writeFile('dist/sw.js',source.trimStart());
console.log('Offline shell prepared with '+urls.length+' local assets.');
