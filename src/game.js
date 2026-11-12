// המשחק עצמו: מחזיקים את האצבע → החבל גדל, משחררים → הוא נופל ונהיה גשר.
import { drawHero, drawRope, drawWorld, drawPillar, drawGem, spawnTrail, drawParticles } from './draw.js';
import { sfx } from './audio.js';

const LW = 300; // רוחב "לוגי" של העולם – הכול מוגדל לפי רוחב המסך
const GROW = 230; // מהירות גדילת החבל
const WALK = 170;
const PERFECT = 4; // חצי רוחב אזור "מושלם"

export class Game {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.menuMode = true; // ברקע של התפריטים – הדמות עומדת ונושמת
    this.particles = [];
    this.popups = [];
    this.t = 0;
    this.onEnd = null;
    this.onScore = null;
    this.equip = { char: 'bean', rope: 'wood', trail: 'none', world: 'meadow' };
    this.resize();
    addEventListener('resize', () => this.resize());
    const down = (e) => {
      if (!this.running) return;
      e.preventDefault();
      this.press();
    };
    const up = (e) => {
      if (!this.running) return;
      e.preventDefault();
      this.release();
    };
    canvas.addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.reset();
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.draw(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = this.c.clientWidth, h = this.c.clientHeight;
    this.c.width = Math.round(w * dpr);
    this.c.height = Math.round(h * dpr);
    this.s = (w * dpr) / LW;
    this.LH = (h * dpr) / this.s;
    this.top = this.LH * 0.64;
  }

  reset() {
    this.pillars = [{ x: 0, w: 70, gem: false }];
    this.cur = 0;
    this.addPillar();
    this.cam = this.camTarget = this.pillars[0].x + this.pillars[0].w - LW * 0.3;
    const p = this.pillars[0];
    this.hero = { x: p.x + p.w - 10, y: this.top, vy: 0, rot: 0 };
    this.stick = { x: p.x + p.w, len: 0, ang: 0 };
    this.state = 'idle';
    this.score = 0;
    this.perfects = 0;
    this.perfectRun = 0;
    this.bestPerfectRun = 0;
    this.gems = 0;
    this.jumps = 0;
    this.particles.length = 0;
    this.popups.length = 0;
    this.endTimer = 0;
  }

  start(equip, luck) {
    this.equip = { ...equip };
    this.luck = luck;
    this.reset();
    this.running = true;
    this.menuMode = false;
  }

  showMenu(equip) {
    this.equip = { ...equip };
    this.running = false;
    this.menuMode = true;
    this.reset();
  }

  addPillar() {
    const last = this.pillars[this.pillars.length - 1];
    const sc = this.score || 0;
    const minW = Math.max(12, 36 - sc * 0.3);
    const maxW = Math.max(24, 72 - sc * 0.6);
    const w = minW + Math.random() * (maxW - minW);
    // העמוד הבא חייב להיכנס במסך (המצלמה שמה את העמוד הנוכחי ב-30% מהרוחב)
    const maxGap = LW * 0.7 - w - 12;
    const gap = Math.min(maxGap, 28 + Math.random() * Math.min(150, 80 + sc * 2));
    const gem = gap > 70 && Math.random() < (this.luck ? 0.22 : 0.09);
    this.pillars.push({ x: last.x + last.w + gap, w, gem });
  }

  press() {
    if (this.state !== 'idle') return;
    sfx.unlock();
    this.state = 'growing';
    sfx.growStart();
  }

  release() {
    if (this.state !== 'growing') return;
    sfx.growStop();
    this.state = 'rotating';
  }

  popup(text, x, y, color = '#fff', size = 22) {
    this.popups.push({ text, x, y, color, size, life: 0 });
  }

