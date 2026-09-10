const colors={main:'#245a78',optional:'#b86f36',hotel:'#705b86',flight:'#3e6b55'};
let map,routeLayer,markerLayer,lastRouteBounds=null,mapResizeTimer=null,currentIndex=0,showOptional=true;

function markerIcon(type,n){const c=colors[type]||colors.main;return L.divIcon({className:'',html:`<div class="marker-pin" style="background:${c}"><span>${n}</span></div>`,iconSize:[28,28],iconAnchor:[14,28],popupAnchor:[0,-27]});}
function visibleStops(day){return day.stops.filter(s=>showOptional||s.type!=='optional');}
function mapStopsForDay(day){
  const stops=visibleStops(day);
  if(day.id==='0924')return stops.filter(s=>s.name.includes('SGN')||s.name.includes('District 1 住宿区域'));
  if(day.id==='0927')return stops.filter(s=>!s.name.includes('Sydney Airport'));
  if(day.id==='1005')return stops.filter(s=>s.name.includes('SGN')||s.name.includes('Tan Binh')||s.name.includes('Phu Nhuan'));
  return stops;
}

function fitCurrentRoute({animate=false}={}){
  if(!map||!lastRouteBounds)return;
  map.invalidateSize({pan:false,debounceMoveend:true});
  requestAnimationFrame(()=>{
    map.invalidateSize({pan:false,debounceMoveend:true});
    if(lastRouteBounds.isValid()){
      const count=mapStopsForDay(itinerary[currentIndex]).length;
      if(count===1)map.setView(lastRouteBounds.getCenter(),14,{animate});
      else map.fitBounds(lastRouteBounds,{paddingTopLeft:[58,70],paddingBottomRight:[58,74],maxZoom:15,animate});
    }
    setTimeout(()=>map.invalidateSize({pan:false,debounceMoveend:true}),180);
  });
}

function initMap(){
  if(!window.L){document.getElementById('mapFallback').style.display='flex';return;}
  map=L.map('map',{zoomControl:true,attributionControl:true,preferCanvas:true}).setView([-33.8688,151.2093],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  routeLayer=L.layerGroup().addTo(map);
  markerLayer=L.layerGroup().addTo(map);
  renderMap();
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>{
      clearTimeout(mapResizeTimer);
      mapResizeTimer=setTimeout(()=>map&&map.invalidateSize({pan:false,debounceMoveend:true}),80);
    });
    ro.observe(document.getElementById('map'));
  }
  window.addEventListener('resize',()=>{
    clearTimeout(mapResizeTimer);
    mapResizeTimer=setTimeout(()=>{
      if(map){map.invalidateSize({pan:false,debounceMoveend:true});fitCurrentRoute();}
    },140);
  });
  setTimeout(()=>fitCurrentRoute(),250);
}

function renderMap(){
  if(!map)return;
  routeLayer.clearLayers();markerLayer.clearLayers();
  const day=itinerary[currentIndex],stops=mapStopsForDay(day),bounds=L.latLngBounds([]);
  stops.forEach((s,i)=>{
    L.marker([s.lat,s.lng],{icon:markerIcon(s.type,i+1)})
      .bindPopup(`<b>${i+1}. ${s.name}</b>${s.note?`<br>${s.note}`:''}${s.type==='optional'?"<br><span style='color:#b86f36'>可选加密点</span>":''}`)
      .addTo(markerLayer);
    bounds.extend([s.lat,s.lng]);
  });
  for(let i=0;i<stops.length-1;i++){
    const a=stops[i],b=stops[i+1],optional=a.type==='optional'||b.type==='optional';
    L.polyline([[a.lat,a.lng],[b.lat,b.lng]],{color:optional?colors.optional:colors.main,weight:3,opacity:.78,dashArray:optional?'7 7':null,lineCap:'round',lineJoin:'round'}).addTo(routeLayer);
  }
  lastRouteBounds=bounds;
  document.getElementById('mapTitle').textContent=`${day.date} · ${day.title}`;
  document.getElementById('mapScopeNote').textContent=day.region==='travel'?'跨国飞行日只显示当天需要实际执行的本地路线；航班仅公开大致时段。':'Leaflet + OpenStreetMap · 切换日期后自动完整适配当天全部可见点位。';
  fitCurrentRoute();
}

function renderSidebar(){
  const root=document.getElementById('days');root.innerHTML='';
  itinerary.forEach((d,i)=>{
    const btn=document.createElement('button');
    btn.className=`day-card ${i===currentIndex?'active':''}`;
    btn.innerHTML=`<div class="date-chip"><strong>${d.date}</strong><small>${d.weekday}</small></div><div class="day-main"><strong>${d.title}</strong><span>${d.city}</span></div><span class="dot ${d.region}"></span>`;
    btn.onclick=()=>selectDay(i);
    root.appendChild(btn);
  });
}

