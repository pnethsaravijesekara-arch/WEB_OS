const key='velora-next-alarm';
const changes=new EventTarget();
let target:number|null=read(),timer=0,powered=false;
function read():number|null{
  try{const value=Number(localStorage.getItem(key));return Number.isFinite(value)&&value>0?value:null;}catch{return null;}
}
function save(value:number|null){
  if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,String(value));
  target=value;changes.dispatchEvent(new Event('change'));schedule();
}
function schedule(){
  clearTimeout(timer);if(!powered||target===null)return;
  timer=window.setTimeout(ring,Math.min(2147483647,Math.max(0,target-Date.now())));
}
function ring(){
  if(!powered||target===null)return;
  if(Date.now()<target){schedule();return;}
  const due=target;save(null);
  const dialog=document.createElement('dialog');dialog.className='system-dialog alarm-ring';dialog.setAttribute('aria-label','Clock alarm');
  dialog.innerHTML='<h2>Alarm</h2><p></p><button>Dismiss</button>';
  dialog.querySelector('p')!.textContent=new Date(due).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})+' · Your alarm is ringing.';
  dialog.querySelector('button')!.onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();
  document.body.append(dialog);dialog.showModal();
  try{const audio=new AudioContext();const tone=audio.createOscillator(),gain=audio.createGain();
    tone.frequency.value=660;gain.gain.setValueAtTime(.10,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.6);
    tone.connect(gain).connect(audio.destination);tone.start();tone.stop(audio.currentTime+.62);tone.onended=()=>void audio.close();
    if(audio.state!=='running')void audio.resume().catch(()=>{});window.setTimeout(()=>{if(audio.state!=='closed')void audio.close().catch(()=>{});},1800);
  }catch{/* The visible alarm also works when audio is unavailable. */}
}
export function alarmPower(on:boolean){powered=on;schedule();}
window.addEventListener('storage',e=>{if(e.key===key||e.key===null){target=read();changes.dispatchEvent(new Event('change'));schedule();}});
export function mountAlarm(root:HTMLElement):()=>void{
  root.innerHTML='<label>Alarm time <input type="time" aria-label="Alarm time" required></label><div><button data-set>Set alarm</button> <button data-cancel>Cancel alarm</button></div><p role="status"></p>';
  const field=root.querySelector('input')!,status=root.querySelector('p')!,cancel=root.querySelector<HTMLButtonElement>('[data-cancel]')!;
  function render(){cancel.disabled=target===null;status.textContent=target===null?'No alarm scheduled. Keep Velora open for alarms.':'Next alarm · '+new Date(target).toLocaleString();}
  root.querySelector<HTMLButtonElement>('[data-set]')!.onclick=()=>{if(!field.reportValidity())return;const [hours,minutes]=field.value.split(':').map(Number);
    const due=new Date();due.setHours(hours,minutes,0,0);if(due.getTime()<=Date.now())due.setDate(due.getDate()+1);
    try{save(due.getTime());}catch{status.textContent='Alarm storage unavailable.';}
  };
  cancel.onclick=()=>{try{save(null);}catch{status.textContent='Could not cancel the saved alarm.';}};
  const life=new AbortController();changes.addEventListener('change',render,{signal:life.signal});render();return ()=>life.abort();
}
