// Make page scrolling win over accidental map zoom/pan.
// Desktop: mouse wheel scrolls the roadbook; use +/- to zoom the map.
// Touch devices: vertical swipes scroll the page; markers and zoom controls remain usable.
(function(){
  if(typeof map==='undefined' || !map) return;

  if(map.scrollWheelZoom) map.scrollWheelZoom.disable();

  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if(coarse){
    if(map.dragging) map.dragging.disable();
    if(map.touchZoom) map.touchZoom.disable();
    if(map.doubleClickZoom) map.doubleClickZoom.disable();
  }

  const el=map.getContainer();
  el.setAttribute('title','滚轮 / 上下滑动用于浏览当天行程；地图缩放请使用 + / − 按钮');

  setTimeout(()=>{
    map.invalidateSize({pan:false});
    if(typeof fitCurrentRoute==='function') fitCurrentRoute({animate:false});
  },80);
})();
