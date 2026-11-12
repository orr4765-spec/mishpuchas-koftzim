// הפרופיל של השחקן – נשמר בטלפון (localStorage): מטבעות, יהלומים, XP, פריטים ובוסטים.
import { ITEMS, ITEM, priceOf, RARITY } from './items.js';

const KEY = 'mishpuchas-profile';

export function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
// השבוע מתחיל ביום ראשון
export function weekKey(d = new Date()) {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  return dayKey(s);
}

function uid() {
  const a = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 16);
}

function fresh() {
  return {
    id: uid(),
    name: '',
    coins: 0,
    gems: 0,
    xp: 0,
    owned: ITEMS.filter((i) => i.free).map((i) => i.id),
    equipped: { char: 'bean', rope: 'wood', trail: 'none', world: 'meadow', emote: 'e-none' },
    boosts: { coinGames: 0, xpUntil: 0, luckGames: 0 },
    stats: { games: 0, best: 0, jumps: 0, perfectTotal: 0, bestPerfectRun: 0 },
    streak: { last: '', count: 0 },
    championWeek: '',
    dayWinClaimed: '',
    muted: false,
  };
}

// כמה שחקנים על אותו מכשיר: כל שחקן נשמר בנפרד, ו-ACTIVE זוכר מי משחק עכשיו.
const ACTIVE = 'mishpuchas-active';
const pkey = (id) => 'mishpuchas-p-' + id;
const read = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch {
    return null;
  }
};

// העברה מהגרסה הראשונה (שחקן אחד בלבד)
const legacy = read(KEY);
if (legacy?.id) {
  localStorage.setItem(pkey(legacy.id), JSON.stringify(legacy));
  if (!localStorage.getItem(ACTIVE)) localStorage.setItem(ACTIVE, legacy.id);
  localStorage.removeItem(KEY);
}

export const profile = (() => {
  const p = read(pkey(localStorage.getItem(ACTIVE)));
  if (p && p.id) {
    const base = fresh();
    return { ...base, ...p, equipped: { ...base.equipped, ...p.equipped }, boosts: { ...base.boosts, ...p.boosts }, stats: { ...base.stats, ...p.stats }, streak: { ...base.streak, ...p.streak } };
  }
  return fresh();
})();

export function save() {
  localStorage.setItem(pkey(profile.id), JSON.stringify(profile));
  localStorage.setItem(ACTIVE, profile.id);
}

// כל השחקנים שנשמרו במכשיר הזה (רק כאלה שכבר בחרו שם)
export function listPlayers() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k.startsWith('mishpuchas-p-')) continue;
    const p = read(k);
    if (p?.id && p.name) out.push({ id: p.id, name: p.name, best: p.stats?.best || 0, xp: p.xp || 0, char: p.equipped?.char || 'bean' });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, 'he'));
}

// מחליפים שחקן וטוענים מחדש (הכי פשוט ובטוח – כל המשחק מתחיל נקי עם הפרופיל החדש)
export function switchPlayer(id) {
  if (profile.name) save();
  if (id) localStorage.setItem(ACTIVE, id);
  else localStorage.removeItem(ACTIVE); // שחקן חדש → מסך בחירת שם
  location.reload();
}

// רמות: לרמה n צריך 100·n XP נוספים (רמה 2 = 100, רמה 3 = 300, רמה 50 ≈ 122,500)
export function levelInfo(xp = profile.xp) {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need = 100 * level;
  }
  return { level, cur: rest, need };
}

export const owns = (id) => profile.owned.includes(id);

export function canAfford(price) {
  return price && profile[price.cur] >= price.amount;
}

export function buy(it, discount = 0) {
  const price = priceOf(it, discount);
  if (!price || !canAfford(price)) return { ok: false, reason: 'אין מספיק ' + (price?.cur === 'gems' ? 'יהלומים' : 'מטבעות') };
  if (it.level && levelInfo().level < it.level) return { ok: false, reason: `נפתח ברמה ${it.level}` };
  profile[price.cur] -= price.amount;
  let result = { ok: true };
  if (it.cat === 'boost') result = useBoost(it);
  else {
    profile.owned.push(it.id);
    profile.equipped[it.cat] = it.id;
  }
  save();
  return result;
}

