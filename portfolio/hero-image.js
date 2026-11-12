// ============================================================
//  Gambar landing page yang "hidup" (WebGL):
//  - kepala & mata ikut condong ke arah kursor (warp halus)
//  - rambut/kuncir bergoyang tertiup angin
//  - latar bergeser sedikit (parallax)
//  Koordinat titik (kepala, mata, rambut) dalam PIKSEL gambar asli.
//  Buka website dengan ?debug di akhir URL untuk melihat lingkaran titiknya.
// ============================================================
window.createImageHero = function (container, opt, onFail) {
  const toXY = (f) => (f ? [Number(f.x ?? f[0] ?? 0.5), Number(f.y ?? f[1] ?? 0.5)] : [0.5, 0.5]);
  const debug = /[?&]debug/.test(location.search);
  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  container.appendChild(canvas);

  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
  if (!gl) return fallback();

  const VS = `
    attribute vec2 aPos; varying vec2 vUv;
    void main(){ vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5); gl_Position = vec4(aPos, 0., 1.); }`;
  const FS = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform vec2 uRes, uImg, uFocus, uMouse;
    uniform float uTime, uZoom, uDebug, uPar;
    uniform vec4 uHead, uEyeL, uEyeR, uHair;

    float fall(vec2 p, vec4 c){ float d = length(p - c.xy) / c.z; return pow(clamp(1. - d*d, 0., 1.), 2.); }
    float ring(vec2 p, vec4 c){ return smoothstep(2.5, 0., abs(length(p - c.xy) - c.z)); }

    void main(){
      vec2 frag = vUv * uRes;
      float sc = max(uRes.x / uImg.x, uRes.y / uImg.y) * uZoom;
      vec2 disp = uImg * sc;
      vec2 off = (uRes - disp) * uFocus;
      vec2 p = (frag - off) / sc;           // koordinat piksel gambar
      vec2 p0 = p;

      p += uMouse * uPar;                   // parallax: latar bergerak berlawanan

      // kepala condong ke kursor (ditambah sedikit "menoleh": tengah wajah lebih maju dari tepinya)
      float wh = fall(p, uHead);
      float turn = 1. - abs(p.x - uHead.x) / uHead.z;
      p -= uMouse * uHead.w * wh * vec2(.75 + .5 * turn, .55);

      // mata melirik
      p -= uMouse * uEyeL.w * fall(p, uEyeL);
      p -= uMouse * uEyeR.w * fall(p, uEyeR);

      // rambut tertiup angin
      float wr = fall(p, uHair);
      p.x += sin(p.y * .022 + uTime * 1.5) * uHair.w * wr;
      p.y += cos(p.x * .018 + uTime * 1.1) * uHair.w * .35 * wr;

      vec4 col = texture2D(uTex, clamp(p / uImg, vec2(.001), vec2(.999)));

      if (uDebug > .5) {
        float r = max(max(ring(p0, uHead), ring(p0, uHair)), max(ring(p0, uEyeL), ring(p0, uEyeR)));
        col.rgb = mix(col.rgb, vec3(1., 0., .3), r);
      }
      gl_FragColor = vec4(col.rgb, 1.);
    }`;

  function sh(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn(e); return fallback(); }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ["uRes", "uImg", "uFocus", "uMouse", "uTime", "uZoom", "uDebug", "uPar", "uHead", "uEyeL", "uEyeR", "uHair"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  let ready = false, imgW = 1, imgH = 1;
  const img = new Image();
  img.onload = () => {
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    } catch (e) { console.warn("WebGL tidak bisa memuat gambar (buka lewat server/hosting, bukan file://).", e); return fallback(); }
    imgW = img.naturalWidth; imgH = img.naturalHeight;
    ready = true;
    canvas.classList.add("ready");
  };
  img.onerror = () => fallback();
  img.src = opt.gambar;

  const v4 = (o, r, s) => [o.x, o.y, o.radius ?? r, o.kekuatan ?? s];
  const head = opt.kepala ? v4(opt.kepala, 170, 16) : [0, 0, 1, 0];
  const eyes = (opt.mata || []).map((m) => v4(m, opt.mataRadius ?? 18, opt.mataKekuatan ?? 3));
  const hair = opt.rambut ? v4(opt.rambut, 250, 4) : [0, 0, 1, 0];
  while (eyes.length < 2) eyes.push([0, 0, 1, 0]);

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  return {
    draw(mx, my, t) {
      if (!ready) return;
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      const mobile = canvas.clientWidth < 860;
      const focus = toXY(mobile ? opt.fokusMobile : opt.fokusDesktop);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform2f(U.uImg, imgW, imgH);
      gl.uniform2f(U.uFocus, focus[0], focus[1]);
      gl.uniform2f(U.uMouse, mx, my);
      gl.uniform1f(U.uTime, t / 1000);
      gl.uniform1f(U.uZoom, opt.zoom ?? 1.05);
      gl.uniform1f(U.uPar, opt.parallax ?? 7);
      gl.uniform1f(U.uDebug, debug ? 1 : 0);
      gl.uniform4fv(U.uHead, head);
      gl.uniform4fv(U.uEyeL, eyes[0]);
      gl.uniform4fv(U.uEyeR, eyes[1]);
      gl.uniform4fv(U.uHair, hair);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };

  // Kalau WebGL tidak tersedia: gambar biasa dengan efek miring 3D
  function fallback() {
    canvas.remove();
    const el = document.createElement("img");
    el.className = "hero-canvas hero-fallback ready";
    el.src = opt.gambar;
    el.alt = "";
    container.appendChild(el);
    if (onFail) onFail();
    const api = {
      draw(mx, my) {
        const mobile = el.clientWidth < 860;
        const f = toXY(mobile ? opt.fokusMobile : opt.fokusDesktop);
        el.style.objectPosition = `${f[0] * 100}% ${f[1] * 100}%`;
        el.style.transform = `scale(1.06) translate(${(-mx * 8).toFixed(1)}px, ${(-my * 5).toFixed(1)}px)`;
      },
    };
    window.__heroFallback = api;
    return api;
  }
};
