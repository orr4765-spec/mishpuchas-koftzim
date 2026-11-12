// קטלוג החנות: דמויות, חבלים, שבילים, עולמות, אימוג'י ובוסטים.
// כל הפריטים קוסמטיים בלבד – אף פריט לא עוזר לקפוץ טוב יותר.

export const RARITY = {
  common: { name: 'רגיל', color: '#9aa3b2', order: 0 },
  rare: { name: 'נדיר', color: '#3b82f6', order: 1 },
  epic: { name: 'אפי', color: '#a855f7', order: 2 },
  legendary: { name: 'אגדי', color: '#f5b301', order: 3 },
  mythic: { name: 'מיתי', color: '#ef4444', order: 4 },
};

export const CATEGORIES = [
  { id: 'daily', name: 'מבצעי היום', icon: '🔥' },
  { id: 'char', name: 'דמויות', icon: '🧸' },
  { id: 'rope', name: 'חבלים', icon: '🧶' },
  { id: 'trail', name: 'שבילים', icon: '✨' },
  { id: 'world', name: 'עולמות', icon: '🌍' },
  { id: 'emote', name: 'אימוג׳י', icon: '😎' },
  { id: 'boost', name: 'בוסטים', icon: '🚀' },
  { id: 'mythic', name: 'מיתיים', icon: '🔴' },
];

// unlock = איך משיגים פריט מיתי (הם לא נמכרים בכלל)
export const UNLOCKS = {
  perfect10: '10 נחיתות מושלמות ברצף במשחק אחד',
  streak30: 'להיכנס למשחק 30 ימים ברצף',
  champion: 'לסיים במקום ראשון בטבלה השבועית',
  score100: 'להגיע ל-100 נקודות במשחק אחד',
  level50: 'להגיע לרמה 50',
  perfect1000: '1,000 נחיתות מושלמות בסך הכול',
};