  burst(x, y, colors, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 110;
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 260, life: 0, max: 0.7 + Math.random() * 0.4, size: 2 + Math.random() * 2.5, color: colors[i % colors.length] });
    }
  }

  update(dt) {
    this.t += dt;
    const st = this.stick;
    const next = this.pillars[this.cur + 1];
    switch (this.state) {
      case 'growing':
        st.len = Math.min(st.len + GROW * dt, LW * 1.2);
        break;
      case 'rotating': {
        st.ang += dt * 7.5;
        if (st.ang >= Math.PI / 2) {
          st.ang = Math.PI / 2;
          sfx.thud();
          const end = st.x + st.len;
          this.success = end >= next.x && end <= next.x + next.w;
          const center = next.x + next.w / 2;
          this.isPerfect = this.success && Math.abs(end - center) <= PERFECT;
          this.walkTo = this.success ? next.x + next.w - 10 : end + 8;
          if (this.isPerfect) {
            this.perfectRun++;
            this.perfects++;
            this.bestPerfectRun = Math.max(this.bestPerfectRun, this.perfectRun);
            const bonus = Math.min(this.perfectRun, 5);
            this.score += bonus;
            sfx.perfect();
            this.popup(this.perfectRun > 1 ? `מושלם! x${this.perfectRun}` : 'מושלם!', center, this.top - 50, '#ffd32a', 26);
            this.popup(`+${bonus}`, center, this.top - 22, '#fff', 18);
            this.burst(center, this.top, ['#ffd32a', '#ff6b81', '#48dbfb', '#fff']);
            if (navigator.vibrate) navigator.vibrate(25);
          } else if (this.success) this.perfectRun = 0;
          this.state = 'walking';
        }
        break;
      }
      case 'walking': {
        const h = this.hero;
        const prevStep = Math.floor(h.x / 14);
        h.x = Math.min(this.walkTo, h.x + WALK * dt);
        if (Math.floor(h.x / 14) !== prevStep) sfx.step();
        if (Math.random() < 0.6) spawnTrail(this.particles, this.equip.trail, h.x, h.y);
        if (h.x >= this.walkTo) {
          if (this.success) {
            this.score += 1;
            this.jumps++;
            sfx.land();
            if (next.gem) {
              next.gem = false;
              this.gems++;
              sfx.gem();
              this.popup('+1 💎', next.x + next.w / 2, this.top - 75, '#7efff5', 20);
              this.burst(next.x + next.w / 2, this.top - 30, ['#48dbfb', '#7efff5', '#fff']);
            }
            this.onScore && this.onScore(this);
            this.cur++;
            this.addPillar();
            const p = this.pillars[this.cur];
            this.camTarget = p.x + p.w - LW * 0.3;
            this.state = 'scrolling';
          } else {
            this.state = 'falling';
            this.perfectRun = 0;
            sfx.fall();
            if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
          }
        }
        break;
      }
      case 'scrolling':
        if (Math.abs(this.cam - this.camTarget) < 0.5) {
          this.cam = this.camTarget;
          const p = this.pillars[this.cur];
          this.stick = { x: p.x + p.w, len: 0, ang: 0 };
          // ניקוי עמודים ישנים
          while (this.cur > 1) {
            this.pillars.shift();
            this.cur--;
          }
          this.state = 'idle';
        }
        break;
      case 'falling': {
        const h = this.hero;
        st.ang = Math.min(Math.PI, st.ang + dt * 6);
        h.vy += 900 * dt;
        h.y += h.vy * dt;
        h.rot += dt * 5;
        if (h.y > this.LH + 80) {
          this.state = 'dead';
          this.running = false;
          this.onEnd &&
            this.onEnd({ score: this.score, perfects: this.perfects, bestPerfectRun: this.bestPerfectRun, gems: this.gems, jumps: this.jumps });
        }
        break;
      }
    }
    this.cam += (this.camTarget - this.cam) * Math.min(1, dt * 9);
  }

  draw(dt) {
    const ctx = this.ctx;
    const s = this.s;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    const LH = this.LH;
    drawWorld(ctx, this.equip.world, LW, LH, this.cam, this.t);
    ctx.save();
    ctx.translate(-this.cam, 0);
    const next = this.pillars[this.cur + 1];
    for (const p of this.pillars) {
      drawPillar(ctx, this.equip.world, p.x, p.w, this.top, LH, p === next || p === this.pillars[this.cur] && this.state === 'scrolling');
      if (p.gem) drawGem(ctx, p.x + p.w / 2, this.top - 30, this.t);
    }
    const st = this.stick;
    if (st.len > 0) {
      ctx.save();
      ctx.translate(st.x, this.top);
      ctx.rotate(st.ang);
      drawRope(ctx, this.equip.rope, st.len, this.t);
      ctx.restore();
    }
    const h = this.hero;
    drawHero(ctx, this.equip.char, h.x, h.y, this.t, {
      walking: this.state === 'walking',
      squash: this.state === 'growing' ? Math.min(1, st.len / 120) : 0,
      rot: h.rot,
      sad: this.state === 'falling',
    });
    drawParticles(ctx, this.particles, dt);
    // טקסטים קופצים
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life += dt;
      if (p.life > 1.1) {
        this.popups.splice(i, 1);
        continue;
      }
      const a = Math.min(1, (1.1 - p.life) * 3);
      const sc = p.life < 0.15 ? 0.6 + p.life * 2.7 : 1;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y - p.life * 30);
      ctx.scale(sc, sc);
      ctx.font = `900 ${p.size}px Rubik, sans-serif`;
      ctx.textAlign = 'center';
      ctx.direction = /^[+\d]/.test(p.text) ? 'ltr' : 'rtl';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#2a1f3d';
      ctx.strokeText(p.text, 0, 0);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // רמז בתחילת משחק
    if (this.running && this.score === 0 && this.state === 'idle') {
      ctx.save();
      ctx.globalAlpha = 0.65 + Math.sin(this.t * 4) * 0.35;
      ctx.font = '700 15px Rubik, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2a1f3d';
      const txt = 'החזיקו את האצבע כדי למתוח את החבל';
      ctx.strokeText(txt, LW / 2, LH * 0.84);
      ctx.fillStyle = '#fff';
      ctx.fillText(txt, LW / 2, LH * 0.84);
      ctx.restore();
    }
  }
}
