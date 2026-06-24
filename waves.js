// TheraSeek — ASCII water-ripple field (vanilla canvas, pink)
(function () {
  const canvas = document.getElementById('waves');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const RAMP = ' .·:;+*oøO0%#';          // low → high amplitude
  const DAMP = 0.962;
  let CELL = 16;                          // px per character cell
  let cols, rows, cur, prev, w, h, dpr;
  const pointer = { x: -1, y: -1, down: false };

  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    CELL = w < 540 ? 20 : 16;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / CELL) + 1;
    rows = Math.ceil(h / CELL) + 1;
    cur = new Float32Array(cols * rows);
    prev = new Float32Array(cols * rows);
    ctx.font = `${CELL}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
    ctx.textBaseline = 'top';
  }

  function splash(px, py, power) {
    const cx = Math.floor(px / CELL), cy = Math.floor(py / CELL);
    if (cx < 1 || cy < 1 || cx >= cols - 1 || cy >= rows - 1) return;
    cur[cy * cols + cx] += power;
  }

  addEventListener('resize', build);
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    splash(e.clientX, e.clientY, pointer.down ? 320 : 90);
  });
  addEventListener('pointerdown', (e) => { pointer.down = true; splash(e.clientX, e.clientY, 620); });
  addEventListener('pointerup', () => { pointer.down = false; });

  function step() {
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const i = y * cols + x;
        let v = (cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols]) / 2 - prev[i];
        prev[i] = v * DAMP;
      }
    }
    const t = cur; cur = prev; prev = t;   // swap buffers
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    const len = RAMP.length;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const a = Math.abs(cur[y * cols + x]);
        const t = Math.min(a / 70, 1);
        const idx = t < 0.04 ? 0 : Math.min(len - 1, (t * (len - 1)) | 0);
        if (idx === 0 && (x + y) % 2) continue;          // sparse idle texture
        // pink → maroon by intensity
        const r = 199 + (110 - 199) * t;
        const g = 110 + (44 - 110) * t;
        const b = 127 + (62 - 127) * t;
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.18 + 0.72 * t})`;
        ctx.fillText(RAMP[idx], x * CELL, y * CELL);
      }
    }
  }

  let drop = 0;
  function frame(ts) {
    step();
    // ambient raindrops so it breathes without interaction
    if (ts - drop > 1400) { drop = ts; splash(Math.random() * w, Math.random() * h, 260); }
    render();
    if (!reduce) requestAnimationFrame(frame);
  }

  build();
  if (reduce) { splash(w / 2, h / 3, 400); step(); render(); }
  else requestAnimationFrame(frame);
})();
