import * as fs from './vfs';
import { apps, type AppId } from './apps';
import { errorText } from './ui';

export function mountTerminal(root:HTMLElement, open:(id:AppId)=>void):void {
  root.innerHTML='<section class="shell-console"><div class="transcript" role="log" aria-label="Terminal output"></div><form><label><span>/ ❯</span><input aria-label="Terminal command" spellcheck="false" autocomplete="off"></label></form></section>';
  const output=root.querySelector<HTMLElement>('.transcript')!,field=root.querySelector('input')!,prompt=root.querySelector('label span')!;
  let cwd=fs.ROOT,path='/',index=0;
  const history:string[]=[];
  function print(text:string){const line=document.createElement('pre');line.textContent=text;output.append(line);if(output.children.length>150)output.firstChild?.remove();output.scrollTop=output.scrollHeight;}
  print('Velora Shell 1.0\nType help for commands. Paths belong to your Velora drive.');
  field.onkeydown=e=>{if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;e.preventDefault();index=Math.min(history.length,Math.max(0,index+(e.key==='ArrowUp'?-1:1)));field.value=history[index]??'';};
  root.querySelector('form')!.onsubmit=async e=>{
    e.preventDefault();const raw=field.value.trim();if(!raw||field.disabled)return;
    field.value='';history.push(raw);if(history.length>100)history.shift();index=history.length;print(path+' ❯ '+raw);
    field.disabled=true;
    try {
      const words=raw.match(/"[^"]*"|'[^']*'|[^\s]+/g)??[];
      const [command,...args]=words.map(w=>w.replace(/^(["'])(.*)\1$/,'$2'));
      const arg=args.join(' ');
      if(command==='clear'){output.replaceChildren();return;}
      if(command==='help'){print('pwd   ls [path]   cd [folder]   cat <text file>\nmkdir <name>   touch <name>   date   clear\napps   open <app>   history\nUse ↑ and ↓ to recall commands.');return;}
      if(command==='date'){print(new Date().toLocaleString());return;}
      if(command==='history'){print(history.join('\n'));return;}
      if(command==='apps'){print(apps.map(a=>a.name).join(' · '));return;}
      if(command==='open'){const app=apps.find(a=>a.name.toLowerCase()===arg.toLowerCase()||a.id===arg.toLowerCase());if(!app)throw Error('Unknown app. Type apps to list names.');open(app.id);return;}
      const rows=await fs.all();
      if(cwd!==fs.ROOT&&!rows.some(n=>n.id===cwd)){cwd=fs.ROOT;path='/';}
      const resolve=(value:string)=>fs.resolvePath(rows,cwd,value);
      const folder=(value:string)=>{const id=resolve(value);if(id!==fs.ROOT&&!rows.find(n=>n.id===id)?.folder)throw Error('Expected a directory.');return id;};
      switch(command){
        case 'pwd': print(fs.pathOf(rows,cwd));break;
        case 'cd': cwd=folder(arg||'/');break;
        case 'ls': {const id=folder(arg);print(rows.filter(n=>n.parent===id).map(n=>n.name+(n.folder?'/':'')).sort().join('\n')||'(empty directory)');break;}
        case 'cat': {const node=rows.find(n=>n.id===resolve(arg));if(!node||node.folder||!node.type.startsWith('text/'))throw Error('Choose a text file.');print(await (await fs.body(node.id)).slice(0,32768).text());break;}
        case 'touch':case 'mkdir': await fs.create(cwd,arg,command==='touch'?new Blob([],{type:'text/plain'}):undefined);break;
        default: throw Error('Unknown command: '+command+'. Type help.');
      }
      path=fs.pathOf(rows,cwd);
    }catch(err){print('Error · '+errorText(err));}
    finally{prompt.textContent=path+' ❯';field.disabled=false;if(root.closest('.is-active'))field.focus();}
  };
}
