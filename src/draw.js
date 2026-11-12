// כל הציורים הקרטוניים: דמויות, חבלים, שבילים ועולמות. הכול מצויר בקוד – בלי תמונות.
export const OL = '#2a1f3d'; // צבע קו המתאר

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function fillStroke(ctx, fill, lw = 2.4) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = OL;
  ctx.stroke();
}
function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

const SKIN = {
  bean: '#ff9f43',
  frog: '#6ab04c',
  bunny: '#f5f0ff',
  penguin: '#34495e',
  bear: '#b9773f',
  kitty: '#f8c291',
  chef: '#ffd6a5',
  ninja: '#3d3d5c',
  pirate: '#e17055',
  fairy: '#fd79a8',
  robot: '#b2bec3',
  astronaut: '#f5f6fa',
  dragon: '#00b894',
  king: '#6c5ce7',
  ghost: '#ffffff',
  phoenix: '#ff6b5b',
  unicorn: '#fffaf5',
};

// ציור דמות: (x, y) = נקודת הרגליים. הדמות מסתכלת ימינה.
export function drawHero(ctx, id, x, y, t, o = {}) {
  const walking = o.walking;
  const squash = o.squash || 0;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (id === 'ghost') ctx.translate(0, -3 + Math.sin(t * 4) * 2);
  const bob = walking ? Math.abs(Math.sin(t * 14)) * 2 : Math.sin(t * 3) * 0.6;
  ctx.scale(1 + squash * 0.15, 1 - squash * 0.15);
  const W = 26, H = 30;
  const bx = -W / 2, by = -H - 4 - bob;
  const col = SKIN[id] || SKIN.bean;

  // מאחורי הגוף: כנפיים, גלימה, זנב
  if (id === 'fairy') {
    ctx.globalAlpha = 0.75;
    const f = Math.sin(t * 18) * 0.25;
    for (const s of [1, 0.7]) {
      ctx.save();
      ctx.translate(-8, by + 12);
      ctx.rotate(-0.6 + f * s);
      ctx.beginPath();
      ctx.ellipse(-8 * s, -4, 10 * s, 6 * s, 0, 0, Math.PI * 2);
      fillStroke(ctx, '#c7f9ff', 1.6);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  if (id === 'king') {
    ctx.beginPath();
    ctx.moveTo(-6, by + 6);
    ctx.quadraticCurveTo(-22, by + 20 + Math.sin(t * 5) * 2, -16, -4);
    ctx.lineTo(-2, -4);
    ctx.closePath();
    fillStroke(ctx, '#e63946');
  }
  if (id === 'dragon') {
    ctx.save();
    ctx.translate(-10, by + 12);
    ctx.rotate(-0.5 + Math.sin(t * 8) * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, -10);
    ctx.lineTo(-10, -2);
    ctx.lineTo(-16, 2);
    ctx.closePath();
    fillStroke(ctx, '#55efc4', 1.8);
    ctx.restore();
  }
  if (id === 'kitty') {
    ctx.beginPath();
    ctx.moveTo(-11, by + 24);
    ctx.quadraticCurveTo(-24, by + 22, -20 + Math.sin(t * 4) * 3, by + 8);
    ctx.lineWidth = 5;
    ctx.strokeStyle = OL;
    ctx.stroke();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = col;
    ctx.stroke();
  }
  if (id === 'astronaut') {
    rr(ctx, -17, by + 8, 8, 16, 3);
    fillStroke(ctx, '#dfe6e9', 1.8);
  }
  if (id === 'unicorn') {
    // רעמת קשת
    const cols = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'];
    cols.forEach((c, i) => {
      circle(ctx, -9 - i * 1.5, by + 3 + i * 5, 4.5);
      fillStroke(ctx, c, 1.4);
    });
  }
  if (id === 'phoenix') {
    ctx.save();
    ctx.shadowColor = '#ffb142';
    ctx.shadowBlur = 14;
    rr(ctx, bx, by, W, H, 12);
    ctx.fillStyle = 'rgba(255,177,66,0.4)';
    ctx.fill();
    ctx.restore();
  }

  // רגליים
  if (id !== 'ghost') {
    const step = walking ? Math.sin(t * 14) * 3 : 0;
    const footCol = id === 'robot' ? '#636e72' : id === 'ninja' ? '#24243a' : id === 'penguin' ? '#f39c12' : id === 'frog' ? '#4a8a33' : '#2a1f3d';
    for (const [fx, d] of [[-5, step], [5, -step]]) {
      ctx.beginPath();
      ctx.ellipse(fx + d, -3, 5, 3.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = footCol;
      ctx.fill();
    }
  }

  // גוף
  if (id === 'ghost') {
    ctx.beginPath();
    ctx.moveTo(bx, by + 12);
    ctx.arc(0, by + 12, W / 2, Math.PI, 0);
    ctx.lineTo(W / 2, -4);
    for (let i = 0; i < 4; i++) {
      const xx = W / 2 - (i + 0.5) * (W / 4);
      ctx.quadraticCurveTo(xx, -4 + (i % 2 ? -5 : 4) + Math.sin(t * 6 + i) * 1.5, W / 2 - (i + 1) * (W / 4), -4);
    }
    ctx.closePath();
    ctx.globalAlpha = 0.9;
    fillStroke(ctx, col);
    ctx.globalAlpha = 1;
  } else if (id === 'robot') {
    rr(ctx, bx, by + 2, W, H - 2, 5);
    fillStroke(ctx, col);
    for (const [px, py] of [[-9, by + 24], [9, by + 24]]) {
      circle(ctx, px, py, 1.6);
      ctx.fillStyle = OL;
      ctx.fill();
    }
  } else {
    rr(ctx, bx, by, W, H, 12);
    fillStroke(ctx, col);
  }

  // בטן
  if (id === 'penguin') {
    ctx.beginPath();
    ctx.ellipse(3, by + 18, 9, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
  if (id === 'bear') {
    ctx.beginPath();
    ctx.ellipse(7, by + 18, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c39e';
    ctx.fill();
  }
  if (id === 'frog') {
    ctx.beginPath();
    ctx.ellipse(3, by + 22, 7, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#badc58';
    ctx.fill();
  }
  if (id === 'dragon' || id === 'kitty') {
    ctx.beginPath();
    ctx.ellipse(3, by + 21, 7, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = id === 'dragon' ? '#ffeaa7' : '#fff3e0';
    ctx.fill();
  }
  if (id === 'phoenix') {
    ctx.beginPath();
    ctx.ellipse(3, by + 21, 7, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd166';
    ctx.fill();
  }

  // פנים
  const ey = by + 11;
  if (id === 'ninja') {
    rr(ctx, bx + 1, ey - 5, W - 2, 10, 3);
    ctx.fillStyle = '#f8c291';
    ctx.fill();
    ctx.fillStyle = '#e63946';
    ctx.fillRect(bx, ey - 8, W, 3.5);
    // קשר של סרט המצח מתנופף
    ctx.beginPath();
    ctx.moveTo(bx, ey - 7);
    ctx.quadraticCurveTo(bx - 8, ey - 10 + Math.sin(t * 9) * 3, bx - 14, ey - 4 + Math.sin(t * 9 + 1) * 3);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e63946';
    ctx.stroke();
  }
  if (id === 'robot') {
    for (const ex of [2, 9]) {
      rr(ctx, ex - 3, ey - 3, 6, 6, 1);
      fillStroke(ctx, '#00e5ff', 1.4);
    }
  } else {
    const blink = Math.sin(t * 1.3 + (o.seed || 0)) > 0.985;
    for (const [ex, er] of [[2, 4.3], [9, 3.8]]) {
      if (id === 'pirate' && ex === 9) continue;
      if (id === 'frog') continue; // לצפרדע העיניים על הבליטות למעלה
      if (blink) {
        ctx.beginPath();
        ctx.moveTo(ex - er, ey);
        ctx.lineTo(ex + er, ey);
        ctx.lineWidth = 2;
        ctx.strokeStyle = OL;
        ctx.stroke();
        continue;
      }
      ctx.beginPath();
      ctx.ellipse(ex, ey, er, er + 0.8, 0, 0, Math.PI * 2);
      fillStroke(ctx, '#fff', 1.5);
      circle(ctx, ex + 1.3, ey + 0.6, er * 0.48);
      ctx.fillStyle = id === 'phoenix' ? '#c0392b' : OL;
      ctx.fill();
      circle(ctx, ex + 2, ey - 0.6, 0.9);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
    if (id === 'pirate') {
      circle(ctx, 9, ey, 4);
      ctx.fillStyle = OL;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-11, ey - 7);
      ctx.lineTo(13, ey + 2);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    if (id !== 'ninja') {
      // לחיים ופה
      ctx.globalAlpha = 0.45;
      circle(ctx, -3, ey + 7, 2.6);
      ctx.fillStyle = '#ff6b81';
      ctx.fill();
      circle(ctx, 12, ey + 7, 2.2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      if (o.sad) ctx.arc(6, ey + 11, 3, Math.PI * 1.15, Math.PI * 1.85);
      else ctx.arc(6, ey + 6, 3.2, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = OL;
      ctx.stroke();
    }
  }
  if (id === 'kitty') {
    ctx.beginPath();
    ctx.moveTo(14, ey + 5);
    ctx.lineTo(20, ey + 3);
    ctx.moveTo(14, ey + 7);
    ctx.lineTo(20, ey + 8);
    ctx.lineWidth = 1;
    ctx.strokeStyle = OL;
    ctx.stroke();
  }

  if (id === 'penguin') {
    // מקור
    ctx.beginPath();
    ctx.moveTo(10, ey + 3);
    ctx.lineTo(18, ey + 5.5);
    ctx.lineTo(10, ey + 8);
    ctx.closePath();
    fillStroke(ctx, '#f39c12', 1.4);
  }
  if (id === 'bear') {
    circle(ctx, 8, by + 16.5, 1.8);
    ctx.fillStyle = OL;
    ctx.fill();
  }

  // על הראש
  const top = by;
  if (id === 'frog') {
    for (const ex of [-6, 6]) {
      circle(ctx, ex, top + 1, 5.5);
      fillStroke(ctx, SKIN.frog, 2);
      circle(ctx, ex + 1, top + 0.5, 2.2);
      ctx.fillStyle = OL;
      ctx.fill();
    }
  }
  if (id === 'bunny') {
    for (const [ex, r] of [[-5, -0.15], [5, 0.2]]) {
      ctx.save();
      ctx.translate(ex, top + 2);
      ctx.rotate(r + Math.sin(t * 3 + ex) * 0.05);
      ctx.beginPath();
      ctx.ellipse(0, -9, 4.2, 11, 0, 0, Math.PI * 2);
      fillStroke(ctx, SKIN.bunny, 2);
      ctx.beginPath();
      ctx.ellipse(0, -9, 2, 7.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb8d1';
      ctx.fill();
      ctx.restore();
    }
  }
  if (id === 'bear') {
    for (const ex of [-9, 8]) {
      circle(ctx, ex, top + 3, 5);
      fillStroke(ctx, SKIN.bear, 2);
      circle(ctx, ex, top + 3, 2.4);
      ctx.fillStyle = '#e8c39e';
      ctx.fill();
    }
  }
  if (id === 'kitty') {
    for (const ex of [-7, 6]) {
      ctx.beginPath();
      ctx.moveTo(ex - 5, top + 4);
      ctx.lineTo(ex, top - 7);
      ctx.lineTo(ex + 5, top + 3);
      fillStroke(ctx, col, 2);
    }
  }
  if (id === 'chef') {
    rr(ctx, -8, top - 6, 16, 9, 2);
    fillStroke(ctx, '#fff', 2);
    for (const cx of [-6, 0, 6]) {
      circle(ctx, cx, top - 9, 5.5);
      fillStroke(ctx, '#fff', 2);
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(-10, top - 9, 20, 9);
  }
  if (id === 'pirate') {
    ctx.beginPath();
    ctx.moveTo(-16, top + 4);
    ctx.quadraticCurveTo(0, top - 18, 16, top + 4);
    ctx.quadraticCurveTo(0, top - 2, -16, top + 4);
    fillStroke(ctx, '#2d3436', 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☠', 0, top - 1);
  }
  if (id === 'fairy') {
    ctx.beginPath();
    ctx.moveTo(-6, top + 1);
    ctx.lineTo(-4, top - 5);
    ctx.lineTo(0, top - 1);
    ctx.lineTo(4, top - 7);
    ctx.lineTo(6, top + 1);
    fillStroke(ctx, '#ffeaa7', 1.6);
  }
  if (id === 'robot') {
    ctx.beginPath();
    ctx.moveTo(0, top + 2);
    ctx.lineTo(0, top - 7);
    ctx.lineWidth = 2;
    ctx.strokeStyle = OL;
    ctx.stroke();
    circle(ctx, 0, top - 9, 3);
    fillStroke(ctx, Math.sin(t * 6) > 0 ? '#ff4757' : '#ff9f9f', 1.6);
  }
  if (id === 'astronaut') {
    circle(ctx, 3, by + 12, 13);
    ctx.fillStyle = 'rgba(160,220,255,0.35)';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = OL;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(3, by + 12, 9, -2.4, -1.6);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (id === 'dragon') {
    for (const hx of [-6, 6]) {
      ctx.beginPath();
      ctx.moveTo(hx - 3, top + 3);
      ctx.quadraticCurveTo(hx - 1, top - 8, hx + 4, top - 8);
      ctx.quadraticCurveTo(hx + 1, top - 2, hx + 3, top + 3);
      fillStroke(ctx, '#ffeaa7', 1.6);
    }
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-13, by + 8 + i * 7);
      ctx.lineTo(-18, by + 11 + i * 7);
      ctx.lineTo(-13, by + 14 + i * 7);
      fillStroke(ctx, '#fdcb6e', 1.4);
    }
  }
  if (id === 'king') {
    ctx.beginPath();
    ctx.moveTo(-9, top + 2);
    ctx.lineTo(-9, top - 8);
    ctx.lineTo(-4.5, top - 3);
    ctx.lineTo(0, top - 10);
    ctx.lineTo(4.5, top - 3);
    ctx.lineTo(9, top - 8);
    ctx.lineTo(9, top + 2);
    ctx.closePath();
    fillStroke(ctx, '#ffd32a', 2);
    circle(ctx, 0, top - 2, 1.8);
    ctx.fillStyle = '#e63946';
    ctx.fill();
  }
  if (id === 'unicorn') {
    ctx.beginPath();
    ctx.moveTo(1, top + 2);
    ctx.lineTo(6, top - 13);
    ctx.lineTo(9, top + 2);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, top - 13, 0, top + 2);
    g.addColorStop(0, '#ffeaa7');
    g.addColorStop(1, '#fd79a8');
    fillStroke(ctx, g, 1.8);
  }
  if (id === 'phoenix') {
    for (let i = 0; i < 3; i++) {
      const fl = Math.sin(t * 10 + i * 2) * 2;
      ctx.beginPath();
      ctx.moveTo(-6 + i * 5, top + 3);
      ctx.quadraticCurveTo(-8 + i * 5, top - 8 - fl, -2 + i * 5 + fl * 0.5, top - 12 - fl);
      ctx.quadraticCurveTo(0 + i * 5, top - 4, 0 + i * 5, top + 3);
      fillStroke(ctx, i === 1 ? '#ffd32a' : '#ff9f1a', 1.4);
    }
  }
  ctx.restore();
}

// חבל/מקל – מצויר אנכית מ-(0,0) עד (0,-len). מסובבים אותו מבחוץ.
export function drawRope(ctx, id, len, t) {
  if (len <= 0) return;
  const w = 5;
  ctx.save();
  ctx.lineJoin = 'round';
  const body = (fill, glow) => {
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;
    }
    rr(ctx, -w / 2, -len, w, len, 2);
    fillStroke(ctx, fill, 1.8);
    ctx.shadowBlur = 0;
  };
  if (id === 'wood') body('#8d5a3b');
  else if (id === 'red') body('#e74c3c');
  else if (id === 'mint') body('#55efc4');
  else if (id === 'blue') body('#3fa9ff');
  else if (id === 'yellow') body('#ffd32a');
  else if (id === 'pink') body('#ff8ccf');
  else if (id === 'rainbow' || id === 'candy') {
    const cols = id === 'rainbow' ? ['#ff6b6b', '#feca57', '#1dd1a1', '#48dbfb', '#a55eea'] : ['#ff4757', '#fff'];
    const seg = id === 'rainbow' ? 8 : 6;
    for (let y = 0, i = 0; y < len; y += seg, i++) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.fillRect(-w / 2, -Math.min(len, y + seg), w, Math.min(seg, len - y));
    }
    rr(ctx, -w / 2, -len, w, len, 2);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = OL;
    ctx.stroke();
  } else if (id === 'vine') {
    body('#27ae60');
    for (let y = 10, i = 0; y < len; y += 14, i++) {
      const s = i % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.ellipse(s * 6, -y, 5, 2.6, s * 0.5, 0, Math.PI * 2);
      fillStroke(ctx, '#7bed9f', 1.2);
    }
  } else if (id === 'snake') {
    body('#2ecc71');
    for (let y = 6; y < len - 6; y += 9) {
      circle(ctx, 0, -y, 1.4);
      ctx.fillStyle = '#f9ca24';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(0, -len - 3, 5, 6, 0, 0, Math.PI * 2);
    fillStroke(ctx, '#2ecc71', 1.6);
    for (const ex of [-2, 2]) {
      circle(ctx, ex, -len - 5, 1.1);
      ctx.fillStyle = OL;
      ctx.fill();
    }
    if (Math.sin(t * 8) > 0) {
      ctx.beginPath();
      ctx.moveTo(0, -len - 9);
      ctx.lineTo(0, -len - 13);
      ctx.lineTo(-2, -len - 15);
      ctx.moveTo(0, -len - 13);
      ctx.lineTo(2, -len - 15);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  } else if (id === 'laser') {
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;
    rr(ctx, -w / 2, -len, w, len, 2.5);
    ctx.fillStyle = '#00f0ff';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-1, -len, 2, len);
  } else if (id === 'golden') {
    const g = ctx.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, '#b8860b');
    g.addColorStop(0.5, '#ffe066');
    g.addColorStop(1, '#b8860b');
    body(g, '#ffd32a');
    const sy = -((t * 60) % Math.max(len, 1));
    ctx.fillStyle = '#fff';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', 5, sy);
  } else body('#8d5a3b');
  ctx.restore();
}

// חלקיקי שביל מאחורי הדמות
export function spawnTrail(list, id, x, y) {
  if (id === 'none') return;
  const r = Math.random;
  const p = { x: x - 10 + r() * 4, y: y - 4 - r() * 10, vx: -10 - r() * 15, vy: -10 - r() * 20, life: 0, max: 0.6 + r() * 0.4, kind: id, size: 3 + r() * 3 };
  if (id === 'dust') Object.assign(p, { y: y - 2, vy: -5 - r() * 8, color: '#d1ccc0' });
  if (id === 'bubbles') Object.assign(p, { vy: -25 - r() * 20, color: 'rgba(160,231,255,0.85)', size: 2 + r() * 3 });
  if (id === 'hearts') p.color = ['#ff6b81', '#ff4757', '#ff9ff3'][Math.floor(r() * 3)];
  if (id === 'stars') p.color = ['#feca57', '#fff200'][Math.floor(r() * 2)];
  if (id === 'sparkles') p.color = ['#fff', '#7efff5', '#fff3a3'][Math.floor(r() * 3)];
  if (id === 'fire') Object.assign(p, { vy: -30 - r() * 25, color: ['#ff9f1a', '#ff3838', '#ffd32a'][Math.floor(r() * 3)] });
  if (id === 'rainbowtrail') p.color = `hsl(${(performance.now() / 4) % 360},90%,62%)`;
  list.push(p);
}

export function drawParticles(ctx, list, dt) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.life += dt;
    if (p.life >= p.max) {
      list.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.g) p.vy += p.g * dt;
    const a = 1 - p.life / p.max;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color || '#fff';
    const s = p.size * (p.kind === 'fire' ? a : 1);
    if (p.kind === 'hearts' || p.kind === 'stars' || p.kind === 'sparkles' || p.text) {
      ctx.font = `${s * 3}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text || (p.kind === 'hearts' ? '♥' : p.kind === 'stars' ? '★' : '✦'), p.x, p.y);
    } else {
      circle(ctx, p.x, p.y, s);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ===== עולמות =====
export const WORLD = {
  meadow: { sky: ['#6ec6ff', '#c8f0ff'], far: '#8fd694', near: '#5cbf6a', pillar: '#ffd166', pillarDark: '#e8a93a', top: '#7bd389' },
  sunset: { sky: ['#ff7e5f', '#feb47b'], far: '#c56c86', near: '#6c5b7b', pillar: '#ffb385', pillarDark: '#d9805a', top: '#ff6b6b' },
  desert: { sky: ['#ffd29d', '#fff1c1'], far: '#f6b26b', near: '#e69138', pillar: '#c97b4a', pillarDark: '#9c5a32', top: '#f6d186' },
  space: { sky: ['#0b0b2b', '#2b1a5a'], far: '#3a2f7a', near: '#251d52', pillar: '#8e7dff', pillarDark: '#5f4bd8', top: '#c9b8ff' },
  ocean: { sky: ['#0a4f8a', '#29b6f6'], far: '#126e9e', near: '#0d5c84', pillar: '#ff8a80', pillarDark: '#d95e55', top: '#ffd1dc' },
  sweets: { sky: ['#ffafcc', '#ffe5ec'], far: '#cdb4db', near: '#a2d2ff', pillar: '#fff', pillarDark: '#ffc8dd', top: '#ff70a6' },
  aurora: { sky: ['#071a2c', '#14394f'], far: '#1d4e5f', near: '#0e2f3d', pillar: '#a8e6cf', pillarDark: '#5fb49c', top: '#dcedc1' },
};

const hash = (n) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

export function drawWorld(ctx, id, W, H, cam, t) {
  const th = WORLD[id] || WORLD.meadow;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.sky[0]);
  g.addColorStop(1, th.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // שכבת שמיים
  if (id === 'space' || id === 'aurora') {
    for (let i = 0; i < 70; i++) {
      const x = (hash(i) * W * 2 - cam * 0.05) % (W * 2);
      const xx = x < 0 ? x + W * 2 : x;
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
      ctx.globalAlpha = 0.4 + tw * 0.6;
      ctx.fillStyle = '#fff';
      ctx.fillRect(xx - W * 0.5, hash(i + 99) * H * 0.6, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  }
  if (id === 'space') {
    circle(ctx, W * 0.75 - (cam * 0.02) % (W * 1.5), H * 0.18, 34);
    fillStroke(ctx, '#ff9ff3', 3);
    ctx.beginPath();
    ctx.ellipse(W * 0.75 - (cam * 0.02) % (W * 1.5), H * 0.18, 56, 12, -0.3, 0, Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#feca57';
    ctx.stroke();
  }
  if (id === 'aurora') {
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) {
        const y = H * (0.15 + b * 0.07) + Math.sin(x * 0.02 + t * 0.8 + b) * 18;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineWidth = 22 - b * 5;
      ctx.strokeStyle = ['rgba(80,255,170,0.25)', 'rgba(120,200,255,0.22)', 'rgba(200,120,255,0.18)'][b];
      ctx.stroke();
    }
  }
  if (id === 'meadow' || id === 'sunset' || id === 'desert' || id === 'sweets') {
    // שמש
    const sunCol = { meadow: '#fff3a3', sunset: '#ffe29a', desert: '#fff', sweets: '#fff' }[id];
    circle(ctx, W * 0.2, H * 0.16, id === 'sunset' ? 40 : 26);
    ctx.fillStyle = sunCol;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
    // עננים
    for (let i = 0; i < 5; i++) {
      const span = W + 160;
      let x = (hash(i + 7) * span - cam * 0.08 - t * 6 * (1 + i * 0.2)) % span;
      if (x < 0) x += span;
      x -= 80;
      const y = H * (0.08 + hash(i + 3) * 0.25);
      ctx.fillStyle = id === 'sweets' ? '#fff0f6' : 'rgba(255,255,255,0.9)';
      for (const [dx, dy, r] of [[0, 0, 14], [14, -6, 16], [30, 0, 13], [15, 4, 13]]) {
        circle(ctx, x + dx, y + dy, r);
        ctx.fill();
      }
    }
  }
  if (id === 'ocean') {
    for (let i = 0; i < 18; i++) {
      const x = hash(i) * W;
      const y = H - ((t * (20 + hash(i + 5) * 30) + hash(i + 9) * H) % H);
      circle(ctx, x + Math.sin(t * 2 + i) * 4, y, 2 + hash(i + 2) * 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    // קרני אור
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(W * (0.1 + i * 0.25), 0);
      ctx.lineTo(W * (0.2 + i * 0.25), 0);
      ctx.lineTo(W * (0.05 + i * 0.25), H * 0.7);
      ctx.fill();
    }
  }

  // גבעות פרלקסה
  const hills = (color, speed, base, amp, freq, seed) => {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 10; x += 8) {
      const wx = x + cam * speed;
      const y = base - amp * (0.6 * Math.sin(wx * freq + seed) + 0.4 * Math.sin(wx * freq * 2.3 + seed * 2));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  if (id === 'desert') {
    hills(th.far, 0.15, H * 0.55, 20, 0.008, 1);
    // קקטוסים
    for (let i = -1; i < 6; i++) {
      const span = 140;
      const k = Math.floor((cam * 0.3) / span) + i;
      const x = k * span - cam * 0.3 + hash(k) * 60;
      const y = H * 0.6;
      ctx.save();
      ctx.translate(x, y);
      rr(ctx, -5, -30, 10, 34, 5);
      fillStroke(ctx, '#2ecc71', 2);
      rr(ctx, -14, -20, 6, 12, 3);
      fillStroke(ctx, '#2ecc71', 2);
      ctx.restore();
    }
    hills(th.near, 0.3, H * 0.62, 14, 0.012, 3);
  } else if (id === 'sweets') {
    hills(th.far, 0.15, H * 0.52, 26, 0.009, 1);
    for (let i = -1; i < 6; i++) {
      const span = 120;
      const k = Math.floor((cam * 0.3) / span) + i;
      const x = k * span - cam * 0.3 + hash(k) * 50;
      const y = H * 0.58;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 30);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      circle(ctx, x, y - 38, 11);
      fillStroke(ctx, ['#ff70a6', '#70d6ff', '#ffd670'][((k % 3) + 3) % 3], 2);
      ctx.beginPath();
      ctx.arc(x, y - 38, 6, 0, Math.PI * 1.5);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    hills(th.near, 0.3, H * 0.62, 16, 0.013, 3);
  } else if (id === 'ocean') {
    hills(th.far, 0.15, H * 0.58, 18, 0.01, 1);
    for (let i = -1; i < 9; i++) {
      const span = 70;
      const k = Math.floor((cam * 0.3) / span) + i;
      const x = k * span - cam * 0.3 + hash(k) * 30;
      ctx.beginPath();
      ctx.moveTo(x, H * 0.66);
      for (let s = 1; s <= 5; s++) ctx.lineTo(x + Math.sin(t * 2 + s + k) * 5, H * 0.66 - s * 9 * (0.7 + hash(k + 1) * 0.6));
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2ecc71';
      ctx.stroke();
    }
    hills(th.near, 0.3, H * 0.66, 10, 0.014, 3);
  } else {
    hills(th.far, 0.15, H * 0.52, 28, 0.007, 1);
    hills(th.near, 0.3, H * 0.6, 18, 0.011, 3);
  }
}

// עמוד: x, רוחב, גובה העליון
export function drawPillar(ctx, id, x, w, top, H, perfect) {
  const th = WORLD[id] || WORLD.meadow;
  rr(ctx, x, top, w, H - top + 10, [6, 6, 0, 0]);
  fillStroke(ctx, th.pillar, 2.6);
  ctx.fillStyle = th.pillarDark;
  ctx.fillRect(x + w - Math.min(8, w * 0.25), top + 6, Math.min(8, w * 0.25) - 1.3, H - top);
  // שכבה עליונה (דשא / ציפוי)
  rr(ctx, x - 2, top - 2, w + 4, 8, 4);
  fillStroke(ctx, th.top, 2.2);
  if (perfect) {
    rr(ctx, x + w / 2 - 4, top - 2, 8, 4, 2);
    ctx.fillStyle = '#ff3b5c';
    ctx.fill();
  }
}

export function drawGem(ctx, x, y, t) {
  const b = Math.sin(t * 4) * 2;
  ctx.save();
  ctx.translate(x, y + b);
  ctx.shadowColor = '#7efff5';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(7, -2);
  ctx.lineTo(0, 8);
  ctx.lineTo(-7, -2);
  ctx.closePath();
  fillStroke(ctx, '#48dbfb', 2);
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(-7, -2);
  ctx.lineTo(7, -2);
  ctx.moveTo(0, -8);
  ctx.lineTo(-2.5, -2);
  ctx.lineTo(0, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.stroke();
  ctx.restore();
}

// תצוגה מקדימה קטנה לכרטיס בחנות / שורה בטבלה
export function renderPreview(canvas, it, t = 0) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = canvas.clientWidth || 64, ch = canvas.clientHeight || 64;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const s = Math.min(cw, ch) / 64;
  ctx.save();
  ctx.scale(s, s);
  if (it.cat === 'char') drawHero(ctx, it.id, 32, 54, t);
  else if (it.cat === 'rope') {
    ctx.translate(32, 58);
    ctx.rotate(0.5);
    drawRope(ctx, it.id, 46, t);
  } else if (it.cat === 'world') {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(2, 2, 60, 60, 10);
    ctx.clip();
    drawWorld(ctx, it.id, 64, 64, 0, t);
    drawPillar(ctx, it.id, 6, 18, 44, 64);
    drawPillar(ctx, it.id, 42, 16, 44, 64);
    ctx.restore();
  } else if (it.cat === 'trail') {
    drawHero(ctx, 'bean', 44, 56, t, { walking: true });
    const glyph = { none: '–', dust: '•', bubbles: '○', hearts: '♥', stars: '★', sparkles: '✦', fire: '🔥', rainbowtrail: '' }[it.id];
    const cols = { dust: '#b2aaa0', bubbles: '#3fa9ff', hearts: '#ff4757', stars: '#feca57', sparkles: '#48dbfb', fire: '#ff9f1a' };
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = 1 - i * 0.2;
      ctx.fillStyle = it.id === 'rainbowtrail' ? `hsl(${i * 70},90%,60%)` : cols[it.id] || '#888';
      if (it.id === 'rainbowtrail') {
        circle(ctx, 26 - i * 7, 46 - i * 3, 5 - i * 0.6);
        ctx.fill();
      } else {
        ctx.font = `${14 - i * 2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(glyph, 26 - i * 7, 50 - i * 6);
      }
    }
    ctx.globalAlpha = 1;
  } else if (it.id === 'b-coins') {
    circle(ctx, 32, 33, 18);
    fillStroke(ctx, '#ffd32a', 3);
    circle(ctx, 32, 33, 11);
    ctx.strokeStyle = '#e0a800';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.font = '900 13px Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillStyle = OL;
    ctx.fillText('x2', 32, 38);
  } else {
    ctx.font = '34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.emoji || '🙂', 32, 34);
  }
  ctx.restore();
}