function renderDetail(){
  const d=itinerary[currentIndex],stops=visibleStops(d);
  document.getElementById('detailTitle').textContent=`${d.date} ${d.weekday}｜${d.title}`;
  document.getElementById('detailMeta').textContent=d.city;
  document.getElementById('strategy').textContent=d.strategy;
  document.getElementById('stay').textContent=d.stay;
  const tl=document.getElementById('timeline');tl.innerHTML='';
  stops.forEach((s,i)=>{
    const el=document.createElement('div');el.className=`stop ${s.type}`;
    let badge=s.type==='optional'?'<span class="badge optional">可选</span>':s.type==='hotel'?'<span class="badge hotel">住宿区域</span>':s.type==='flight'?'<span class="badge transport">航班 / 机场</span>':'';
    el.innerHTML=`<div class="num">${i+1}</div><div><div class="stop-title">${s.name}</div>${s.note?`<div class="stop-note">${s.note}</div>`:''}${badge?`<div class="badges">${badge}</div>`:''}</div>`;
    tl.appendChild(el);
  });
  const tr=document.getElementById('transports');tr.innerHTML='';
  d.transport.forEach(([a,b])=>{
    const row=document.createElement('div');row.className='transport-row';
    row.innerHTML=`<b>${a}</b><span>${b}</span>`;
    tr.appendChild(row);
  });
}

function selectDay(i){
  currentIndex=i;location.hash=itinerary[i].id;
  renderSidebar();renderDetail();renderMap();
  if(window.innerWidth<900)document.getElementById('map').scrollIntoView({behavior:'smooth',block:'start'});
}
function dayText(d,includeOptional=true){
  const stops=d.stops.filter(s=>includeOptional||s.type!=='optional');
  return `${d.date} ${d.weekday}｜${d.title}\n${stops.map((s,i)=>`${i+1}. ${s.name}${s.type==='optional'?'（可选）':''}${s.note?` — ${s.note}`:''}`).join('\n')}\n交通：${d.transport.map(x=>`${x[0]} ${x[1]}`).join('；')}`;
}
function mainText(){
  return itinerary.map(d=>{
    const names=d.stops.filter(s=>s.type!=='optional'&&s.type!=='hotel'&&s.type!=='flight').map(s=>s.name);
    return `${d.date} ${d.weekday}｜${d.title}${names.length?`：${names.join(' → ')}`:''}`;
  }).join('\n');
}
function googleMapsDirectionsUrl(day){
  const stops=visibleStops(day);if(!stops.length)return'https://www.google.com/maps';
  if(stops.length===1)return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0].lat+','+stops[0].lng)}`;
  const o=stops[0],d=stops[stops.length-1];let mids=stops.slice(1,-1);
  if(mids.length>9){const sampled=[];for(let i=0;i<9;i++)sampled.push(mids[Math.round(i*(mids.length-1)/8)]);mids=sampled;}
  const wp=mids.map(s=>`${s.lat},${s.lng}`).join('|');
  let url=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o.lat+','+o.lng)}&destination=${encodeURIComponent(d.lat+','+d.lng)}`;
  if(wp)url+=`&waypoints=${encodeURIComponent(wp)}`;
  return url;
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600);}
async function copyText(t,msg='已复制'){
  try{await navigator.clipboard.writeText(t);toast(msg);}
  catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast(msg);}
}

document.getElementById('optionalToggle').addEventListener('change',e=>{showOptional=e.target.checked;renderDetail();renderMap();});
document.getElementById('copyDay').onclick=()=>copyText(dayText(itinerary[currentIndex],showOptional),'当天行程已复制');
document.getElementById('copyMain').onclick=()=>copyText(mainText(),'全部主线已复制');
document.getElementById('shareDay').onclick=()=>copyText(location.href.split('#')[0]+'#'+itinerary[currentIndex].id,'此日链接已复制');
document.getElementById('fitRouteBtn').onclick=()=>fitCurrentRoute({animate:true});
document.getElementById('openGoogle').onclick=()=>window.open(googleMapsDirectionsUrl(itinerary[currentIndex]),'_blank','noopener');
const hash=location.hash.replace('#',''),idx=itinerary.findIndex(x=>x.id===hash);if(idx>=0)currentIndex=idx;renderSidebar();renderDetail();initMap();
