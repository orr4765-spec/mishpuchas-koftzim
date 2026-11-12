// שלוש טבלאות מובילים: היום, השבוע, כל הזמנים.
// עם Firebase – משותף לכל המשפחה. בלי Firebase – מקומי בטלפון בלבד.
import { firebaseConfig } from './firebase-config.js';
import { dayKey, weekKey } from './store.js';

export const online = !!firebaseConfig.apiKey;
let fs = null; // { db, api }

async function firestore() {
  if (!online) return null;
  if (fs) return fs;
  const [{ initializeApp }, api] = await Promise.all([import('firebase/app'), import('firebase/firestore/lite')]);
  const app = initializeApp(firebaseConfig);
  fs = { db: api.getFirestore(app), api };
  return fs;
}

export const boardId = {
  day: (d) => 'day-' + dayKey(d),
  week: (d) => 'week-' + weekKey(d),
  all: () => 'all',
};

const LKEY = 'mishpuchas-local-boards';
const local = () => {
  try {
    return JSON.parse(localStorage.getItem(LKEY)) || {};
  } catch {
    return {};
  }
};

// שולח תוצאה לשלוש הטבלאות (רק אם היא שיא אישי באותה טבלה)
export async function submitScore(player, score) {
  const ids = [boardId.day(), boardId.week(), boardId.all()];
  const entry = { name: player.name, score, char: player.char, emote: player.emote, level: player.level, ts: Date.now() };
  // שומרים גם מקומית – כדי שיהיה מה להראות גם בלי אינטרנט
  const L = local();
  for (const id of ids) {
    L[id] = L[id] || {};
    const prev = L[id][player.id];
    if (!prev || score > prev.score) L[id][player.id] = entry;
    else Object.assign(prev, { name: entry.name, char: entry.char, emote: entry.emote, level: entry.level });
  }
  localStorage.setItem(LKEY, JSON.stringify(L));

  const f = await firestore().catch(() => null);
  if (!f) return;
  const { db, api } = f;
  await Promise.all(
    ids.map(async (id) => {
      const ref = api.doc(db, 'boards', id, 'entries', player.id);
      const snap = await api.getDoc(ref);
      const prev = snap.exists() ? snap.data() : null;
      if (!prev || score > prev.score) await api.setDoc(ref, entry);
      else if (prev.name !== entry.name || prev.char !== entry.char || prev.emote !== entry.emote || prev.level !== entry.level)
        await api.setDoc(ref, { ...entry, score: prev.score, ts: prev.ts });
    })
  ).catch((e) => console.warn('שמירת תוצאה נכשלה', e));
}

export async function fetchBoard(id, n = 50) {
  const f = await firestore().catch(() => null);
  if (f) {
    try {
      const { db, api } = f;
      const q = api.query(api.collection(db, 'boards', id, 'entries'), api.orderBy('score', 'desc'), api.limit(n));
      const snap = await api.getDocs(q);
      return { online: true, rows: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      console.warn('טעינת טבלה נכשלה', e);
    }
  }
  const L = local()[id] || {};
  const rows = Object.entries(L)
    .map(([pid, e]) => ({ id: pid, ...e }))
    .sort((a, b) => b.score - a.score);
  return { online: false, rows };
}

// האם זכיתי במקום ראשון בשבוע שעבר / אתמול?
export async function previousWinner(kind) {
  const d = new Date();
  d.setDate(d.getDate() - (kind === 'week' ? 7 : 1));
  const id = boardId[kind](d);
  if (!online) return null;
  const r = await fetchBoard(id, 1);
  return r.online && r.rows[0] ? { key: id, winnerId: r.rows[0].id } : null;
}
