import * as fs from './vfs';
import { ask, errorText } from './ui';

export function mountPaint(root: HTMLElement):void {
  root.innerHTML=`<section class="tool-shell paint-app"><div class="tool-toolbar"><label>Ink <input type="color" value="#3256a6"></label><label>Brush <input type="range" min="1" max="42" value="7"></label><button data-erase aria-pressed="false">Eraser</button><button data-undo disabled>Undo</button><button data-save>Save PNG</button></div><div class="canvas-mat"><canvas width="960" height="560" aria-label="Drawing canvas. Use a pointer or arrow keys and Space to draw." tabindex="0"></canvas></div><p class="tool-status" role="status">Draw with your mouse, pen or finger.</p></section>`;
  const canvas=root.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
  const undo=root.querySelector<HTMLButtonElement>('[data-undo]')!,erase=root.querySelector<HTMLButtonElement>('[data-erase]')!;
  const status=root.querySelector<HTMLElement>('.tool-status')!;
  const history: ImageData[]=[];
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  let pointer:number|null=null, x=480,y=280;
  function stroke(){history.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(history.length>5)history.shift();undo.disabled=false;}
  function draw(nx:number,ny:number){
    ctx.lineWidth=root.querySelector<HTMLInputElement>('[type=range]')!.valueAsNumber;
    ctx.strokeStyle=ctx.fillStyle=erase.getAttribute('aria-pressed')==='true'?'#fff':root.querySelector<HTMLInputElement>('[type=color]')!.value;
    ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();
    ctx.beginPath();ctx.arc(nx,ny,ctx.lineWidth/2,0,2*Math.PI);ctx.fill();x=nx;y=ny;status.textContent='Drawing · unsaved changes';
  }
  function point(e:PointerEvent):[number,number]{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];}
  canvas.onpointerdown=e=>{if(pointer!==null||e.button!==0)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);stroke();[x,y]=point(e);draw(x,y);};
  canvas.onpointermove=e=>{if(e.pointerId===pointer)draw(...point(e));};
  canvas.onlostpointercapture=()=>{pointer=null;};
  canvas.onkeydown=e=>{if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp',' '].includes(e.key))return;e.preventDefault();if(!e.repeat)stroke();draw(Math.min(960,Math.max(0,x+(e.key==='ArrowRight'?8:e.key==='ArrowLeft'?-8:0))),Math.min(560,Math.max(0,y+(e.key==='ArrowDown'?8:e.key==='ArrowUp'?-8:0))));};
  undo.onclick=()=>{const last=history.pop();if(last)ctx.putImageData(last,0,0);undo.disabled=!history.length;status.textContent='Stroke undone';};
  erase.onclick=()=>erase.setAttribute('aria-pressed',String(erase.getAttribute('aria-pressed')!=='true'));
  root.querySelector<HTMLButtonElement>('[data-save]')!.onclick=async()=>{
    const name=await ask('Save drawing','Save a PNG to your virtual Pictures folder.',{value:'Sketch.png'});
    if(!name)return;
    try{const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG export failed.')),'image/png'));
      const rows=await fs.all(),entry=await fs.create(rows.some(e=>e.id==='Pictures')?'Pictures':fs.ROOT,/\.png$/i.test(name)?name:name+'.png',png);
      status.textContent='Saved '+entry.name+' · open it in Gallery';
    }catch(err){status.textContent=errorText(err);}
  };
}
