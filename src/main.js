import './style.css';
import { Game } from './game.js';
import { sfx, setMuted } from './audio.js';
import { renderPreview } from './draw.js';
import { ITEMS, ITEM, CATEGORIES, RARITY, UNLOCKS, dailyShop, priceOf, isForSale } from './items.js';
import { profile, save, levelInfo, owns, buy, equip, dailyLogin, finishGame, grantChampion, dayKey, canAfford, login, logout } from './store.js';
import { submitScore, fetchBoard, boardId, online, previousWinner } from './leaderboard.js';

const ui = document.getElementById('ui');
const game = new Game(document.getElementById('game'));
setMuted(profile.muted);
if (import.meta.env.DEV) window.__game = game; // לבדיקות בלבד

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const COIN = '<i class="ci"></i>';
const fmt = (n) => n.toLocaleString('he-IL');
const $ = (sel) => ui.querySelector(sel);

function player() {
  return { id: profile.id, name: profile.name, char: profile.equipped.char, emote: ITEM[profile.equipped.emote]?.emoji || '', level: levelInfo().level };
}

function topBar(back) {
  const L = levelInfo();
  return `
  <div class="topbar">
    ${back ? `<button class="btn small back" data-go="home">→ חזרה</button>` : `<button class="lvl" data-go="settings" aria-label="הגדרות">
      <span class="lvl-num">${L.level}</span>
      <span class="lvl-bar"><i style="width:${(L.cur / L.need) * 100}%"></i></span>
    </button>`}
    <div class="wallet">
      <span class="pill coin">${COIN} ${fmt(profile.coins)}</span>
      <span class="pill gem">💎 ${fmt(profile.gems)}</span>
    </div>
  </div>`;
}

function activeBoosts() {
  const b = profile.boosts;
  const out = [];
  if (b.coinGames > 0) out.push(`${COIN}x2 · ${b.coinGames} משחקים`);
  if (b.xpUntil > Date.now()) out.push(`⭐x2 · ${Math.ceil((b.xpUntil - Date.now()) / 60000)} דק׳`);
  if (b.luckGames > 0) out.push(`🍀 · ${b.luckGames} משחקים`);
  return out;
}

function toast(html, ms = 2200) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

function modal(html, onReady) {
  const m = document.createElement('div');
  m.className = 'modal-wrap';
  m.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) close();
  });
  onReady && onReady(m, close);
  return close;
}

function unlockedModal(items) {
  if (!items?.length) return;
  sfx.buy();
  modal(
    `<div class="mythic-glow">🔴 פריט מיתי נפתח! 🔴</div>
     ${items.map((it) => `<div class="unlock-item"><canvas class="prev big" data-prev="${it.id}"></canvas><b>${esc(it.name)}</b><small>${esc(UNLOCKS[it.unlock])}</small></div>`).join('')}
     <button class="btn" data-close>יאללה!</button>`,
    (m) => m.querySelectorAll('[data-prev]').forEach((c) => renderPreview(c, ITEM[c.dataset.prev]))
  );
}

