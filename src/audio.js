// צלילים קטנים שמסונתזים בקוד (בלי קבצי שמע)
let ac = null;
let muted = false;
export const setMuted = (m) => (muted = m);

function ctx() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function tone(freq, dur, { type = 'sine', vol = 0.15, slide = 0, delay = 0 } = {}) {
  if (muted) return;
  const a = ctx();
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let growOsc = null;
export const sfx = {
  unlock: () => ctx(),
  growStart() {
    if (muted) return;
    const a = ctx();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, a.currentTime);
    o.frequency.linearRampToValueAtTime(880, a.currentTime + 2.5);
    g.gain.value = 0.05;
    o.connect(g).connect(a.destination);
    o.start();
    growOsc = { o, g };
  },
  growStop() {
    if (!growOsc) return;
    const a = ctx();
    growOsc.g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.05);
    growOsc.o.stop(a.currentTime + 0.06);
    growOsc = null;
  },
  thud: () => tone(140, 0.12, { type: 'square', vol: 0.08, slide: -60 }),
  step: () => tone(500, 0.05, { type: 'triangle', vol: 0.04 }),
  land: () => tone(660, 0.1, { type: 'triangle', vol: 0.1, slide: 200 }),
  perfect() {
    [784, 988, 1319].forEach((f, i) => tone(f, 0.16, { type: 'triangle', vol: 0.12, delay: i * 0.07 }));
  },
  gem() {
    [1319, 1760].forEach((f, i) => tone(f, 0.12, { type: 'sine', vol: 0.14, delay: i * 0.06 }));
  },
  fall: () => tone(500, 0.6, { type: 'sawtooth', vol: 0.06, slide: -420 }),
  coin: () => tone(988, 0.08, { type: 'square', vol: 0.05 }),
  buy() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, { type: 'triangle', vol: 0.12, delay: i * 0.06 }));
  },
  click: () => tone(700, 0.04, { type: 'triangle', vol: 0.06 }),
};
