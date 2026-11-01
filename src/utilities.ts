import * as fs from './vfs';
import { errorText } from './ui';

export function mountClock(root:HTMLElement):()=>void {
  root.innerHTML=`<section class="tool-shell time-app"><div class="tool-toolbar"><select aria-label="Clock mode"><option>Stopwatch</option><option>Timer</option></select></div><div class="time-face"><small>VELORA CLOCK</small><output aria-label="Elapsed time">00:00.0</output><label hidden>Minutes <input type="number" min=".1" max="1440" step=".1" value="5"></label><div><button data-start>Start</button> <button data-reset>Reset</button></div><p role="status"></p></div></section>`;
  const mode=root.querySelector('select')!,input=root.querySelector('input')!,display=root.querySelector('output')!;
  const start=root.querySelector<HTMLButtonElement>('[data-start]')!,status=root.querySelector('p')!;
  let since:number|null=null,elapsed=0,timer=0;
  const duration=()=>Math.max(0,(input.valueAsNumber||0)*60000);
  function paint(){
    const t=elapsed+(since===null?0:performance.now()-since);
    const ms=mode.value==='Timer'?Math.max(0,duration()-t):t;
    display.textContent=String(Math.floor(ms/60000)).padStart(2,'0')+':'+String(Math.floor(ms/1000)%60).padStart(2,'0')+'.'+Math.floor(ms%1000/100);
    if(mode.value==='Timer'&&ms<=0&&since!==null){stop();elapsed=0;status.textContent='Time is up.';}
  }
  function stop(){if(since!==null)elapsed+=performance.now()-since;since=null;clearInterval(timer);start.textContent='Start';input.disabled=false;}
  function reset(){stop();elapsed=0;status.textContent='';root.querySelector('label')!.hidden=mode.value!=='Timer';paint();}
  start.onclick=()=>{if(since!==null){stop();paint();return;}if(mode.value==='Timer'&&!input.reportValidity())return;
    status.textContent='';since=performance.now();input.disabled=true;start.textContent='Pause';timer=window.setInterval(paint,100);paint();};
  mode.onchange=reset;input.oninput=reset;root.querySelector<HTMLButtonElement>('[data-reset]')!.onclick=reset;
  return stop;
}

export function mountRecorder(root:HTMLElement):()=>void {
  root.innerHTML=`<section class="tool-shell"><div class="time-face recorder"><small>VELORA SOUND RECORDER</small><h2>Voice memo</h2><p>Record a memo using your microphone. Stop to save it to Music.</p><button>Record</button><p role="status">Ready</p></div></section>`;
  const button=root.querySelector('button')!,status=root.querySelector<HTMLElement>('[role=status]')!;
  let stream:MediaStream|undefined,recorder:MediaRecorder|undefined,closed=false;
  function release(){stream?.getTracks().forEach(t=>t.stop());stream=undefined;}
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){button.disabled=true;status.textContent='Microphone recording requires a supported browser on HTTPS or localhost.';}
  button.onclick=async()=>{
    if(recorder?.state==='recording'){button.disabled=true;recorder.stop();return;}
    button.disabled=true;
    try{
      stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(closed){release();return;}
      const session=new MediaRecorder(stream),chunks:Blob[]=[];let bytes=0;recorder=session;
      session.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);bytes+=e.data.size;if(bytes>=60*1024*1024&&session.state==='recording')session.stop();}};
      session.onstop=async()=>{
        release();
        try{const blob=new Blob(chunks,{type:session.mimeType}),ext=session.mimeType.includes('mp4')?'m4a':session.mimeType.includes('ogg')?'ogg':'webm';
          const name='Memo '+new Date().toISOString().replace(/[:.]/g,'-')+'.'+ext;
          const rows=await fs.all();await fs.create(rows.some(n=>n.id==='Music')?'Music':fs.ROOT,name,blob);status.textContent='Saved '+name;
        }catch(err){status.textContent=errorText(err);}finally{button.disabled=false;button.textContent='Record';}
      };
      session.start(1000);button.textContent='Stop and save';button.disabled=false;status.textContent='Recording…';
    }catch(err){release();button.disabled=false;status.textContent=errorText(err);}
  };
  return ()=>{closed=true;if(recorder?.state==='recording')recorder.stop();release();};
}