// ===================== מסכים =====================
const screens = {
  name() {
    game.showMenu(profile.equipped);
    ui.innerHTML = `
    <div class="screen center">
      <h1 class="logo">משפוחס<br><span>קופצים</span></h1>
      <div class="card">
        <label class="lbl">מי משחק? הקלידו את השם</label>
        <input id="nm" maxlength="14" placeholder="למשל: סבתא רחל" autocomplete="off" />
        <p class="hint">שיחקתם כבר במכשיר הזה? הקלידו את אותו שם וממשיכים מאיפה שעצרתם.<br>השם יופיע בטבלאות של כל המשפחה.</p>
        <button class="btn big" id="go">יאללה, מתחילים!</button>
      </div>
    </div>`;
    const input = $('#nm');
    $('#go').onclick = () => {
      const v = input.value.trim().replace(/\s+/g, ' ');
      if (v.length < 2) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
        return;
      }
      const back = login(v);
      setMuted(profile.muted);
      sfx.click();
      show('home');
      if (back) toast(`👋 ברוכים השבים, ${esc(profile.name)}!`);
      startupGifts();
    };
    input.addEventListener('keydown', (e) => e.key === 'Enter' && $('#go').click());
  },

  home() {
    game.showMenu(profile.equipped);
    const boosts = activeBoosts();
    ui.innerHTML = `
    <div class="screen">
      ${topBar()}
      <h1 class="logo small">משפוחס<br><span>קופצים</span></h1>
      <div class="hello">היי ${esc(profile.name)} ${ITEM[profile.equipped.emote]?.emoji || '👋'}</div>
      <button class="btn small switch" data-go="logout">🚪 לא ${esc(profile.name)}? החלפת שחקן</button>
      <div class="chips">
        <span class="chip">🏅 שיא: ${fmt(profile.stats.best)}</span>
        <span class="chip">🔥 רצף: ${profile.streak.count} ימים</span>
      </div>
      ${boosts.length ? `<div class="chips">${boosts.map((b) => `<span class="chip boost">${b}</span>`).join('')}</div>` : ''}
      <div class="spacer"></div>
      <div class="menu">
        <button class="btn big play" data-go="play">▶ שחק</button>
        <div class="row">
          <button class="btn shop" data-go="shop">🛒 חנות</button>
          <button class="btn board" data-go="board">🏆 טבלאות</button>
        </div>
      </div>
    </div>`;
  },

  play() {
    sfx.unlock();
    game.start(profile.equipped, profile.boosts.luckGames > 0);
    ui.innerHTML = `
    <div class="hud">
      <div class="score" id="sc">0</div>
      <div class="hud-sub"><span id="gm">💎 0</span> <span id="pr"></span></div>
    </div>`;
    game.onScore = (g) => {
      $('#sc').textContent = g.score;
      $('#sc').classList.remove('pop');
      void $('#sc').offsetWidth;
      $('#sc').classList.add('pop');
      $('#gm').textContent = '💎 ' + g.gems;
      $('#pr').textContent = g.perfectRun > 1 ? `🎯 x${g.perfectRun}` : '';
    };
    game.onEnd = (res) => {
      game.onScore = null;
      setTimeout(() => show('over', res), 250);
    };
  },

  over(res) {
    const prevBest = profile.stats.best;
    const earn = finishGame(res);
    const share = `🦘 משפוחס קופצים! ${profile.name} הגיע/ה ל-${res.score} נקודות${res.perfects ? ` עם ${res.perfects} נחיתות מושלמות` : ''}. נראה אתכם עוקפים 😏\n`;
    ui.innerHTML = `
    <div class="screen center">
      <div class="card over">
        <div class="over-title">${earn.newBest ? '🎉 שיא חדש! 🎉' : 'נפלת! 😵'}</div>
        <div class="big-score">${res.score}</div>
        <div class="muted">השיא שלך: ${fmt(Math.max(prevBest, res.score))}</div>
        <div class="earn">
          <span>${COIN} +${earn.coins}${earn.coinMult > 1 ? ' <b>x2</b>' : ''}</span>
          <span>💎 +${earn.gems + earn.levelGems}</span>
          <span>⭐ +${earn.xp} XP${earn.xpMult > 1 ? ' <b>x2</b>' : ''}</span>
        </div>
        ${earn.levelUp ? `<div class="levelup">⬆️ עלית לרמה ${earn.levelUp}! +${earn.levelGems} 💎</div>` : ''}
        <div class="rank" id="rank">שומר בטבלאות…</div>
        <button class="btn big play" data-go="play">↻ עוד פעם!</button>
        <div class="row">
          <button class="btn small" data-go="home">🏠 בית</button>
          <button class="btn small wa" id="wa">שתף בווטסאפ</button>
        </div>
      </div>
    </div>`;
    $('#wa').onclick = () => {
      const url = location.href.split('#')[0];
      open('https://wa.me/?text=' + encodeURIComponent(share + url), '_blank');
    };
    unlockedModal(earn.unlocked);
    submitScore(player(), res.score)
      .then(() => fetchBoard(boardId.day()))
      .then((r) => {
        const el = $('#rank');
        if (!el) return;
        const i = r.rows.findIndex((x) => x.id === profile.id);
        el.innerHTML = r.online
          ? i >= 0
            ? `המקום שלך היום: <b>${i + 1}</b> מתוך ${r.rows.length}`
            : ''
          : 'נשמר בטבלה המקומית';
      })
      .catch(() => ($('#rank').textContent = ''));
  },

  shop(tab = 'daily') {
    game.showMenu(profile.equipped);
    const L = levelInfo().level;
    let cards = [];
    if (tab === 'daily') {
      cards = dailyShop(dayKey()).map((d) => ({ it: d.item, discount: d.discount, special: d.special }));
    } else if (tab === 'mythic') {
      cards = ITEMS.filter((i) => i.rarity === 'mythic').map((it) => ({ it }));
    } else {
      cards = ITEMS.filter((i) => i.cat === tab && i.rarity !== 'mythic').map((it) => ({ it }));
    }
    const now = new Date();
    const mid = new Date(now);
    mid.setHours(24, 0, 0, 0);
    const left = mid - now;
    const hh = Math.floor(left / 3600000), mm = Math.floor((left % 3600000) / 60000);

    const card = ({ it, discount = 0, special }) => {
      const r = RARITY[it.rarity];
      const have = owns(it.id);
      const using = profile.equipped[it.cat] === it.id;
      const price = priceOf(it, discount);
      let action;
      if (it.cat === 'boost') action = `<button class="btn tiny ${canAfford(price) ? '' : 'dis'}" data-buy="${it.id}" data-disc="${discount}">${price.cur === 'coins' ? COIN : '💎'} ${fmt(price.amount)}</button>`;
      else if (using) action = `<span class="tag on">✔ בשימוש</span>`;
      else if (have) action = `<button class="btn tiny green" data-equip="${it.id}">השתמש</button>`;
      else if (it.unlock) action = `<span class="tag lock">🔒 ${esc(UNLOCKS[it.unlock])}</span>`;
      else if (it.dailyOnly && !discount && tab !== 'daily') action = `<span class="tag lock">✨ מופיע רק בחנות היומית</span>`;
      else if (it.level && L < it.level) action = `<span class="tag lock">🔒 רמה ${it.level}</span>`;
      else
        action = `<button class="btn tiny ${canAfford(price) ? '' : 'dis'}" data-buy="${it.id}" data-disc="${discount}">${price.cur === 'coins' ? COIN : '💎'} ${fmt(price.amount)}${discount ? ` <s>${fmt(priceOf(it).amount)}</s>` : ''}</button>`;
      return `
      <div class="item r-${it.rarity}${special ? ' special' : ''}" style="--rc:${r.color}">
        ${discount ? `<span class="ribbon">-${discount * 100}%</span>` : ''}
        ${special ? `<span class="ribbon gold">רק היום!</span>` : ''}
        <canvas class="prev" data-prev="${it.id}"></canvas>
        <div class="iname">${esc(it.name)}</div>
        <div class="rar">${r.name}${it.desc ? ` · ${esc(it.desc)}` : ''}</div>
        ${action}
      </div>`;
    };

    ui.innerHTML = `
    <div class="screen shop-screen">
      ${topBar(true)}
      <div class="tabs">${CATEGORIES.map((c) => `<button class="tab ${c.id === tab ? 'on' : ''}" data-tab="${c.id}">${c.icon} ${c.name}</button>`).join('')}</div>
      ${tab === 'daily' ? `<div class="note">🔄 החנות מתחלפת בעוד ${hh}:${String(mm).padStart(2, '0')} · כל המשפחה רואה את אותם מבצעים</div>` : ''}
      ${tab === 'mythic' ? `<div class="note red">פריטים מיתיים לא נמכרים בכלל – רק מי שמשיג את ההישג מקבל אותם</div>` : ''}
      <div class="grid">${cards.map(card).join('')}</div>
    </div>`;
    ui.querySelectorAll('[data-prev]').forEach((c) => renderPreview(c, ITEM[c.dataset.prev], 0.5));
    ui.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => (sfx.click(), show('shop', b.dataset.tab))));
    ui.querySelectorAll('[data-equip]').forEach(
      (b) =>
        (b.onclick = () => {
          equip(ITEM[b.dataset.equip]);
          sfx.click();
          show('shop', tab);
        })
    );
    ui.querySelectorAll('[data-buy]').forEach(
      (b) =>
        (b.onclick = () => {
          const it = ITEM[b.dataset.buy];
          const r = buy(it, +b.dataset.disc || 0);
          if (!r.ok) {
            toast('😅 ' + r.reason);
            return;
          }
          sfx.buy();
          if (r.box) {
            if (r.box.item)
              modal(
                `<div class="over-title">🎁 בתיבה היה…</div><div class="unlock-item"><canvas class="prev big" data-prev="${r.box.item.id}"></canvas><b>${esc(r.box.item.name)}</b><small style="color:${RARITY[r.box.item.rarity].color}">${RARITY[r.box.item.rarity].name}</small></div><button class="btn" data-close>מגניב!</button>`,
                (m) => m.querySelectorAll('[data-prev]').forEach((c) => renderPreview(c, ITEM[c.dataset.prev]))
              );
            else toast(`🎁 כבר יש לך הכול! קיבלת ${r.box.gems} 💎`);
          } else toast(`✅ ${esc(it.name)} – ${it.cat === 'boost' ? 'הופעל!' : 'שלך!'}`);
          const scroll = $('.grid')?.scrollTop;
          show('shop', tab);
          if (scroll) $('.grid').scrollTop = scroll;
        })
    );
  },

  async board(tab = 'day') {
    game.showMenu(profile.equipped);
    const names = { day: 'היום', week: 'השבוע', all: 'כל הזמנים' };
    ui.innerHTML = `
    <div class="screen board-screen">
      ${topBar(true)}
      <h2 class="title">🏆 טבלאות המובילים</h2>
      <div class="tabs three">${Object.entries(names).map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-btab="${k}">${n}</button>`).join('')}</div>
      <div class="note" id="bnote"></div>
      <div class="list" id="list"><div class="loading">טוען…</div></div>
    </div>`;
    ui.querySelectorAll('[data-btab]').forEach((b) => (b.onclick = () => (sfx.click(), show('board', b.dataset.btab))));
    const note = { day: 'מתאפסת כל לילה ב-00:00 · מקום ראשון מקבל 15 💎', week: 'מתאפסת כל יום ראשון · אלוף/ת השבוע מקבל/ת 50 💎 ופריטים מיתיים', all: 'השיא של כל הזמנים' };
    $('#bnote').textContent = note[tab];
    const r = await fetchBoard(boardId[tab]());
    if (!$('#list')) return;
    if (!r.online) $('#bnote').innerHTML = '📱 מצב מקומי – הטבלה המשותפת תופעל אחרי חיבור Firebase';
    $('#list').innerHTML = r.rows.length
      ? r.rows
          .map(
            (row, i) => `
        <div class="lrow ${row.id === profile.id ? 'me' : ''}">
          <span class="rk">${['🥇', '🥈', '🥉'][i] || i + 1}</span>
          <canvas class="prev mini" data-prev="${esc(row.char || 'bean')}"></canvas>
          <span class="nm">${esc(row.name)} ${esc(row.emote || '')}<small>רמה ${row.level || 1}</small></span>
          <span class="pts">${fmt(row.score)}</span>
        </div>`
          )
          .join('')
      : `<div class="loading">עוד אין תוצאות ${names[tab]} – תהיו הראשונים! 🚀</div>`;
    ui.querySelectorAll('[data-prev]').forEach((c) => renderPreview(c, ITEM[c.dataset.prev] || ITEM.bean, 0.5));
  },

  settings() {
    const L = levelInfo();
    modal(
      `<div class="over-title">⚙️ הגדרות</div>
       <div class="muted">רמה ${L.level} · ${fmt(L.cur)}/${fmt(L.need)} XP לרמה הבאה</div>
       <button class="btn small" id="snd">${profile.muted ? '🔇 צלילים כבויים' : '🔊 צלילים פועלים'}</button>
       <div class="stats">
         <span>משחקים: ${fmt(profile.stats.games)}</span>
         <span>קפיצות: ${fmt(profile.stats.jumps)}</span>
         <span>מושלמות: ${fmt(profile.stats.perfectTotal)}</span>
         <span>רצף מושלמות: ${profile.stats.bestPerfectRun}</span>
       </div>
       <button class="btn" id="saveSet">שמירה</button>`,
      (m, close) => {
        m.querySelector('#snd').onclick = (e) => {
          profile.muted = !profile.muted;
          setMuted(profile.muted);
          save();
          e.target.textContent = profile.muted ? '🔇 צלילים כבויים' : '🔊 צלילים פועלים';
        };
        m.querySelector('#saveSet').onclick = () => {
          save();
          close();
          show('home');
        };
      }
    );
  },
};

let current = '';
function show(name, arg) {
  if (name === 'settings') return screens.settings();
  if (name === 'logout') {
    document.querySelectorAll('.toast, .modal-wrap').forEach((el) => el.remove());
    logout();
    name = 'name';
  }
  current = name;
  screens[name](arg);
}

ui.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (!b) return;
  sfx.click();
  show(b.dataset.go);
});

// ===== הפעלה =====
show('name');

function startupGifts() {
  if (!profile.name) return;
  const g = dailyLogin();
  if (g) {
    modal(
      `<div class="over-title">🎁 מתנת כניסה יומית</div>
       <div class="streak">🔥 רצף של ${g.streak} ${g.streak === 1 ? 'יום' : 'ימים'}</div>
       <div class="earn"><span>${COIN} +${g.coins}</span><span>💎 +${g.gems}</span></div>
       <div class="muted">${g.streak % 7 === 0 ? 'בונוס שבועי! 🎉' : `עוד ${7 - (g.streak % 7)} ימים לבונוס של 15 💎`}</div>
       <button class="btn" data-close>תודה!</button>`
    );
    unlockedModal(g.unlocked);
    if (current === 'home') show('home');
  }
  // פרסים לאלופים
  previousWinner('week')
    .then((w) => {
      if (w && w.winnerId === profile.id) {
        const got = grantChampion(w.key);
        if (got) {
          toast('🏆 היית אלוף/ת השבוע שעבר! +50 💎', 3500);
          unlockedModal(got);
        }
      }
    })
    .catch(() => {});
  previousWinner('day')
    .then((w) => {
      if (w && w.winnerId === profile.id && profile.dayWinClaimed !== w.key) {
        profile.dayWinClaimed = w.key;
        profile.gems += 15;
        save();
        toast('🥇 ניצחת אתמול! +15 💎', 3500);
      }
    })
    .catch(() => {});
}

console.log(online ? 'Firebase מחובר' : 'מצב מקומי (בלי Firebase)');
