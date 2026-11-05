// A quiet WebGL backdrop behind the hero: drifting noise with faint ledger
// lines, tinted from the section's own colors. Raw WebGL, no library.
// It only runs when motion is allowed, the data saver is off, the hero is
// on screen and the tab is visible, and it renders at half resolution at
// 30 frames per second. Without it the hero keeps its plain background.

const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-backdrop]");
const hero = canvas?.parentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

if (canvas && hero && !reduceMotion.matches && !saveData) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (gl) start(gl);
}

function start(gl: WebGLRenderingContext) {
  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision mediump float;
uniform vec2 r;uniform float t;uniform vec3 bg;uniform vec3 ac;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){
vec2 uv=gl_FragCoord.xy/r;vec2 p=vec2(uv.x*r.x/r.y,uv.y);
float a=n(p*1.4+vec2(t*.025,t*.015));
float b=n(p*3.1-vec2(t*.04,t*.01));
float g=smoothstep(.52,.95,a*.65+b*.35);
float l=smoothstep(.97,1.,abs(fract(uv.y*26.)-.5)*2.);
vec3 c=bg+ac*g*k+vec3(.5)*l*k*.35;
gl_FragColor=vec4(c,1.);}`;

  const program = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vert],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return;
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const p = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(p);
  gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

  const u = {
    r: gl.getUniformLocation(program, "r"),
    t: gl.getUniformLocation(program, "t"),
    bg: gl.getUniformLocation(program, "bg"),
    ac: gl.getUniformLocation(program, "ac"),
    k: gl.getUniformLocation(program, "k"),
  };

  const rgb = (hex: string) => {
    const v = hex.trim().replace("#", "");
    const n = parseInt(v.length === 3 ? v.replace(/./g, "$&$&") : v, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
  };

  // Tint from the hero's own tokens, re-read when the theme changes.
  const tint = () => {
    const cs = getComputedStyle(hero!);
    gl.uniform3fv(u.bg, rgb(cs.getPropertyValue("--bg")));
    gl.uniform3fv(u.ac, rgb(cs.getPropertyValue("--accent")));
    gl.uniform1f(u.k, document.documentElement.dataset.theme === "dark" ? 0.11 : 0.07);
  };
  tint();
  new MutationObserver(tint).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const resize = () => {
    const scale = 0.5 * Math.min(devicePixelRatio, 1.5);
    canvas!.width = Math.max(1, Math.round(canvas!.clientWidth * scale));
    canvas!.height = Math.max(1, Math.round(canvas!.clientHeight * scale));
    gl.viewport(0, 0, canvas!.width, canvas!.height);
    gl.uniform2f(u.r, canvas!.width, canvas!.height);
  };
  resize();
  addEventListener("resize", resize);

  let visible = false;
  let frame = 0;
  let last = 0;
  const started = performance.now();

  const draw = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) return;
    if (now - last >= 33) {
      last = now;
      gl.uniform1f(u.t, (now - started) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    frame = requestAnimationFrame(draw);
  };

  const wake = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    wake();
  }).observe(hero!);
  document.addEventListener("visibilitychange", wake);
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      visible = false;
      canvas!.remove();
    }
  });

  canvas!.classList.add("is-live");
}

export {};