// dailyOnly = אגדי שמופיע רק בחנות היומית, ולא בכל יום
export const ITEMS = [
  // דמויות
  { id: 'bean', cat: 'char', name: 'שעועית', rarity: 'common', free: true },
  { id: 'kitty', cat: 'char', name: 'חתלתול', rarity: 'common', coins: 250 },
  { id: 'chef', cat: 'char', name: 'שף', rarity: 'common', coins: 300 },
  { id: 'ninja', cat: 'char', name: 'נינג׳ה', rarity: 'rare', coins: 900 },
  { id: 'pirate', cat: 'char', name: 'פיראט', rarity: 'rare', coins: 1200 },
  { id: 'fairy', cat: 'char', name: 'פיה', rarity: 'rare', coins: 1400 },
  { id: 'robot', cat: 'char', name: 'רובוט', rarity: 'epic', gems: 60 },
  { id: 'astronaut', cat: 'char', name: 'אסטרונאוט', rarity: 'epic', gems: 90, level: 8 },
  { id: 'dragon', cat: 'char', name: 'דרקון', rarity: 'legendary', gems: 320, level: 20, dailyOnly: true },
  { id: 'king', cat: 'char', name: 'מלך', rarity: 'legendary', gems: 400, level: 25, dailyOnly: true },
  { id: 'ghost', cat: 'char', name: 'רוח רפאים', rarity: 'mythic', unlock: 'perfect10' },
  { id: 'phoenix', cat: 'char', name: 'עוף החול', rarity: 'mythic', unlock: 'streak30' },
  { id: 'unicorn', cat: 'char', name: 'חד־קרן', rarity: 'mythic', unlock: 'champion' },

  // חבלים
  { id: 'wood', cat: 'rope', name: 'מקל עץ', rarity: 'common', free: true },
  { id: 'red', cat: 'rope', name: 'חבל אדום', rarity: 'common', coins: 100 },
  { id: 'mint', cat: 'rope', name: 'חבל מנטה', rarity: 'common', coins: 150 },
  { id: 'rainbow', cat: 'rope', name: 'קשת בענן', rarity: 'rare', coins: 800 },
  { id: 'vine', cat: 'rope', name: 'ענף עם עלים', rarity: 'rare', coins: 1000 },
  { id: 'candy', cat: 'rope', name: 'מקל סוכריה', rarity: 'epic', gems: 50 },
  { id: 'snake', cat: 'rope', name: 'נחש', rarity: 'epic', gems: 80, level: 10 },
  { id: 'laser', cat: 'rope', name: 'קרן לייזר', rarity: 'legendary', gems: 300, level: 20, dailyOnly: true },
  { id: 'golden', cat: 'rope', name: 'חבל הזהב', rarity: 'mythic', unlock: 'score100' },

  // שבילים (מה שנשאר מאחורי הדמות כשהיא הולכת)
  { id: 'none', cat: 'trail', name: 'בלי שביל', rarity: 'common', free: true },
  { id: 'dust', cat: 'trail', name: 'ענן אבק', rarity: 'common', coins: 200 },
  { id: 'hearts', cat: 'trail', name: 'לבבות', rarity: 'rare', coins: 900 },
  { id: 'stars', cat: 'trail', name: 'כוכבים', rarity: 'rare', coins: 1100 },
  { id: 'sparkles', cat: 'trail', name: 'ניצוצות', rarity: 'epic', gems: 70 },
  { id: 'fire', cat: 'trail', name: 'אש', rarity: 'legendary', gems: 350, level: 22, dailyOnly: true },
  { id: 'rainbowtrail', cat: 'trail', name: 'שובל קשת', rarity: 'mythic', unlock: 'level50' },

  // עולמות (רקע)
  { id: 'meadow', cat: 'world', name: 'אחו ירוק', rarity: 'common', free: true },
  { id: 'sunset', cat: 'world', name: 'שקיעה', rarity: 'rare', coins: 1000 },
  { id: 'desert', cat: 'world', name: 'מדבר', rarity: 'rare', coins: 1200 },
  { id: 'space', cat: 'world', name: 'חלל', rarity: 'epic', gems: 100, level: 12 },
  { id: 'ocean', cat: 'world', name: 'מתחת לים', rarity: 'legendary', gems: 380, level: 18, dailyOnly: true },
  { id: 'sweets', cat: 'world', name: 'ארץ הממתקים', rarity: 'legendary', gems: 420, level: 24, dailyOnly: true },
  { id: 'aurora', cat: 'world', name: 'זוהר צפוני', rarity: 'mythic', unlock: 'perfect1000' },

  // אימוג'י שמופיע ליד השם בטבלה
  { id: 'e-none', cat: 'emote', name: 'בלי', rarity: 'common', free: true, emoji: '' },
  { id: 'e-fire', cat: 'emote', name: 'אש', rarity: 'common', coins: 120, emoji: '🔥' },
  { id: 'e-cool', cat: 'emote', name: 'מגניב', rarity: 'common', coins: 150, emoji: '😎' },
  { id: 'e-rocket', cat: 'emote', name: 'טיל', rarity: 'rare', coins: 700, emoji: '🚀' },
  { id: 'e-unicorn', cat: 'emote', name: 'חד־קרן', rarity: 'rare', coins: 900, emoji: '🦄' },
  { id: 'e-crown', cat: 'emote', name: 'כתר', rarity: 'epic', gems: 75, emoji: '👑' },
  { id: 'e-gem', cat: 'emote', name: 'יהלום', rarity: 'legendary', gems: 250, dailyOnly: true, emoji: '💎' },
  { id: 'e-trophy', cat: 'emote', name: 'גביע האלופים', rarity: 'mythic', unlock: 'champion', emoji: '🏆' },

  // בוסטים כלכליים – משפיעים רק על כמה מטבעות/יהלומים/XP מקבלים, לא על המשחק
  { id: 'b-coins', cat: 'boost', name: 'מטבעות x2', desc: 'ל-5 משחקים', rarity: 'common', coins: 150, emoji: '🪙' },
  { id: 'b-xp', cat: 'boost', name: 'XP x2', desc: 'לשעה אחת', rarity: 'rare', gems: 12, emoji: '⭐' },
  { id: 'b-luck', cat: 'boost', name: 'קסם מזל', desc: 'יותר יהלומים ל-10 משחקים', rarity: 'rare', gems: 15, emoji: '🍀' },
  { id: 'b-box', cat: 'boost', name: 'תיבת הפתעה', desc: 'פריט אקראי – אולי אגדי!', rarity: 'epic', gems: 40, emoji: '🎁' },
];

export const ITEM = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const isConsumable = (it) => it.cat === 'boost';
export const isForSale = (it) => !it.free && !it.unlock && !isConsumable(it);

// מספר אקראי קבוע לפי מחרוזת – כך כל המשפחה רואה את אותה חנות יומית
function seeded(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// חנות יומית: 3 פריטים רגילים/נדירים/אפיים + משבצת מיוחדת (אגדי ב-40% מהימים).
// הפריט הראשון בהנחה של 25%.
export function dailyShop(dayKey) {
  const rnd = seeded('shop-' + dayKey);
  const normal = ITEMS.filter((i) => isForSale(i) && !i.dailyOnly);
  const legend = ITEMS.filter((i) => isForSale(i) && i.dailyOnly);
  const epic = normal.filter((i) => i.rarity === 'epic');
  const picks = [];
  const pool = [...normal];
  while (picks.length < 3) {
    const idx = Math.floor(rnd() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  const special = rnd() < 0.4 ? legend[Math.floor(rnd() * legend.length)] : epic[Math.floor(rnd() * epic.length)];
  if (!picks.includes(special)) picks.push(special);
  return picks.map((it, i) => ({ item: it, discount: i === 0 ? 0.25 : 0, special: it === special && it.rarity === 'legendary' }));
}

export function priceOf(it, discount = 0) {
  if (it.coins) return { cur: 'coins', amount: Math.round(it.coins * (1 - discount)) };
  if (it.gems) return { cur: 'gems', amount: Math.round(it.gems * (1 - discount)) };
  return null;
}
