import {getPreferences,subscribePreferences} from './settings';
import {icon} from './icons';

type Reading={city:string;place:string;temperature:number;code:number;time:number};
function description(code:number):string{
  if(code===0)return 'Clear sky';if(code<=3)return ['','Mainly clear','Partly cloudy','Overcast'][code];
  if(code<=48)return 'Fog';if(code<=57)return 'Drizzle';if(code<=67)return 'Rain';if(code<=77)return 'Snow';if(code<=82)return 'Rain showers';if(code<=86)return 'Snow showers';return 'Thunderstorms';
}
export function mountWidgets(host:HTMLElement):void{
  host.innerHTML=`<button class="widget widget-clock" data-app="clock"><small>${icon('clock')} LOCAL TIME</small><strong data-clock></strong><span data-widget-date></span></button><button class="widget widget-date" data-app="calendar"><small>${icon('calendar')} CALENDAR</small><strong></strong><span></span></button><section class="widget widget-weather"><small>${icon('sun')} WEATHER</small><strong>—</strong><span class="weather-place"></span><small class="weather-status" role="status"></small><div><button class="weather-refresh">Refresh</button><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo ↗</a></div></section>`;
  const weather=host.querySelector<HTMLElement>('.widget-weather')!,value=weather.querySelector('strong')!,place=weather.querySelector<HTMLElement>('.weather-place')!,status=weather.querySelector<HTMLElement>('.weather-status')!,refresh=weather.querySelector('button')!;
  let controller:AbortController|undefined,reading:Reading|undefined,city='';
  try{const r=JSON.parse(localStorage.getItem('velora-weather')??'null');if(r&&typeof r.city==='string'&&typeof r.place==='string'&&Number.isFinite(r.temperature)&&Number.isFinite(r.time)&&Number.isInteger(r.code))reading=r;}catch{/* Storage may be disabled. */}
  function display(){
    const r=reading?.city===city?reading:undefined;
    value.textContent=r?Math.round(r.temperature)+'°C':'—';
    place.textContent=r?r.place+' · '+description(r.code):city||'Set a city in Settings';
    status.textContent=r?'Updated '+new Date(r.time).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):city?'Refresh for current weather':'';
    refresh.disabled=!city||!!controller;
  }
  async function load(){
    if(!city||controller)return;
    const active=new AbortController();controller=active;const query=city;
    const timeout=setTimeout(()=>active.abort(),12000);
    refresh.disabled=true;status.textContent='Checking weather…';
    async function json(url:string){const response=await fetch(url,{signal:active.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Weather service unavailable.');return response.json();}
    try{
      const data=await json('https://geocoding-api.open-meteo.com/v1/search?count=1&name='+encodeURIComponent(query));
      const location=data.results?.[0];if(!location||!Number.isFinite(location.latitude)||!Number.isFinite(location.longitude))throw Error('City not found. Edit it in Settings.');
      const forecast=await json('https://api.open-meteo.com/v1/forecast?latitude='+location.latitude+'&longitude='+location.longitude+'&current=temperature_2m,weather_code&timeformat=unixtime');
      const current=forecast.current;
      if(!Number.isFinite(current?.temperature_2m)||!Number.isFinite(current?.time)||!Number.isInteger(current?.weather_code))throw Error('Forecast unavailable.');
      if(controller!==active)return;
      reading={city:query,place:[location.name,location.country_code].filter(Boolean).join(', '),temperature:current.temperature_2m,code:current.weather_code,time:current.time*1000};
      try{localStorage.setItem('velora-weather',JSON.stringify(reading));}catch{/* Still display the live reading. */}
      display();
    }catch(e){if(controller===active){display();status.textContent=(reading?.city===city?status.textContent+' · ':'')+(e instanceof Error&&e.message.startsWith('City not')?e.message:'Weather unavailable. Try again online.');}}
    finally{clearTimeout(timeout);if(controller===active){controller=undefined;refresh.disabled=!city;}}
  }
  refresh.onclick=()=>void load();
  function sync(){
    const pref=getPreferences();host.dataset.skin=pref.widgetStyle;host.dataset.color=pref.widgetColor;host.dataset.position=pref.widgetPosition;
    host.querySelector<HTMLElement>('.widget-clock')!.hidden=!pref.widgetClock;
    host.querySelector<HTMLElement>('.widget-date')!.hidden=!pref.widgetCalendar;
    weather.hidden=!pref.widgetWeather;
    if(city!==pref.widgetCity||weather.hidden){controller?.abort();controller=undefined;city=pref.widgetCity;display();}
  }
  function calendarDate(){const now=new Date();host.querySelector('[data-widget-date]')!.textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
    host.querySelector('.widget-date strong')!.textContent=String(now.getDate()).padStart(2,'0');host.querySelector('.widget-date span')!.textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long'});}
  document.addEventListener('velora:tick',calendarDate);calendarDate();sync();display();subscribePreferences(sync);
}