function useBoost(it) {
  const b = profile.boosts;
  if (it.id === 'b-coins') b.coinGames += 5;
  if (it.id === 'b-xp') b.xpUntil = Math.max(Date.now(), b.xpUntil) + 3600_000;
  if (it.id === 'b-luck') b.luckGames += 10;
  if (it.id === 'b-box') return { ok: true, box: openBox() };
  return { ok: true };
}

// תיבת הפתעה: רגיל 50% · נדיר 30% · אפי 15% · אגדי 5%. אם אין מה לתת – 60 יהלומים.
function openBox() {
  const r = Math.random();
  const tier = r < 0.05 ? 'legendary' : r < 0.2 ? 'epic' : r < 0.5 ? 'rare' : 'common';
  const pool = (t) => ITEMS.filter((i) => i.rarity === t && !i.free && !i.unlock && i.cat !== 'boost' && !owns(i.id));
  let list = pool(tier);
  for (const t of ['common', 'rare', 'epic', 'legendary']) if (!list.length) list = pool(t);
  if (!list.length) {
    profile.gems += 60;
    return { gems: 60 };
  }
  const it = list[Math.floor(Math.random() * list.length)];
  profile.owned.push(it.id);
  return { item: it };
}

export function equip(it) {
  if (!owns(it.id)) return;
  profile.equipped[it.cat] = it.id;
  save();
}

// מתנת כניסה יומית + רצף ימים
export function dailyLogin() {
  const today = dayKey();
  if (profile.streak.last === today) return null;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  profile.streak.count = profile.streak.last === dayKey(y) ? profile.streak.count + 1 : 1;
  profile.streak.last = today;
  const n = profile.streak.count;
  const gift = { coins: 50 + Math.min(n, 10) * 10, gems: n % 7 === 0 ? 15 : 2, streak: n };
  profile.coins += gift.coins;
  profile.gems += gift.gems;
  const unlocked = checkUnlocks();
  save();
  return { ...gift, unlocked };
}

// סוף משחק: מחשבים מה הרווחנו
export function finishGame({ score, perfects, bestPerfectRun, gems, jumps }) {
  const b = profile.boosts;
  const coinMult = b.coinGames > 0 ? 2 : 1;
  const xpMult = b.xpUntil > Date.now() ? 2 : 1;
  const coins = (score + perfects) * coinMult;
  const xp = (score * 10 + perfects * 5 + 5) * xpMult;
  const before = levelInfo().level;
  profile.coins += coins;
  profile.gems += gems;
  profile.xp += xp;
  if (b.coinGames > 0) b.coinGames--;
  if (b.luckGames > 0) b.luckGames--;
  const s = profile.stats;
  s.games++;
  s.jumps += jumps;
  s.perfectTotal += perfects;
  s.bestPerfectRun = Math.max(s.bestPerfectRun, bestPerfectRun);
  const newBest = score > s.best;
  s.best = Math.max(s.best, score);
  const after = levelInfo().level;
  // מתנה על עליית רמה
  const levelGems = after > before ? (after - before) * 5 : 0;
  profile.gems += levelGems;
  const unlocked = checkUnlocks();
  save();
  return { coins, gems, xp, coinMult, xpMult, newBest, levelUp: after > before ? after : 0, levelGems, unlocked };
}

// פריטים מיתיים שנפתחים מהישגים
export function checkUnlocks(extra = {}) {
  const s = profile.stats;
  const done = {
    perfect10: s.bestPerfectRun >= 10,
    streak30: profile.streak.count >= 30,
    score100: s.best >= 100,
    level50: levelInfo().level >= 50,
    perfect1000: s.perfectTotal >= 1000,
    champion: !!extra.champion,
  };
  const got = [];
  for (const it of ITEMS) {
    if (it.unlock && done[it.unlock] && !owns(it.id)) {
      profile.owned.push(it.id);
      got.push(it);
    }
  }
  return got;
}

export function grantChampion(week) {
  if (profile.championWeek === week) return null;
  profile.championWeek = week;
  profile.gems += 50;
  const got = checkUnlocks({ champion: true });
  save();
  return got;
}

export function rarityColor(it) {
  return RARITY[it.rarity].color;
}
export { ITEM };
