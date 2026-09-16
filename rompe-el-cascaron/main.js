(function(){
"use strict";

/* ───────── formato ───────── */
var SUF=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Ud","Dd","Td"];
function fmt(n){
  if(!isFinite(n)) return "∞";
  if(n<0) return "0";
  if(n<1000) return n<10 ? (Math.round(n*10)/10).toString().replace(".",",") : Math.floor(n).toString();
  var t=Math.floor(Math.log10(n)/3);
  if(t>=SUF.length) return n.toExponential(2).replace("e+","e").replace(".",",");
  var m=n/Math.pow(1000,t);
  return (m<10?m.toFixed(2):m<100?m.toFixed(1):m.toFixed(0)).replace(".",",")+SUF[t];
}
function fmtx(n){ return "×"+(n<10?n.toFixed(2):n<1000?n.toFixed(1):fmt(n)).replace(".",","); }
function clock(s){var m=Math.floor(s/60),x=Math.floor(s%60);return (m<10?"0":"")+m+":"+(x<10?"0":"")+x;}

/* ───────── datos ───────── */
var GENS=[
 {id:"auto", n:"Pollito",      d:"Picotea sin parar.",                   base:.1,   cost:15,   r:1.13, col:"#FFD95E", kind:"chick"},
 {id:"macro",n:"Gallina",      d:"Pone mientras tú miras.",              base:1,    cost:180,  r:1.14, col:"#FFF4DF", kind:"hen"},
 {id:"farm", n:"Pato",         d:"Trabaja en equipo, en fila.",          base:8,    cost:2200, r:1.14, col:"#BBE4FF", kind:"duck"},
 {id:"loop", n:"Avestruz",     d:"Huevos enormes, patadas enormes.",     base:47,   cost:26e3, r:1.15, col:"#D9C3A5", kind:"ostrich"},
 {id:"bal",  n:"Tortuga",      d:"Lenta, pero pone de cien en cien.",    base:260,  cost:33e4, r:1.15, col:"#7FCB8A", kind:"turtle"},
 {id:"meta", n:"Dino",         d:"Un huevo que produce huevos.",         base:1400, cost:51e5, r:1.16, col:"#8FD96F", kind:"dino"},
 {id:"sing", n:"Dragón",       d:"Incuba a mil grados.",                 base:7800, cost:75e6, r:1.16, col:"#FF7A6B", kind:"dragon"},
 {id:"omeg", n:"Fénix",        d:"Renace cada vez que casca.",           base:44e3, cost:1e9,  r:1.17, col:"#FFB03A", kind:"phoenix"}
];
var THRESH=[10,25,50,100,150,200,300,500];

/* skins = mejoras */
var SKINS=[
 {id:"s0", t:"Huevo blanco",    d:"El de siempre",          c:0,     k:"none",  v:1,   base:"#FFF4DF", acc:"#E8D3B0", pat:"plain"},
 {id:"s1", t:"Moteado",         d:"×2 al golpe",            c:100,   k:"click", v:2,   base:"#FFE7C4", acc:"#C98A4B", pat:"dots"},
 {id:"s2", t:"Rayado",          d:"×2 al golpe",            c:1200,  k:"click", v:2,   base:"#FFF0D8", acc:"#5FCB6B", pat:"stripes"},
 {id:"s3", t:"Mármol",          d:"×1,5 a la producción",   c:5e3,   k:"glob",  v:1.5, base:"#EDEFF5", acc:"#9AA6C4", pat:"marble"},
 {id:"s4", t:"Dorado",          d:"×3 al golpe",            c:45e3,  k:"click", v:3,   base:"#FFD449", acc:"#C98A00", pat:"gold"},
 {id:"s5", t:"Dinosaurio",      d:"×2 a la producción",     c:2e5,   k:"glob",  v:2,   base:"#9BE07C", acc:"#3E8F3A", pat:"dino"},
 {id:"s6", t:"Cristal",         d:"+1 % de tu /s al golpe", c:6e5, k:"syn", v:.01, base:"#CFF3FF", acc:"#6FC8E8", pat:"glass"},
 {id:"s7", t:"Galáctico",       d:"×5 al golpe",            c:1e7,   k:"click", v:5,   base:"#3B2E6E", acc:"#B79BFF", pat:"galaxy"},
 {id:"s8", t:"Lava",            d:"×2 a la producción",     c:5e7,   k:"glob",  v:2,   base:"#3A2018", acc:"#FF6A20", pat:"lava"},
 {id:"s9", t:"Arcoíris",        d:"+10 % de tu /s al golpe", c:4e8, k:"syn", v:.10, base:"#FFE9F3", acc:"#FF6B8A", pat:"rainbow"},
 {id:"s10",t:"Hielo",           d:"×3 a la producción",     c:1e10,  k:"glob",  v:3,   base:"#DCF4FF", acc:"#5AB6E8", pat:"ice"},
 {id:"s11",t:"Cósmico",         d:"×10 al golpe",           c:8e10,  k:"click", v:10,  base:"#101736", acc:"#61E3FF", pat:"cosmic"},
 {id:"s12",t:"Mítico",          d:"×5 a la producción",     c:5e12,  k:"glob",  v:5,   base:"#FFF0B8", acc:"#B267E8", pat:"myth"}
];

var METAS=[
 {id:"m1", t:"Nido acolchado",       d:"Pones al 50 % mientras estás fuera, con techo de 8 h.",       c:1},
 {id:"m2", t:"Huevo dorado",         d:"Cada 1-3 min cruza el nido: ×7 durante 30 s.",                c:3},
 {id:"m3", t:"Incubadora encendida", d:"Empiezas cada puesta con 25 pollitos.",                       c:8},
 {id:"m4", t:"Cáscara fina",         d:"−0,01 al ritmo de encarecimiento de todo el corral.",         c:25},
 {id:"m5", t:"Puesta doble",         d:"Los hitos ×2 llegan a la mitad de animales.",                 c:70},
 {id:"m6", t:"Genética compuesta",   d:"Los Genes ganados pasan de raíz 0,50 a raíz 0,55.",           c:150},
 {id:"m7", t:"Granja consolidada",   d:"×5 a toda la producción, para siempre.",                      c:400}
];

var LESSONS=[
 {id:"l1", t:"El bucle primordial es un botón",
  p:"Todo el género cabe en una frase: haz algo aburrido a mano hasta que puedas pagar para no hacerlo. El primer golpe no es contenido, es el contrato — te enseña qué recurso importa antes de enseñarte nada más.",
  s:"Wikipedia · Incremental game"},
 {id:"l2", t:"La recompensa es dejar de jugar",
  p:"En cualquier otro género comprar un arma te deja jugar más. Aquí, tu primer pollito hace el trabajo por ti. El género convierte la automatización en el premio, y por eso funciona con la pestaña cerrada.",
  s:"Medium · Idle vs Incremental vs Tycoon"},
 {id:"l3", t:"La curva ×1,15",
  p:"Cada animal cuesta un porcentaje fijo más que el anterior: entre ×1,07 y ×1,15 en casi todos los idles conocidos. Parece poco y es brutal — a los 50 niveles, ×1,15 multiplica el precio por más de mil. Esa curva es la que crea el muro que luego rompes con multiplicadores.",
  s:"Game Developer · The Math of Idle Games", curve:true},
 {id:"l4", t:"Muros y multiplicadores",
  p:"El coste crece exponencialmente, así que sumar animales nunca gana la carrera. Las skins multiplicativas sí. El ritmo real del juego es un diente de sierra: te frenas, compras un ×2, vuelas, te frenas otra vez.",
  s:"Eric Guan · Idle Game Design Principles"},
 {id:"l5", t:"Hitos: la recompensa programada",
  p:"A los 10, 25 y 50 animales, la especie dobla su producción. Es refuerzo de intervalo fijo: sabes exactamente cuánto falta, y esa barra que se llena sostiene la sesión mucho mejor que el número creciendo solo.",
  s:"Bugnet · How to Design an Idle Game"},
 {id:"l6", t:"Cuando los números dejan de caber",
  p:"Al pasar el millón, los dígitos exactos dejan de comunicar. Por eso el género inventó su propia tipografía: sufijos (K, M, B, T), luego notación científica, y en los juegos más profundos capas enteras de notación. Leer «1,00M» es una decisión de diseño, no de formato.",
  s:"Antimatter Dimensions · convención del género"},
 {id:"l7", t:"El prestigio no es un castigo",
  p:"Reiniciar suena a perder. Funciona porque no lo es: vuelves con una moneda meta que hace la siguiente partida más rápida. La regla no escrita es que la nueva vuelta debe notarse más veloz en los primeros 30 segundos, o el jugador no vuelve.",
  s:"Bugnet · prestige loops"},
 {id:"l8", t:"Los primeros 30 segundos",
  p:"Acabas de volver a poner. Si has notado el empujón enseguida, el reinicio se siente como acelerar. Ese contraste — un tramo que antes costó media hora y ahora cuesta un minuto — es la sensación que el género vende, y la razón de que casi todo idle acabe implementando prestigio.",
  s:"DEV · 7 idle games in 30 days"},
 {id:"l9", t:"Offline: el techo de 8 horas",
  p:"El progreso ausente convierte dormir en parte del juego. Casi nadie lo da al 100 %: lo habitual es la mitad del ritmo y un techo de unas 8 horas. El techo protege dos cosas — la economía, y la razón para volver mañana.",
  s:"Geek Extreme · offline progression math"},
 {id:"l10", t:"Recompensa variable",
  p:"El huevo dorado aparece cuando quiere y multiplica por siete. Es el mismo refuerzo de intervalo variable que estudió Skinner y que usan las tragaperras: lo impredecible engancha más que lo garantizado. Es la herramienta más potente del género y la más fácil de usar mal.",
  s:"Medium · por qué son adictivos"},
 {id:"l11", t:"Capas sobre capas",
  p:"Un idle largo no es una curva, son curvas encadenadas: justo cuando dominas una capa se abre otra con moneda y reglas propias. Los referentes del género —Antimatter Dimensions, Melvor Idle— viven de eso, no de números más grandes.",
  s:"Top Incremental Games · ranking 2026"},
 {id:"l12", t:"Saber cuándo parar",
  p:"Un idle honesto tiene final, o al menos un sitio donde el jugador puede irse satisfecho. Las mismas técnicas que sostienen una buena curva —refuerzo variable, techos, metas siempre a la vista— son las que, sin freno, convierten el juego en una obligación. Diseñar el género es elegir dónde poner ese freno.",
  s:"Conclusión del estudio"}
];

/* ───────── dibujo ───────── */
var UID=0;
var EGG_PATH="M50 4C78 4 94 44 94 76c0 30-20 50-44 50S6 106 6 76C6 44 22 4 50 4z";
function eggSVG(sk, cracks, big){
  var u="e"+(UID++), pat="", defs="";
  var A=sk.acc;
  if(sk.pat==="dots") pat='<g fill="'+A+'"><circle cx="32" cy="42" r="7"/><circle cx="64" cy="34" r="5"/><circle cx="70" cy="66" r="8"/><circle cx="30" cy="78" r="6"/><circle cx="50" cy="100" r="7"/><circle cx="72" cy="100" r="4"/></g>';
  if(sk.pat==="stripes") pat='<g fill="'+A+'"><path d="M4 44h92v11H4z"/><path d="M4 70h92v11H4z"/><path d="M4 96h92v11H4z"/></g>';
  if(sk.pat==="marble") pat='<g fill="none" stroke="'+A+'" stroke-width="5" stroke-linecap="round"><path d="M14 50q20 14 34 2t38 8"/><path d="M10 82q22-12 40 4t42-6"/></g>';
  if(sk.pat==="gold"){ defs='<linearGradient id="g'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF0AE"/><stop offset=".5" stop-color="#FFD449"/><stop offset="1" stop-color="#D79A00"/></linearGradient>';
    pat='<rect x="0" y="0" width="100" height="130" fill="url(#g'+u+')"/><path d="M26 30q10 18 4 34" stroke="#FFF8D4" stroke-width="7" fill="none" stroke-linecap="round"/>'; }
  if(sk.pat==="dino") pat='<g fill="'+A+'"><path d="M20 46l14-10 10 14-13 10z"/><path d="M56 30l16 8-6 16-15-8z"/><path d="M30 82l16-8 8 16-14 9z"/><path d="M64 72l14 10-10 14-12-12z"/></g>';
  if(sk.pat==="glass"){ pat='<g fill="'+A+'" opacity=".55"><path d="M50 8L22 62l28 56 28-56z"/></g><g fill="none" stroke="#FFFFFF" stroke-width="4" opacity=".85"><path d="M50 8v112M22 62h56"/></g>'; }
  if(sk.pat==="galaxy"){ defs='<radialGradient id="g'+u+'"><stop offset="0" stop-color="#7B5BD6"/><stop offset="1" stop-color="#241A4D"/></radialGradient>';
    pat='<rect width="100" height="130" fill="url(#g'+u+')"/><g fill="#FFF6C8"><circle cx="30" cy="38" r="3.4"/><circle cx="66" cy="30" r="2.4"/><circle cx="74" cy="62" r="3"/><circle cx="26" cy="74" r="2.6"/><circle cx="52" cy="54" r="2"/><circle cx="44" cy="96" r="3.2"/><circle cx="70" cy="100" r="2.2"/></g>'; }
  if(sk.pat==="lava"){ pat='<g fill="'+A+'"><path d="M4 60q14 12 26 0t24 10 22-12 20 8v18q-12-10-22 2t-22-8-24 10-24-8z"/></g><g fill="#FFC02E"><circle cx="34" cy="90" r="5"/><circle cx="62" cy="102" r="4"/></g>'; }
  if(sk.pat==="rainbow"){ defs='<linearGradient id="g'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6B8A"/><stop offset=".25" stop-color="#FFC02E"/><stop offset=".5" stop-color="#5FCB6B"/><stop offset=".75" stop-color="#4FB8F0"/><stop offset="1" stop-color="#B267E8"/></linearGradient>';
    pat='<rect width="100" height="130" fill="url(#g'+u+')"/>'; }
  if(sk.pat==="ice"){ pat='<g stroke="'+A+'" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M50 26v40M34 40l32 18M66 40L34 58"/><path d="M50 74v34M36 86l28 14M64 86l-28 14"/></g>'; }
  if(sk.pat==="cosmic"){ defs='<radialGradient id="g'+u+'"><stop offset="0" stop-color="#2B3B86"/><stop offset="1" stop-color="#0A0F26"/></radialGradient>';
    pat='<rect width="100" height="130" fill="url(#g'+u+')"/><ellipse cx="50" cy="70" rx="46" ry="13" fill="none" stroke="'+A+'" stroke-width="5" transform="rotate(-18 50 70)"/><g fill="#FFFFFF"><circle cx="28" cy="36" r="2.6"/><circle cx="70" cy="44" r="2"/><circle cx="60" cy="102" r="2.4"/></g>'; }
  if(sk.pat==="myth"){ defs='<linearGradient id="g'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6C8"/><stop offset="1" stop-color="#E8C6FF"/></linearGradient>';
    pat='<rect width="100" height="130" fill="url(#g'+u+')"/><path d="M50 28l7 16 17 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2z" fill="'+A+'"/>'; }

  var cr="";
  if(cracks>0){
    var seg=[ "M18 56l14-7 9 10", "M41 59l13 9 12-10", "M66 58l12 6", "M22 82l13 8 11-9",
              "M46 81l14 9 12-10", "M24 100l14-7 10 9", "M48 102l14 8 12-9", "M30 40l12 7" ];
    cr='<g stroke="#4A3221" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    for(var i=0;i<Math.min(cracks,seg.length);i++) cr+='<path d="'+seg[i]+'"/>';
    cr+='</g>';
  }
  return '<svg viewBox="-4 -4 108 138" aria-hidden="true">'+
    (defs?'<defs>'+defs+'</defs>':'')+
    '<clipPath id="c'+u+'"><path d="'+EGG_PATH+'"/></clipPath>'+
    '<path d="'+EGG_PATH+'" fill="'+sk.base+'"/>'+
    '<g clip-path="url(#c'+u+')">'+pat+
      '<ellipse cx="34" cy="40" rx="11" ry="16" fill="#FFFFFF" opacity=".4" transform="rotate(-18 34 40)"/>'+
      cr+
    '</g>'+
    '<path d="'+EGG_PATH+'" fill="none" stroke="#3A2415" stroke-width="'+(big?6:7)+'"/>'+
  '</svg>';
}
function critterSVG(g){
  var acc="", body=g.col;
  var kind=g.kind;
  if(kind==="chick") acc='<path d="M24 6q4-5 8 0" stroke="#3A2415" stroke-width="2.4" fill="none"/>';
  if(kind==="hen") acc='<path d="M17 13q3-8 7-2 4-6 7 2z" fill="#FF6B6B" stroke="#3A2415" stroke-width="2.2" stroke-linejoin="round"/>';
  if(kind==="duck") acc='<path d="M6 27q-6 2 0 6" fill="#FF8A3D" stroke="#3A2415" stroke-width="2.2"/>';
  if(kind==="ostrich") acc='<path d="M24 14V4" stroke="#3A2415" stroke-width="3"/><circle cx="24" cy="3" r="3" fill="'+body+'" stroke="#3A2415" stroke-width="2"/>';
  if(kind==="turtle") acc='<path d="M10 30q14-16 28 0z" fill="#3E8F3A" stroke="#3A2415" stroke-width="2.2"/>';
  if(kind==="dino") acc='<path d="M12 14l5-8 4 7 5-8 4 8 5-7 4 8z" fill="#3E8F3A" stroke="#3A2415" stroke-width="2.2" stroke-linejoin="round"/>';
  if(kind==="dragon") acc='<path d="M14 12l-6-9 10 3zM34 12l6-9-10 3z" fill="#C0392B" stroke="#3A2415" stroke-width="2.2" stroke-linejoin="round"/>';
  if(kind==="phoenix") acc='<g stroke="#FF8A3D" stroke-width="3" stroke-linecap="round"><path d="M24 9V2M13 13L9 7M35 13l4-6"/></g>';
  return '<svg viewBox="-2 -2 52 52" aria-hidden="true">'+
   '<ellipse cx="24" cy="45" rx="13" ry="2.6" fill="rgba(0,0,0,.2)"/>'+ acc+
   '<rect x="8" y="13" width="32" height="29" rx="14" fill="'+body+'" stroke="#3A2415" stroke-width="2.6"/>'+
   '<path d="M8 34q16 10 32 0v2a16 14 0 0 1-32 0z" fill="#FFF4DF" stroke="#3A2415" stroke-width="2.2"/>'+
   '<circle cx="17.5" cy="24" r="5.4" fill="#FFFBF0" stroke="#3A2415" stroke-width="2.2"/>'+
   '<circle cx="30.5" cy="24" r="5.4" fill="#FFFBF0" stroke="#3A2415" stroke-width="2.2"/>'+
   '<circle cx="19" cy="25" r="2.3" fill="#3A2415"/><circle cx="32" cy="25" r="2.3" fill="#3A2415"/>'+
   '<path d="M20 31l4 4 4-4z" fill="#FF8A3D" stroke="#3A2415" stroke-width="2" stroke-linejoin="round"/>'+
  '</svg>';
}
function goldenSVG(){
  return '<svg viewBox="-4 -4 108 138" aria-hidden="true"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">'+
   '<stop offset="0" stop-color="#FFF3B0"/><stop offset=".5" stop-color="#FFC02E"/><stop offset="1" stop-color="#D08A00"/></linearGradient></defs>'+
   '<path d="'+EGG_PATH+'" fill="url(#gg)" stroke="#3A2415" stroke-width="7"/>'+
   '<circle cx="38" cy="66" r="4" fill="#3A2415"/><circle cx="62" cy="66" r="4" fill="#3A2415"/>'+
   '<path d="M40 84q10 9 20 0" fill="none" stroke="#3A2415" stroke-width="4.5" stroke-linecap="round"/></svg>';
}

/* ───────── estado ───────── */
var KEY="rompe-el-cascaron-v1";
var S, qty=1, lastTick=Date.now(), lastSave=0, goldAt=0, shownLesson={};
var comboN=0, comboUntil=0, lastClickT=0, hatching=false;

function fresh(){
  return {c:0, total:0, run:0, manual:0, hatches:0, cracks:0,
    g:{}, skins:["s0"], equip:"s0", metas:[], ins:0, insTotal:0, pres:0,
    lessons:["l1"], t0:Date.now(), last:Date.now(), frenzy:0, mute:false};
}
function load(){
  var raw=null;
  try{ raw=localStorage.getItem(KEY); }catch(e){}
  if(!raw){ S=fresh(); return false; }
  try{ var o=JSON.parse(raw); S=fresh(); for(var k in o) if(o.hasOwnProperty(k)) S[k]=o[k]; return true; }
  catch(e){ S=fresh(); return false; }
}
function save(){ S.last=Date.now(); try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function has(a,id){ return a.indexOf(id)>-1; }
function skinById(id){ for(var i=0;i<SKINS.length;i++) if(SKINS[i].id===id) return SKINS[i]; return SKINS[0]; }

/* ───────── sonido ───────── */
var AC=null;
function ac(){
  if(AC===null){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=false; } }
  if(AC && AC.state==="suspended") AC.resume();
  return AC;
}
function tone(f,dur,type,vol,when,f2){
  if(S.mute) return; var c=ac(); if(!c) return;
  var t=c.currentTime+(when||0), o=c.createOscillator(), g=c.createGain();
  o.type=type||"sine"; o.frequency.setValueAtTime(f,t);
  if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol||.05,t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.02);
}
function noise(dur,freq,q,vol,when){
  if(S.mute) return; var c=ac(); if(!c) return;
  var t=c.currentTime+(when||0);
  var n=Math.max(1,Math.floor(c.sampleRate*dur)), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
  for(var i=0;i<n;i++){ var k=1-i/n; d[i]=(Math.random()*2-1)*k*k; }
  var src=c.createBufferSource(); src.buffer=b;
  var flt=c.createBiquadFilter(); flt.type="bandpass"; flt.frequency.value=freq; flt.Q.value=q;
  var g=c.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(flt); flt.connect(g); g.connect(c.destination); src.start(t); src.stop(t+dur+.02);
}
var sfx={
  crack:function(){
    noise(.075, 1500+Math.random()*1800, 1.1, .22);
    noise(.035, 4200+Math.random()*1500, 2.2, .12, .012);
    tone(150+Math.random()*60,.05,"triangle",.05);
  },
  hatch:function(){
    noise(.3, 900, .7, .3);
    noise(.12, 2600, 1.4, .18, .05);
    tone(700,.22,"sine",.09,.14,1900);
    tone(1500,.18,"sine",.07,.3,900);
  },
  buy:function(){ tone(523,.09,"triangle",.06,0); tone(659,.09,"triangle",.06,.07); tone(784,.14,"triangle",.06,.14); },
  mile:function(){ tone(880,.18,"sine",.07,0); tone(1320,.22,"sine",.05,.06); },
  equip:function(){ tone(1046,.09,"sine",.06,0); tone(1568,.12,"sine",.05,.07); },
  gold:function(){ [523,659,784,1046,1318].forEach(function(f,i){ tone(f,.13,"sine",.06,i*.05); }); },
  pres:function(){ [392,523,659,784,1046].forEach(function(f,i){ tone(f,.2,"triangle",.07,i*.09); }); }
};

/* ───────── cálculo ───────── */
function ratio(g){ return has(S.metas,"m4") ? g.r-0.01 : g.r; }
function costOf(g,n,k){ var r=ratio(g), b=g.cost*Math.pow(r,n); return k<=1?b:b*(Math.pow(r,k)-1)/(r-1); }
function maxBuy(g,n,money){
  var r=ratio(g), b=g.cost*Math.pow(r,n);
  if(money<b) return 0;
  return Math.max(0,Math.min(Math.floor(Math.log(money*(r-1)/b+1)/Math.log(r)),5000));
}
function milestones(count){
  var half=has(S.metas,"m5"), m=0;
  for(var i=0;i<THRESH.length;i++) if(count>=(half?Math.ceil(THRESH[i]/2):THRESH[i])) m++;
  return m;
}
function nextMilestone(count){
  var half=has(S.metas,"m5");
  for(var i=0;i<THRESH.length;i++){
    var need=half?Math.ceil(THRESH[i]/2):THRESH[i];
    if(count<need){ var prev=i===0?0:(half?Math.ceil(THRESH[i-1]/2):THRESH[i-1]);
      return {need:need,pct:(count-prev)/(need-prev)}; }
  }
  return null;
}
function comboMult(){ return Date.now()<comboUntil ? 1+Math.min(comboN,30)*0.0667 : 1; }
function globalMult(){
  var m=1;
  for(var i=0;i<SKINS.length;i++) if(SKINS[i].k==="glob" && has(S.skins,SKINS[i].id)) m*=SKINS[i].v;
  m*= 1+0.10*S.ins;
  if(has(S.metas,"m7")) m*=5;
  if(S.frenzy>Date.now()) m*=7;
  return m;
}
function clickMult(){
  var m=1;
  for(var i=0;i<SKINS.length;i++) if(SKINS[i].k==="click" && has(S.skins,SKINS[i].id)) m*=SKINS[i].v;
  m*= 1+0.10*S.ins;
  if(S.frenzy>Date.now()) m*=7;
  return m*comboMult();
}
function synergy(){
  var s=0;
  for(var i=0;i<SKINS.length;i++) if(SKINS[i].k==="syn" && has(S.skins,SKINS[i].id)) s=Math.max(s,SKINS[i].v);
  return s;
}
function genRate(g){ var n=S.g[g.id]||0; return n?g.base*n*Math.pow(2,milestones(n)):0; }
function baseRate(){ var t=0; for(var i=0;i<GENS.length;i++) t+=genRate(GENS[i]); return t; }
function rate(){ return baseRate()*globalMult(); }
function clickValue(){ return 1*clickMult() + rate()*synergy(); }
function insightGain(){
  if(S.total<1e6) return 0;
  var e=has(S.metas,"m6")?0.55:0.50;
  return Math.max(0, Math.floor(Math.pow(S.total/1e6,e)) - S.ins);
}
function hatchNeed(){ return Math.min(40, 10+S.hatches*2); }

/* ───────── partículas ───────── */
var cv=document.getElementById("fx"), ctx=cv.getContext("2d"), parts=[], reduce=false;
try{ reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}
function sizeCanvas(){
  var r=cv.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.max(1,r.width*d); cv.height=Math.max(1,r.height*d);
  ctx.setTransform(d,0,0,d,0,0);
}
function burst(x,y,n,colors,big){
  if(reduce) return;
  for(var i=0;i<n;i++){
    var a=Math.random()*Math.PI*2, sp=(big?2.6:1.5)+Math.random()*3;
    parts.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.7,life:1,
      c:colors[(Math.random()*colors.length)|0], s:(big?4.5:3)+Math.random()*3.5, rot:Math.random()*6});
  }
  if(parts.length>460) parts.splice(0,parts.length-460);
}
var SHELL=["#FFF4DF","#F3E0C4","#E8D3B0","#FFFBF0"];
var PARTY=["#FFC02E","#FF8A3D","#5FCB6B","#4FB8F0","#B267E8","#FF6B8A"];
function drawFX(){
  ctx.clearRect(0,0,cv.width,cv.height);
  for(var i=parts.length-1;i>=0;i--){
    var p=parts[i];
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; p.vx*=0.99; p.life-=0.017; p.rot+=0.13;
    if(p.life<=0){ parts.splice(i,1); continue; }
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.c; ctx.strokeStyle="#3A2415"; ctx.lineWidth=1.3;
    ctx.beginPath();
    ctx.moveTo(-p.s/2,-p.s/2); ctx.lineTo(p.s/2,-p.s/3); ctx.lineTo(p.s/2.4,p.s/2); ctx.lineTo(-p.s/2.2,p.s/2.6);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  requestAnimationFrame(drawFX);
}
function floatNum(x,y,txt,color){
  var el=document.createElement("span");
  el.textContent=txt;
  el.style.cssText="position:absolute;left:"+x+"px;top:"+y+"px;z-index:9;pointer-events:none;font-family:'Luckiest Guy',cursive;"+
    "font-size:"+(16+Math.min(comboN,10))+"px;color:"+(color||"#FFFBF0")+";text-shadow:2px 2px 0 #3A2415;"+
    "transform:translate(-50%,0) rotate("+((Math.random()*16)-8)+"deg);transition:transform .8s ease-out, opacity .8s ease-out";
  stage.appendChild(el);
  requestAnimationFrame(function(){ el.style.transform="translate(-50%,-58px) rotate(0deg)"; el.style.opacity="0"; });
  setTimeout(function(){ el.remove(); },850);
}

/* ───────── lecciones ───────── */
function unlock(id){ if(has(S.lessons,id)) return; S.lessons.push(id); shownLesson[id]=true; sfx.mile(); renderNotebook(); }
function checkLessons(){
  if(S.manual>=1) unlock("l1");
  var owned=0; for(var i=0;i<GENS.length;i++) owned+=(S.g[GENS[i].id]||0);
  if(owned>=1) unlock("l2");
  if(owned>=10) unlock("l3");
  if(S.skins.length>=2) unlock("l4");
  for(var j=0;j<GENS.length;j++) if(milestones(S.g[GENS[j].id]||0)>=1) unlock("l5");
  if(S.total>=1e6) unlock("l6");
  if(insightGain()>0 || S.pres>0) unlock("l7");
  if(S.pres>=1) unlock("l8");
  if(has(S.metas,"m1")) unlock("l9");
  if(has(S.metas,"m2")) unlock("l10");
  if((S.g.meta||0)>=1) unlock("l11");
  if(S.insTotal>=100) unlock("l12");
}

/* ───────── elementos ───────── */
var $=function(id){ return document.getElementById(id); };
var stage=$("stage"), clicker=$("clicker"), gensEl=$("gens"), skinsEl=$("skins"), metasEl=$("metas"),
    nbEl=$("notebook"), crewEl=$("crew"), goldEl=$("golden"), comboEl=$("combo"), crackEl=$("crackbar");

function paintEgg(){ clicker.innerHTML=eggSVG(skinById(S.equip), S.cracks, true); }

/* ───────── acciones ───────── */
function doClick(ev){
  if(hatching) return;
  var now=Date.now();
  comboN = (now-lastClickT<900) ? Math.min(comboN+1,30) : 1;
  lastClickT=now; comboUntil=now+1400;

  var v=clickValue();
  S.c+=v; S.total+=v; S.run+=v; S.manual++; S.cracks++;

  var r=stage.getBoundingClientRect();
  var x = ev && ev.clientX ? ev.clientX-r.left : r.width/2;
  var y = ev && ev.clientY ? ev.clientY-r.top : r.height*0.46;
  floatNum(x,y,"+"+fmt(v));
  burst(x,y,5+Math.min(comboN,9),SHELL);
  clicker.classList.add("hit");
  setTimeout(function(){ clicker.classList.remove("hit"); },85);
  if(comboN>=10 && !reduce){ stage.classList.add("shake"); setTimeout(function(){ stage.classList.remove("shake"); },170); }
  sfx.crack();

  if(S.cracks>=hatchNeed()) hatch(); else paintEgg();
  checkLessons(); paint();
}
function hatch(){
  hatching=true;
  S.cracks=0; S.hatches++;
  var bonus=Math.max(rate()*30, clickValue()*20);
  S.c+=bonus; S.total+=bonus; S.run+=bonus;
  sfx.hatch();
  var r=stage.getBoundingClientRect();
  burst(r.width/2, r.height*0.46, 40, SHELL, true);
  burst(r.width/2, r.height*0.46, 22, PARTY, true);
  floatNum(r.width/2, r.height*0.3, "¡ECLOSIÓN! +"+fmt(bonus), "#FFC02E");
  clicker.classList.add("hatching");
  setTimeout(function(){
    clicker.classList.remove("hatching");
    paintEgg();
    clicker.classList.add("born");
    setTimeout(function(){ clicker.classList.remove("born"); hatching=false; },400);
  },480);
  paint();
}
function buyGen(g){
  var n=S.g[g.id]||0;
  var k = qty==="max" ? maxBuy(g,n,S.c) : qty;
  if(k<1) return;
  var c=costOf(g,n,k);
  if(S.c<c) return;
  var before=milestones(n);
  S.c-=c; S.g[g.id]=n+k;
  sfx.buy();
  var rr=stage.getBoundingClientRect();
  burst(rr.width/2, rr.height-34, 16, PARTY, true);
  if(milestones(n+k)>before) sfx.mile();
  checkLessons(); renderGens(); renderCrew(); paint();
}
function clickSkin(sk){
  if(has(S.skins,sk.id)){
    if(S.equip!==sk.id){ S.equip=sk.id; sfx.equip(); paintEgg(); renderSkins(); }
    return;
  }
  if(S.c<sk.c) return;
  S.c-=sk.c; S.skins.push(sk.id); S.equip=sk.id;
  sfx.buy();
  var rr=stage.getBoundingClientRect();
  burst(rr.width/2, rr.height*0.46, 30, PARTY, true);
  paintEgg(); checkLessons(); renderSkins(); paint();
}
function buyMeta(m){
  if(has(S.metas,m.id) || S.ins<m.c) return;
  S.ins-=m.c; S.metas.push(m.id); sfx.mile();
  if(m.id==="m2") scheduleGold();
  checkLessons(); renderMetas(); renderGens(); paint();
}
function prestige(){
  var gain=insightGain();
  if(gain<=0) return;
  S.ins+=gain; S.insTotal+=gain; S.pres++;
  S.c=0; S.run=0; S.g={}; S.skins=["s0"]; S.equip="s0"; S.cracks=0;
  if(has(S.metas,"m3")) S.g.auto=25;
  S.t0=Date.now();
  sfx.pres();
  var rr=stage.getBoundingClientRect();
  burst(rr.width/2, rr.height/2, 90, PARTY, true);
  paintEgg(); checkLessons(); renderAll(); save();
  modal("¡Nueva puesta!", "Vuelves con "+fmt(S.ins)+" Genes en total. Mira el ritmo de los primeros 30 segundos: eso es lo que el género vende.", "+"+fmt(gain)+" Genes");
}

/* ───────── render ───────── */
function renderCrew(){
  var html="";
  for(var i=0;i<GENS.length;i++){
    var g=GENS[i], n=S.g[g.id]||0;
    if(!n) continue;
    html+='<div class="toon" style="animation-delay:'+(i*0.17).toFixed(2)+'s" title="'+g.n+'">'+
      critterSVG(g)+'<span class="badge">'+(n>999?fmt(n):n)+'</span></div>';
  }
  crewEl.innerHTML=html;
}
function renderGens(){
  var html="";
  for(var i=0;i<GENS.length;i++){
    var g=GENS[i], n=S.g[g.id]||0;
    var prev = i===0 ? 1 : (S.g[GENS[i-1].id]||0);
    var vis = n>0 || prev>0 || i===0;
    var k = qty==="max" ? Math.max(1,maxBuy(g,n,S.c)) : qty;
    var c = costOf(g,n,k), can = S.c>=c;
    var ms=milestones(n), nm=nextMilestone(n);
    html+='<button class="gen'+(vis?"":" locked")+(can&&vis?" can":"")+'" data-g="'+g.id+'"'+((!vis||!can)?" disabled":"")+'>'+
      '<span class="av">'+critterSVG(g)+'</span>'+
      '<span class="mid"><span class="nm">'+(vis?g.n:"— aún no —")+(ms>0?' <span class="tag">hito ×'+Math.pow(2,ms)+'</span>':'')+'</span>'+
        '<span class="ds">'+(vis?g.d:"Compra el anterior primero")+'</span>'+
        (vis?'<span class="rt">'+fmt(g.base*Math.pow(2,ms))+'/s cada uno'+(n>0?' · <b>'+fmt(genRate(g)*globalMult())+'/s</b>':'')+'</span>':'')+
        (vis&&nm?'<span class="mstone"><i style="width:'+Math.round(nm.pct*100)+'%"></i></span>':'')+
      '</span>'+
      '<span class="right"><span class="cnt">'+n+'</span><span class="cost">'+(vis?fmt(c)+(k>1?" ·×"+k:""):"—")+'</span></span>'+
    '</button>';
  }
  gensEl.innerHTML=html;
}
function renderSkins(){
  var html="", shown=0;
  for(var i=0;i<SKINS.length;i++){
    var sk=SKINS[i], own=has(S.skins,sk.id), eq=S.equip===sk.id;
    var vis = own || S.total>=sk.c*0.18 || shown<4;
    if(!vis) continue;
    shown++;
    var can=!own && S.c>=sk.c;
    var cls = eq?"equipped":(own?"owned":(can?"affordable":"locked"));
    html+='<button class="skin '+cls+'" data-s="'+sk.id+'"'+((own||can)?"":" disabled")+' title="'+sk.t+'">'+
      (eq?'<span class="eq">✓</span>':'')+
      eggSVG(sk,0,false)+
      '<span class="t">'+sk.t+'</span>'+
      '<span class="d">'+sk.d+'</span>'+
      '<span class="c">'+(own?(eq?"Puesta":"Ponérsela"):fmt(sk.c))+'</span>'+
    '</button>';
  }
  skinsEl.innerHTML=html;
  $("upCount").textContent=S.skins.length+" de "+SKINS.length;
}
function renderMetas(){
  var html="";
  for(var i=0;i<METAS.length;i++){
    var m=METAS[i], b=has(S.metas,m.id), can=!b && S.ins>=m.c;
    html+='<button class="meta'+(b?" bought":"")+'" data-m="'+m.id+'"'+(can?"":" disabled")+'>'+
      '<span><span class="t">'+m.t+'</span><br><span class="d">'+m.d+'</span></span>'+
      '<span class="c">'+(b?"✓":fmt(m.c))+'</span></button>';
  }
  metasEl.innerHTML=html;
}
function renderNotebook(){
  var html="";
  for(var i=0;i<LESSONS.length;i++){
    var l=LESSONS[i], u=has(S.lessons,l.id);
    html+='<div class="lesson'+(u?"":" lock")+(shownLesson[l.id]?" new":"")+'">'+
      '<div class="hdr"><span class="n">'+(u?(i+1):"?")+'</span><h4>'+(u?l.t:"Ficha por abrir")+'</h4></div>'+
      '<p>'+(u?l.p:"Se abre cuando el juego te haga vivir esta mecánica.")+'</p>'+
      (u?'<div class="src">Fuente: '+l.s+'</div>':'')+
      (u&&l.curve?'<div class="curve">'+curveSVG()+'</div>':'')+
    '</div>';
    shownLesson[l.id]=false;
  }
  nbEl.innerHTML=html;
  $("nbCount").textContent=S.lessons.length+" / 12";
  $("stLessons").textContent=S.lessons.length+"/12";
}
function curveSVG(){
  var W=300,H=132,L=34,R=8,T=12,B=22,p107="",p115="",lin="";
  var maxY=Math.pow(1.15,50);
  for(var i=0;i<=50;i++){
    var x=L+(W-L-R)*(i/50);
    var y107=H-B-(H-T-B)*(Math.log10(Math.pow(1.07,i))/Math.log10(maxY));
    var y115=H-B-(H-T-B)*(Math.log10(Math.pow(1.15,i))/Math.log10(maxY));
    var ylin=H-B-(H-T-B)*(Math.log10(1+i*0.2||1)/Math.log10(maxY));
    p107+=(i?" ":"")+x.toFixed(1)+","+y107.toFixed(1);
    p115+=(i?" ":"")+x.toFixed(1)+","+y115.toFixed(1);
    lin+=(i?" ":"")+x.toFixed(1)+","+ylin.toFixed(1);
  }
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Coste por unidad: lineal frente a x1,07 y x1,15 en 50 niveles">'+
   '<line x1="'+L+'" y1="'+(H-B)+'" x2="'+(W-R)+'" y2="'+(H-B)+'" stroke="currentColor" stroke-opacity=".4" stroke-width="1.5"/>'+
   '<line x1="'+L+'" y1="'+T+'" x2="'+L+'" y2="'+(H-B)+'" stroke="currentColor" stroke-opacity=".4" stroke-width="1.5"/>'+
   '<polyline fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="4 3" points="'+lin+'"/>'+
   '<polyline fill="none" stroke="#2A8DC4" stroke-width="2.4" points="'+p107+'"/>'+
   '<polyline fill="none" stroke="#DD6417" stroke-width="2.8" points="'+p115+'"/>'+
   '<text x="2" y="'+(T+4)+'" font-size="8.5" fill="currentColor" fill-opacity=".75" font-family="Fredoka, sans-serif">×1000</text>'+
   '<text x="14" y="'+(H-B+1)+'" font-size="8.5" fill="currentColor" fill-opacity=".75" font-family="Fredoka, sans-serif">×1</text>'+
   '<text x="'+L+'" y="'+(H-5)+'" font-size="8.5" fill="currentColor" fill-opacity=".75" font-family="Fredoka, sans-serif">nivel 0</text>'+
   '<text x="'+(W-R)+'" y="'+(H-5)+'" text-anchor="end" font-size="8.5" fill="currentColor" fill-opacity=".75" font-family="Fredoka, sans-serif">nivel 50</text>'+
   '<text x="'+(L+6)+'" y="'+(T+9)+'" font-size="9" font-weight="600" fill="#DD6417" font-family="Fredoka, sans-serif">×1,15 → ×1.084 en 50 niveles</text>'+
   '<text x="'+(L+6)+'" y="'+(T+21)+'" font-size="9" font-weight="600" fill="#2A8DC4" font-family="Fredoka, sans-serif">×1,07 → ×29 en 50 niveles</text>'+
  '</svg>';
}

var lastBank=0;
function paint(){
  var bankEl=$("bank");
  bankEl.textContent=fmt(S.c);
  if(S.c>lastBank+0.0001 && !reduce){ bankEl.classList.add("pop"); setTimeout(function(){ bankEl.classList.remove("pop"); },90); }
  lastBank=S.c;

  var r=rate();
  $("rate").textContent=fmt(r);
  $("clickval").textContent="+"+fmt(clickValue());
  $("clickval2").textContent="+"+fmt(clickValue())+" yema"+(clickValue()===1?"":"s");
  $("stTotal").textContent=fmt(S.total);
  $("stInsight").textContent=fmt(S.ins);
  $("stManual").textContent=fmt(S.manual);
  $("stHatch").textContent=fmt(S.hatches);
  $("stAuto").textContent=fmt(r)+"/s";
  var mv=clickValue();
  $("stAutoPct").textContent=(r+mv>0?Math.round(r/(r+mv)*100):0)+" %";
  $("stMult").textContent=fmtx(globalMult());
  $("stPrestiges").textContent=S.pres;
  $("sessionT").textContent=clock((Date.now()-S.t0)/1000);

  var need=hatchNeed();
  crackEl.firstChild.textContent="Grietas "+S.cracks+"/"+need;
  crackEl.querySelector(".cb i").style.width=Math.min(100,(S.cracks/need)*100)+"%";

  if(Date.now()<comboUntil && comboN>1){
    comboEl.classList.add("on");
    comboEl.firstChild.textContent="COMBO "+fmtx(comboMult());
    comboEl.querySelector(".cbar i").style.width=Math.max(0,Math.min(100,(comboUntil-Date.now())/14))+"%";
  } else { comboEl.classList.remove("on"); if(Date.now()>comboUntil) comboN=0; }

  var gain=insightGain(), pct=Math.min(1,S.total/1e6);
  if(S.total>=1e6){
    var e=has(S.metas,"m6")?0.55:0.50;
    var cur=Math.pow(S.ins+gain,1/e)*1e6, nxt=Math.pow(S.ins+gain+1,1/e)*1e6;
    pct=Math.max(0,Math.min(1,(S.total-cur)/(nxt-cur)));
    $("pnext").textContent = gain>0 ? "¡Lista para poner!" : "Siguiente Gen en "+fmt(nxt);
  } else $("pnext").textContent="Necesitas "+fmt(1e6)+" totales";
  $("pbar").style.width=(pct*100)+"%";
  $("pgain").textContent="+"+fmt(gain)+" Genes";
  var pb=$("doPrestige");
  pb.disabled=gain<=0;
  pb.textContent = gain>0 ? "Poner de nuevo · +"+fmt(gain)+" Genes" : "Poner de nuevo";

  var btns=gensEl.querySelectorAll(".gen");
  for(var i=0;i<btns.length && i<GENS.length;i++){
    var g=GENS[i], n=S.g[g.id]||0;
    var vis = n>0 || i===0 || (S.g[GENS[Math.max(0,i-1)].id]||0)>0;
    if(!vis) continue;
    var k = qty==="max" ? Math.max(1,maxBuy(g,n,S.c)) : qty;
    var c = costOf(g,n,k), can=S.c>=c;
    btns[i].classList.toggle("can",can);
    btns[i].disabled=!can;
    var cel=btns[i].querySelector(".cost");
    if(cel) cel.textContent=fmt(c)+(k>1?" ·×"+k:"");
  }
  var sb=skinsEl.querySelectorAll(".skin");
  for(var j=0;j<sb.length;j++){
    var sid=sb[j].getAttribute("data-s"), sk=skinById(sid);
    var own=has(S.skins,sk.id), eq=S.equip===sk.id, can=!own && S.c>=sk.c;
    sb[j].disabled=!(own||can);
    sb[j].className="skin "+(eq?"equipped":(own?"owned":(can?"affordable":"locked")));
  }
  var mb=metasEl.querySelectorAll(".meta");
  for(var w=0;w<mb.length;w++){
    var mid=mb[w].getAttribute("data-m"), m=null;
    for(var z=0;z<METAS.length;z++) if(METAS[z].id===mid) m=METAS[z];
    if(!m) continue;
    mb[w].disabled = has(S.metas,m.id) || S.ins<m.c;
  }
  var fr=$("frenzy");
  if(S.frenzy>Date.now()){ fr.style.display="block"; fr.textContent="¡FRENESÍ ×7! "+Math.ceil((S.frenzy-Date.now())/1000)+" s"; }
  else fr.style.display="none";
}
function renderAll(){ renderGens(); renderSkins(); renderMetas(); renderNotebook(); renderCrew(); paintEgg(); paint(); }

/* ───────── modal ───────── */
function modal(title,body,gain){
  $("mTitle").textContent=title; $("mBody").textContent=body; $("mGain").textContent=gain;
  $("scrim").classList.add("on");
}
$("mClose").onclick=function(){ $("scrim").classList.remove("on"); };
$("scrim").addEventListener("click",function(e){ if(e.target===this) this.classList.remove("on"); });

/* ───────── huevo dorado ───────── */
goldEl.innerHTML=goldenSVG();
function scheduleGold(){ goldAt=Date.now()+60000+Math.random()*120000; }
function showGold(){
  var r=stage.getBoundingClientRect();
  goldEl.style.display="block";
  goldEl.style.left=Math.round(16+Math.random()*Math.max(10,r.width-86))+"px";
  goldEl.style.top=Math.round(14+Math.random()*Math.max(10,r.height-100))+"px";
  setTimeout(function(){ if(goldEl.style.display==="block"){ goldEl.style.display="none"; scheduleGold(); } },13000);
}
goldEl.onclick=function(){
  var r=stage.getBoundingClientRect(), g=goldEl.getBoundingClientRect();
  burst(g.left-r.left+27, g.top-r.top+33, 44, ["#FFD449","#FFF3B0","#D08A00"], true);
  goldEl.style.display="none";
  S.frenzy=Date.now()+30000;
  sfx.gold(); scheduleGold(); unlock("l10"); paint();
};

/* ───────── bucle ───────── */
function tick(){
  var now=Date.now(), dt=Math.min(1,(now-lastTick)/1000);
  lastTick=now;
  var gain=rate()*dt;
  if(gain>0){ S.c+=gain; S.total+=gain; S.run+=gain; }
  checkLessons(); paint();
  if(has(S.metas,"m2") && goldEl.style.display!=="block" && now>goldAt) showGold();
  if(now-lastSave>5000){ lastSave=now; save(); }
}

/* ───────── eventos ───────── */
clicker.addEventListener("click",doClick);
document.addEventListener("keydown",function(e){
  if(e.code==="Space" && e.target===document.body){ e.preventDefault(); doClick(null); }
});
gensEl.addEventListener("click",function(e){
  var b=e.target.closest("[data-g]"); if(!b) return;
  for(var i=0;i<GENS.length;i++) if(GENS[i].id===b.getAttribute("data-g")) buyGen(GENS[i]);
});
skinsEl.addEventListener("click",function(e){
  var b=e.target.closest("[data-s]"); if(!b) return;
  clickSkin(skinById(b.getAttribute("data-s")));
});
metasEl.addEventListener("click",function(e){
  var b=e.target.closest("[data-m]"); if(!b) return;
  for(var i=0;i<METAS.length;i++) if(METAS[i].id===b.getAttribute("data-m")) buyMeta(METAS[i]);
});
$("doPrestige").onclick=prestige;
$("btnSound").onclick=function(){
  S.mute=!S.mute; this.textContent=S.mute?"🔇":"🔊";
  if(!S.mute){ ac(); sfx.crack(); }
  save();
};
var qbtns=document.querySelectorAll(".qty");
for(var qi=0;qi<qbtns.length;qi++){
  qbtns[qi].addEventListener("click",function(){
    var v=this.getAttribute("data-q");
    qty = v==="max" ? "max" : parseInt(v,10);
    for(var i=0;i<qbtns.length;i++) qbtns[i].setAttribute("aria-pressed", qbtns[i]===this?"true":"false");
    renderGens(); paint();
  });
}
var tabs=document.querySelectorAll(".tabs button"), cols=document.querySelectorAll(".col");
for(var ti=0;ti<tabs.length;ti++){
  tabs[ti].addEventListener("click",function(){
    var idx=this.getAttribute("data-tab");
    for(var i=0;i<tabs.length;i++) tabs[i].setAttribute("aria-selected", tabs[i]===this?"true":"false");
    for(var j=0;j<cols.length;j++) cols[j].classList.toggle("active", cols[j].getAttribute("data-col")===idx);
    if(idx==="0") setTimeout(sizeCanvas,30);
  });
}
$("btnSave").onclick=function(){ save(); var b=this; b.textContent="¡Guardado!"; setTimeout(function(){ b.textContent="Guardar ahora"; },1400); };
$("btnExport").onclick=function(){ window.prompt("Copia este código para llevarte la partida:", btoa(unescape(encodeURIComponent(JSON.stringify(S))))); };
$("btnImport").onclick=function(){
  var code=window.prompt("Pega el código de partida:");
  if(!code) return;
  try{
    var o=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    S=fresh(); for(var k in o) if(o.hasOwnProperty(k)) S[k]=o[k];
    save(); renderAll();
  }catch(e){ window.alert("Ese código no es válido. Revisa que esté copiado entero."); }
};
$("btnWipe").onclick=function(){
  if(!window.confirm("Se borra la partida entera, incluidos los Genes y las skins. ¿Seguro?")) return;
  S=fresh(); shownLesson={}; comboN=0; save(); renderAll();
};
window.addEventListener("resize",sizeCanvas);
window.addEventListener("beforeunload",save);
document.addEventListener("visibilitychange",function(){ if(document.hidden) save(); });

/* ───────── arranque ───────── */
var had=load();
lastTick=Date.now(); lastSave=Date.now();
$("btnSound").textContent=S.mute?"🔇":"🔊";
if(had && has(S.metas,"m1")){
  var away=Math.min((Date.now()-S.last)/1000, 8*3600);
  if(away>60){
    var off=rate()*away*0.5;
    if(off>0){
      S.c+=off; S.total+=off;
      setTimeout(function(){
        modal("Mientras no estabas",
          "El corral puso al 50 % durante "+Math.floor(away/3600)+" h "+Math.floor((away%3600)/60)+" min. El techo son 8 horas: no es tacañería, es lo que te da una razón para volver mañana.",
          "+"+fmt(off)+" yemas");
      },400);
    }
  }
}
if(has(S.metas,"m2")) scheduleGold();
S.t0=Date.now();
for(var li=0;li<S.lessons.length;li++) shownLesson[S.lessons[li]]=false;
sizeCanvas();
renderAll();
requestAnimationFrame(drawFX);
setInterval(tick,50);
})();
