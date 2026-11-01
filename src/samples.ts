// Small original media for the first-run demo. No downloads or audio synthesis during playback.
export function firstLight():Blob{
  const rate=11025,count=rate*8,buffer=new ArrayBuffer(44+count*2),v=new DataView(buffer);
  function label(offset:number,s:string){for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i));}
  label(0,'RIFF');v.setUint32(4,36+count*2,true);label(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);label(36,'data');v.setUint32(40,count*2,true);
  const melody=[261.63,329.63,392,523.25,440,392,329.63,261.63];
  for(let i=0;i<count;i++){const t=i/rate,beat=t%1,f=melody[Math.floor(t)],envelope=Math.min(1,beat*35)*Math.exp(-beat*4)*Math.min(1,(1-beat)*30);
    v.setInt16(44+i*2,Math.round(6700*envelope*(Math.sin(2*Math.PI*f*t)+.22*Math.sin(4*Math.PI*f*t))),true);}
  return new Blob([buffer],{type:'audio/wav'});
}
export const afterglow=()=>new Blob(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560"><defs><linearGradient id="sky" x2=".8" y2="1"><stop stop-color="#253654"/><stop offset=".55" stop-color="#a587a6"/><stop offset="1" stop-color="#ffcb9f"/></linearGradient></defs><rect width="900" height="560" fill="url(#sky)"/><circle cx="610" cy="202" r="57" fill="#ffe3bb"/><path d="M0 342Q165 302 320 352T640 328T900 288V560H0" fill="#8c7893"/><path d="M0 425Q170 302 398 390T900 344V560H0" fill="#56567c"/><path d="M0 455Q178 478 365 414T712 423T900 400V560H0" fill="#313e60"/></svg>'],{type:'image/svg+xml'});
