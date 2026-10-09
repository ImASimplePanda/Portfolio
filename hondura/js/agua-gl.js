/* Hondura — luz bajo el agua en WebGL a pelo: rayos, cáusticas, plancton y burbujas.
   Se carga en diferido. Pinta con transparencia encima de las capas de color (CSS). */
(function () {
  "use strict";

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes;uniform float uTime;uniform float uDepth;uniform float uScroll;uniform float uPx;uniform float uLite;",
    "float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float nz(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);",
    " return mix(mix(h21(i),h21(i+vec2(1.,0.)),u.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),u.x),u.y);}",
    "void main(){",
    " vec2 fr=gl_FragCoord.xy; vec2 uv=fr/uRes; float asp=uRes.x/uRes.y; float t=uTime; float d=uDepth;",
    " float top=uv.y;",
    // rayos de sol inclinados, que se apagan con la profundidad
    " float x=uv.x*asp+(1.-uv.y)*.38;",
    " float r=smoothstep(.55,1.,sin(x*6.5+t*.22+sin(x*2.3-t*.11)*1.6)*.5+.5);",
    " r+=.6*smoothstep(.62,1.,sin(x*12.7-t*.31+1.7)*.5+.5);",
    " r*=nz(vec2(x*3.,t*.12))*.8+.2; r*=pow(top,1.5);",
    " float rays=r*(1.-smoothstep(5.,27.,d))*.2;",
    // cáusticas cerca de la superficie
    " float cau=0.;",
    " if(uLite<.5){vec2 cp=vec2(uv.x*asp,uv.y)*vec2(5.,7.);",
    "  float c1=nz(cp+vec2(t*.18,t*.13)); float c2=nz(cp*1.7-vec2(t*.15,-t*.09));",
    "  cau=pow(max(1.-abs(c1-c2)*2.4,0.),7.)*smoothstep(.5,1.,top)*(1.-smoothstep(0.,13.,d))*.32;}",
    // plancton en dos capas, sube al bajar con el scroll
    " float pl=0.;",
    " for(int i=0;i<2;i++){float fi=float(i); if(uLite>.5&&i==1)break;",
    "  float cs=mix(48.,84.,fi)*uPx;",
    "  vec2 g=(fr-vec2(t*(4.+fi*3.)*uPx,uScroll*(.16+fi*.14)*uPx+t*(3.+fi*2.)*uPx))/cs;",
    "  vec2 id=floor(g); vec2 f=fract(g)-.5; float hs=h21(id+fi*17.);",
    "  vec2 o=vec2(h21(id+3.1),h21(id+7.7))-.5; o+=.12*vec2(sin(t*.6+hs*6.28),cos(t*.5+hs*6.28));",
    "  float sz=mix(.035,.08,h21(id+1.3))*mix(1.,.8,fi);",
    "  pl+=smoothstep(sz,0.,length(f-o*.7))*step(.5,hs)*(.55+.45*sin(t*1.2+hs*30.));}",
    " float plA=mix(.2,.55,smoothstep(6.,34.,d));",
    // columnas de burbujas
    " float bub=0.; float cw=120.*uPx; float col=floor(fr.x/cw); float hc=h21(vec2(col,4.2));",
    " if(hc>.74){float sp=55.+hc*70.; float y=fr.y-(t*sp+uScroll*.45)*uPx; float ce=74.*uPx;",
    "  float row=floor(y/ce); float hr=h21(vec2(col,row));",
    "  vec2 c=vec2((col+.5)*cw+sin(y*.02/uPx+hr*6.)*9.*uPx,(row+.5)*ce);",
    "  float rad=(2.5+hr*5.)*uPx; float dd=length(vec2(fr.x,y)-c);",
    "  float ring=smoothstep(rad,rad-1.3*uPx,dd)-.65*smoothstep(rad-1.3*uPx,rad-2.8*uPx,dd);",
    "  bub=max(ring,0.)*step(.35,hr);}",
    " float bubA=.42*(1.-smoothstep(18.,38.,d))+.1;",
    " vec3 lc=mix(vec3(.86,1.,.95),vec3(.55,.75,1.),smoothstep(0.,25.,d));",
    " vec3 pc=mix(vec3(.82,.96,.9),vec3(.62,.85,1.),smoothstep(10.,35.,d));",
    " float a1=rays+cau; float a2=pl*plA*.55; float a3=bub*bubA*.5;",
    " float a=clamp(a1+a2+a3,0.,.85);",
    " vec3 c3=lc*a1+pc*a2+vec3(.9,1.,1.)*a3;",
    " gl_FragColor=vec4(min(c3,vec3(a)),a);",
    "}"
  ].join("\n");

  function shader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  window.HonduraAgua = function (canvas, opts) {
    opts = opts || {};
    var gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ["uRes", "uTime", "uDepth", "uScroll", "uPx", "uLite"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    var scale = opts.scale || 0.5;
    var frameMs = 1000 / (opts.fps || 60);
    var lite = opts.lite ? 1 : 0;
    var still = !!opts.still;          // movimiento reducido: sin tiempo, se pinta solo si cambia algo
    var depth = 0, scroll = 0, last = -1e9, sucio = true, t0 = performance.now();

    function resize() {
      var w = Math.max(1, Math.round(window.innerWidth * scale));
      var h = Math.max(1, Math.round(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        sucio = true;
      }
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    gl.uniform1f(U.uPx, scale);
    gl.uniform1f(U.uLite, lite);

    var perdido = false;
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); perdido = true; canvas.classList.remove("listo"); }, false);

    return {
      setDepth: function (d) { if (Math.abs(d - depth) > 0.01) { depth = d; sucio = true; } },
      setScroll: function (y) { if (y !== scroll) { scroll = y; if (!still) sucio = true; } },
      render: function (now) {
        if (perdido) return;
        if (still) { if (!sucio) return; }
        else if (now - last < frameMs) return;
        last = now; sucio = false;
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform1f(U.uTime, still ? 12.0 : ((now - t0) / 1000) % 600);
        gl.uniform1f(U.uDepth, depth);
        gl.uniform1f(U.uScroll, still ? 0 : scroll % 50000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!canvas.classList.contains("listo")) canvas.classList.add("listo");
      }
    };
  };
})();
